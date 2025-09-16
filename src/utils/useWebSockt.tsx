import { useEffect, useRef } from "react";

interface Options {
  url: string;
  onMessage?: (msg: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (err: Event) => void;
  reconnectInterval?: number; // 重连间隔（默认 3000ms）
  heartbeatInterval?: number; // 心跳间隔（默认 10000ms）
}

export const useWebSocket = (options: Options) => {
  const {
    url,
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectInterval = 3000,
    heartbeatInterval = 10000,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  // 建立连接
  const connect = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      onOpen?.();
      startHeartbeat();
    };

    ws.onmessage = (event) => {
      onMessage?.(event.data);
    };

    ws.onerror = (err) => {
      onError?.(err);
    };

    ws.onclose = () => {
      onClose?.();
      stopHeartbeat();
      scheduleReconnect();
    };
  };

  // 关闭连接
  const close = () => {
    stopHeartbeat();
    reconnectTimer.current && clearTimeout(reconnectTimer.current);
    wsRef.current?.close();
  };

  // 发送消息
  const send = (msg: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(msg);
    }
  };

  // 启动心跳
  const startHeartbeat = () => {
    stopHeartbeat();
    heartbeatTimer.current = setInterval(() => {
      send("ping");
    }, heartbeatInterval);
  };

  // 停止心跳
  const stopHeartbeat = () => {
    if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
  };

  // 计划重连
  const scheduleReconnect = () => {
    reconnectTimer.current && clearTimeout(reconnectTimer.current);
    reconnectTimer.current = setTimeout(() => {
      connect();
    }, reconnectInterval);
  };

  useEffect(() => {
    connect();
    return () => {
      close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { send, close };
};
