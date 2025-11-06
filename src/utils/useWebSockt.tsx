// src/utils/useWebSocket.ts
import { useEffect, useRef } from "react";

export interface UseWsOptions {
  url: string;
  protocols?: string | string[];

  onOpen?: () => void;
  onMessage?: (data: any, ev?: MessageEvent) => void;
  onClose?: (ev?: CloseEvent) => void;
  onError?: (ev?: Event) => void;

  /** 自动重连间隔(ms)，默认 3000 */
  reconnectInterval?: number;
  /** 最大重连次数；null/undefined 表示无限次 */
  maxReconnectAttempts?: number | null;

  /** 心跳间隔(ms)；<=0 关闭心跳，默认 10000 */
  heartbeatInterval?: number;
  /** 心跳报文；默认 { type: "ping" } */
  heartbeatPayload?: any;

  /** 挂载时自动连接，默认 true */
  autoConnect?: boolean;
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
    autoConnect = true,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  /** 有意关闭：true 则 onclose 不再重连 */
  const manualCloseRef = useRef(false);
  /** 已重连次数（简单计数） */
  const reconnectAttemptsRef = useRef(0);

  /** 尝试 JSON 解析 */
  const parseMaybeJSON = (data: any) => {
    if (typeof data !== "string") return data;
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  };

  /** 发送（字符串或对象） */
  const send = (msg: string | Record<string, any>): boolean => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      const payload = typeof msg === "string" ? msg : JSON.stringify(msg);

      console.log("WS → send:", payload); // 新增：发送侧日志
      ws.send(payload);
      return true;
    } catch {
      return false;
    }
  };

  /** 启停心跳 */
  const startHeartbeat = () => {
    stopHeartbeat();
    if (!heartbeatInterval || heartbeatInterval <= 0) return;
    heartbeatTimer.current = setInterval(() => {
      console.log("WS → heartbeat:", heartbeatPayload); // 新增：心跳日志
      send(heartbeatPayload);
    }, heartbeatInterval);
  };
  const stopHeartbeat = () => {
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current);
      heartbeatTimer.current = null;
    }
  };

  /** 计划重连（简单固定间隔） */
  const scheduleReconnect = () => {
    if (manualCloseRef.current) return;
    if (
      typeof maxReconnectAttempts === "number" &&
      maxReconnectAttempts >= 0 &&
      reconnectAttemptsRef.current >= maxReconnectAttempts
    ) {
      return;
    }
    reconnectTimer.current && clearTimeout(reconnectTimer.current);
    reconnectTimer.current = setTimeout(() => {
      reconnectAttemptsRef.current += 1;
      connect();
    }, Math.max(500, reconnectInterval));
  };

  /** 建立连接 */
  const connect = () => {
    // 已连接或正在连接则不重复
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    manualCloseRef.current = false;

    try {
      const ws = protocols ? new WebSocket(url, protocols) : new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
        startHeartbeat();
        onOpen?.();
      };

      ws.onmessage = (ev: MessageEvent) => {
        onMessage?.(parseMaybeJSON(ev.data), ev);
      };

      ws.onerror = (ev: Event) => {
        onError?.(ev);
      };

      ws.onclose = (ev: CloseEvent) => {
        stopHeartbeat();
        onClose?.(ev);
        if (!manualCloseRef.current) scheduleReconnect();
      };
    } catch {
      scheduleReconnect();
    }
  };

  /** 关闭；disableReconnect=true 表示“有意关闭不重连” */
  const close = (opts?: {
    disableReconnect?: boolean;
    code?: number;
    reason?: string;
  }) => {
    if (opts?.disableReconnect) manualCloseRef.current = true;

    reconnectTimer.current && clearTimeout(reconnectTimer.current);
    reconnectTimer.current = null;

    stopHeartbeat();

    const ws = wsRef.current;
    try {
      if (
        ws &&
        (ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING)
      ) {
        ws.close(opts?.code, opts?.reason);
      }
    } catch {
      // ignore
    }
    wsRef.current = null;
  };

  /** 手动重连：关闭旧连接再连一次 */
  const reconnect = () => {
    manualCloseRef.current = false;
    reconnectAttemptsRef.current = 0;
    close(); // 不禁止重连
    connect();
  };

  /** 生命周期：挂载自动连接；卸载时“有意关闭” */
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
