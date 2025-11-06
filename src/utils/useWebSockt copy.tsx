// src/utils/useWebSocket.ts
import { useEffect, useRef } from "react";

export interface UseWsOptions {
  url: string;
  protocols?: string | string[];

  onOpen?: () => void;
  onMessage?: (data: any, ev?: MessageEvent) => void;
  onClose?: (ev?: CloseEvent) => void;
  onError?: (ev?: Event) => void;

  /** 自动重连的基础间隔(ms)，结合指数回退使用。默认 3000 */
  reconnectInterval?: number;
  /** 最大重连次数；null/undefined 表示不限制 */
  maxReconnectAttempts?: number | null;

  /** 心跳间隔(ms)；<=0 关闭心跳。默认 10000 */
  heartbeatInterval?: number;
  /** 心跳报文。默认 { type: 'ping' } */
  heartbeatPayload?: any;
  /** 看门狗超时倍数。默认 3（即 3 * heartbeatInterval 未收到任何消息则断开重连） */
  watchdogMultiplier?: number;

  /** 是否在挂载时自动连接。默认 true */
  autoConnect?: boolean;

  /** 连接中允许排队发送。默认 true */
  queueWhileConnecting?: boolean;
  /** 发送时如果已断开，是否自动重连后发送。默认 true */
  autoReconnectOnSend?: boolean;

  /** 可选：配置 ws.binaryType，常见 'blob' | 'arraybuffer' */
  binaryType?: BinaryType;
}

