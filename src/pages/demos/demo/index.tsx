import { useWebSocket } from "@/utils/useWebSockt";
import ProCard from "@ant-design/pro-card";
import { Button, Space, message } from "antd";
import React, { useEffect, useRef, useState } from "react";

const LogTerminal: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [manualStop, setManualStop] = useState(false); // 是否手动停止
  const logEndRef = useRef<HTMLDivElement | null>(null);

  // 工具函数：避免重复日志
  const appendLog = (text: string) => {
    setLogs((prev) => {
      if (prev[prev.length - 1] === text) return prev; // 不重复
      return [...prev, text];
    });
  };

  const { send, close } = useWebSocket({
    url: "ws://localhost:8080/self-check",
    onOpen: () => {
      appendLog("🔗 已连接 WebSocket，自检开始...\n");
      setRunning(true);
      setManualStop(false); // 重置标记
    },
    onMessage: (msg) => {
      if (msg === "pong") return; // 忽略心跳
      appendLog(msg);
    },
    onClose: () => {
      if (manualStop) {
        appendLog("🛑 自检已停止\n");
      } else {
        appendLog("⚠️ WebSocket 断开，尝试重连...\n");
      }
      setRunning(false);
    },
    onError: () => {
      message.error("WebSocket 出错");
    },
    reconnectInterval: 5000, // 自动重连间隔
    heartbeatInterval: 15000, // 心跳间隔
  });

  // 自动滚动到底部
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // 开始自检
  const startCheck = () => {
    setLogs([]);
    send("start-check"); // 通知后端开始
  };

  // 停止自检
  const stopCheck = () => {
    setManualStop(true);
    send("stop-check"); // 通知后端
    close(); // 主动关闭连接
    setRunning(false);
  };

  // 导出日志
  const exportLogs = () => {
    if (logs.length === 0) {
      message.warning("没有可导出的日志");
      return;
    }
    const blob = new Blob([logs.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "self-check-log.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  // 清空日志
  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <ProCard title="自检日志" bordered headerBordered>
      {/* 日志展示区域 */}
      <div
        style={{
          background: "#000",
          color: "#fff",
          padding: "10px",
          height: "400px",
          overflowY: "auto",
          fontFamily: "monospace",
          fontSize: "14px",
          borderRadius: 6,
        }}
      >
        {logs.map((line, index) => {
          let style: React.CSSProperties = { whiteSpace: "pre-wrap" };
          if (line.includes("错误") || line.includes("失败")) {
            style.color = "red";
          } else if (line.includes("成功") || line.includes("完成")) {
            style.color = "green";
          }
          return (
            <div key={index} style={style}>
              {line}
            </div>
          );
        })}
        <div ref={logEndRef} />
      </div>

      {/* 操作按钮 */}
      <Space style={{ marginTop: 16 }}>
        <Button type="primary" onClick={startCheck} disabled={running}>
          {running ? "运行中..." : "开始自检"}
        </Button>
        <Button danger onClick={stopCheck} disabled={!running}>
          停止自检
        </Button>
        <Button onClick={exportLogs}>导出日志</Button>
        <Button onClick={clearLogs}>清空日志</Button>
      </Space>
    </ProCard>
  );
};

export default LogTerminal;