export function useWebSocket(options: UseWsOptions) {
  const {
    url,
    protocols,
    onOpen,
    onMessage,
    onClose,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = null,
    heartbeatInterval = 10000,
    heartbeatPayload = { type: "ping" },
    watchdogMultiplier = 3,
    autoConnect = true,
    queueWhileConnecting = true,
    autoReconnectOnSend = true,
    binaryType,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchdogTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  /** 手动关闭标记：true 时 onclose 不触发重连 */
  const manualCloseRef = useRef(false);
  /** 已重连次数（用于指数回退） */
  const reconnectAttemptsRef = useRef(0);
  /** 最近一次收到任何消息的时间戳（用于看门狗） */
  const lastActivityAt = useRef<number>(Date.now());
  /** 发送队列（CONNECTING 或待重连时缓存） */
  const sendQueue = useRef<(string | ArrayBuffer | Blob)[]>([]);

  /** —— 工具：发消息（字符串/对象）—— */
  const _rawSend = (msg: string | Record<string, any> | ArrayBuffer | Blob) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      if (
        typeof msg === "string" ||
        msg instanceof ArrayBuffer ||
        msg instanceof Blob
      ) {
        ws.send(msg as any);
      } else {
        ws.send(JSON.stringify(msg));
      }
      return true;
    } catch {
      return false;
    }
  };

  /** 暴露的 send：带队列/自动重连能力 */
  const send = (
    msg: string | Record<string, any> | ArrayBuffer | Blob
  ): boolean => {
    const ws = wsRef.current;
    const state = ws?.readyState;

    // OPEN 直接发
    if (state === WebSocket.OPEN) return _rawSend(msg);

    // CONNECTING：按配置入队
    if (state === WebSocket.CONNECTING && queueWhileConnecting) {
      sendQueue.current.push(serializeForQueue(msg));
      return true;
    }

    // 其它状态：按配置自动重连并入队
    if (autoReconnectOnSend) {
      sendQueue.current.push(serializeForQueue(msg));
      reconnect();
      return true;
    }

    return false;
  };

  /** 队列序列化（对象转字符串） */
  const serializeForQueue = (m: any): any => {
    if (typeof m === "string" || m instanceof ArrayBuffer || m instanceof Blob)
      return m;
    try {
      return JSON.stringify(m);
    } catch {
      return String(m);
    }
  };

  /** 刷新队列 */
  const flushQueue = () => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    while (sendQueue.current.length) {
      const p = sendQueue.current.shift()!;
      try {
        ws.send(p as any);
      } catch {
        // 发送失败，留给下次 flush
        sendQueue.current.unshift(p);
        break;
      }
    }
  };

  /** —— 心跳 —— */
  const startHeartbeat = () => {
    stopHeartbeat();
    if (!heartbeatInterval || heartbeatInterval <= 0) return;
    heartbeatTimer.current = setInterval(() => {
      _rawSend(
        typeof heartbeatPayload === "string"
          ? heartbeatPayload
          : JSON.stringify(heartbeatPayload)
      );
    }, heartbeatInterval);
  };
  const stopHeartbeat = () => {
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current);
      heartbeatTimer.current = null;
    }
  };

  /** —— 看门狗：未收到任何消息超时则断开触发重连 —— */
  const startWatchdog = () => {
    stopWatchdog();
    if (!heartbeatInterval || heartbeatInterval <= 0) return;
    const ttl = heartbeatInterval * Math.max(1, watchdogMultiplier);
    watchdogTimer.current = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      if (Date.now() - lastActivityAt.current > ttl) {
        try {
          wsRef.current?.close(4000, "Heartbeat missed");
        } catch {}
      }
    }, Math.max(heartbeatInterval, 1000));
  };
  const stopWatchdog = () => {
    if (watchdogTimer.current) {
      clearInterval(watchdogTimer.current);
      watchdogTimer.current = null;
    }
  };

  /** —— 重连：指数回退 —— */
  const scheduleReconnect = () => {
    if (manualCloseRef.current) return;

    if (
      typeof maxReconnectAttempts === "number" &&
      maxReconnectAttempts >= 0 &&
      reconnectAttemptsRef.current >= maxReconnectAttempts
    ) {
      return;
    }

    const attempt = reconnectAttemptsRef.current;
    const backoff = Math.min(30000, reconnectInterval * Math.pow(2, attempt)); // 封顶 30s

    reconnectTimer.current && clearTimeout(reconnectTimer.current);
    reconnectTimer.current = setTimeout(() => {
      reconnectAttemptsRef.current += 1;
      connect();
    }, Math.max(500, backoff));
  };

  /** —— 建立连接 —— */
  const connect = () => {
    // 已连/正在连则跳过
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    manualCloseRef.current = false; // 新连接重置“手动关闭”标记
    try {
      const ws = protocols ? new WebSocket(url, protocols) : new WebSocket(url);
      if (binaryType) ws.binaryType = binaryType;
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
        lastActivityAt.current = Date.now();
        startHeartbeat();
        startWatchdog();
        onOpen?.();
        flushQueue();
      };

      ws.onmessage = (ev: MessageEvent) => {
        lastActivityAt.current = Date.now();
        onMessage?.(parseMaybeJSON(ev.data), ev);
      };

      ws.onerror = (ev: Event) => {
        onError?.(ev);
      };

      ws.onclose = (ev: CloseEvent) => {
        stopHeartbeat();
        stopWatchdog();
        onClose?.(ev);
        if (!manualCloseRef.current) scheduleReconnect();
      };
    } catch {
      scheduleReconnect();
    }
  };

  /** —— 关闭：可指明 disableReconnect —— */
  const close = (opts?: {
    disableReconnect?: boolean;
    code?: number;
    reason?: string;
  }) => {
    if (opts?.disableReconnect) manualCloseRef.current = true;

    reconnectTimer.current && clearTimeout(reconnectTimer.current);
    reconnectTimer.current = null;

    stopHeartbeat();
    stopWatchdog();

    const ws = wsRef.current;
    try {
      if (
        ws &&
        (ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING)
      ) {
        ws.close(opts?.code, opts?.reason);
      }
    } catch {}
    wsRef.current = null;
  };

  /** —— 手动重连：关闭旧连接 → 立即 connect —— */
  const reconnect = () => {
    manualCloseRef.current = false;
    reconnectAttemptsRef.current = 0;
    close(); // 不带 disableReconnect
    connect();
  };

  /** —— 网络上下线联动（可稳定体验） —— */
  useEffect(() => {
    const offline = () => {
      manualCloseRef.current = true;
      close({ disableReconnect: true });
    };
    const online = () => {
      manualCloseRef.current = false;
      reconnect();
    };
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
    };
  }, []);

  /** —— 生命周期：挂载自动连，卸载有意关闭 —— */
  useEffect(() => {
    if (autoConnect) connect();
    return () => {
      manualCloseRef.current = true;
      close({ disableReconnect: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return {
    send,
    close,
    reconnect,
    connect,
    /** 只读：底层 ws */
    get socket() {
      return wsRef.current;
    },
    /** 只读：0 CONNECTING, 1 OPEN, 2 CLOSING, 3 CLOSED */
    get readyState() {
      return wsRef.current?.readyState ?? WebSocket.CLOSED;
    },
  };
}

/** 尝试把字符串解析为 JSON；失败则返回原值 */
function parseMaybeJSON(data: any) {
  if (typeof data !== "string") return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}
