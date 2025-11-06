import { useWebSocket } from "@/utils/useWebSockt"; // ✅ 注意拼写
import ProCard from "@ant-design/pro-card";
import { Button, Space, message as antdMessage } from "antd";
import React, { useEffect, useRef, useState } from "react";

type WSDown =
  | { type: "message"; data: string; runId?: string; ts?: number }
  | { type: "selfcheck_msg"; data: string; runId?: string; ts?: number }
  | {
      type: "progress";
      data: { percent?: number; done?: number; total?: number };
      runId?: string;
    }
  | { type: "result"; data: any; runId?: string }
  | {
      type: "start_accepted";
      data: { runId: string; totalSteps?: number };
      runId: string;
    }
  | { type: "stopped"; data?: any; runId?: string }
  | {
      type: "error";
      data: { code: string; message: string; detail?: any };
      runId?: string;
    }
  | { type: "pong"; [k: string]: any }
  | { type: string; [k: string]: any }; // 容错

const LogTerminal: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [runId, setRunId] = useState<string | undefined>(undefined);
  // const [manualStop, setManualStop] = useState(false);
  const logEndRef = useRef<HTMLDivElement | null>(null);
  const stopTimeoutRef = useRef<number | null>(null);

  // —— 工具：避免重复日志
  const appendLog = (text: string) => {
    setLogs((prev) => {
      if (prev[prev.length - 1] === text) return prev;
      return [...prev, text];
    });
  };

  const { send, close } = useWebSocket({
    // url: "ws://117.133.25.215:8080", // 若后端有路径，别忘了加 /xxx
    url: "ws://localhost:8080",
    onOpen: () => {
      appendLog("🔗 已连接 WebSocket\n");
      // setManualStop(false);
      // 连接建立后是否立刻开始自检？保留你现有逻辑的话，点按钮再发 RUN。
    },
    onMessage: (raw) => {
      console.log("MSg=====", raw);

      // ✅ 尝试解析 JSON；如果是纯文本就原样追加
      let msg: WSDown | null = null;
      try {
        msg = JSON.parse(raw);
      } catch {
        // 兼容纯文本
        if (raw === "pong") return;
        appendLog(String(raw));
        return;
      }

      // 心跳
      if (msg.type === "pong") return;

      switch (msg.type) {
        case "start_accepted": {
          const id = msg.runId ?? msg.data?.runId;
          if (id) setRunId(id);
          setRunning(true);
          appendLog(`▶️ 开始自检 runId=${id || "-"}\n`);
          break;
        }
        case "message":
          appendLog(msg.data);
          break;

        case "selfcheck_msg":
          appendLog(`[自检] ${msg.data}`);
          break;

        case "progress": {
          const p =
            msg.data?.percent ??
            (msg.data?.done && msg.data?.total
              ? Number(((msg.data.done / msg.data.total) * 100).toFixed(1))
              : undefined);
          if (typeof p === "number") appendLog(`⏳ 进度：${p}%`);
          break;
        }

        case "result": {
          const { scope, name, status } = (msg as any).data || {};
          if (scope === "item") {
            appendLog(`📄 [${status}] ${name}`);
          } else if (scope === "suite") {
            appendLog(`✅ 汇总：${status} ${name ?? ""}\n`);
            setRunning(false);
          } else {
            appendLog(`📝 结果：${JSON.stringify(msg.data)}`);
          }
          break;
        }

        case "stopped":
          appendLog("🛑 已停止\n");
          clearStopTimer();
          setRunning(false);
          break;

        case "error":
          appendLog(
            `❌ 错误：${msg.data?.code || ""} ${msg.data?.message || ""}`
          );
          break;

        default:
          // 其他未覆盖类型，原样展示
          appendLog(
            `[${msg.type}] ${JSON.stringify((msg as any).data ?? msg)}`
          );
      }
    },
    onClose: () => {
      // if (manualStop) {
      //   appendLog("🛑 连接已关闭\n");
      // } else {
      //   appendLog("⚠️ WebSocket 断开，尝试重连...\n");
      // }
      setRunning(false);
    },
    onError: () => {
      antdMessage.error("WebSocket 出错");
    },
    reconnectInterval: 15000,
    heartbeatInterval: 15000, // 你的 hook 里记得发 {type:'ping'}
  });

  // 自动滚动到底部
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // 开始自检
  const startCheck = () => {
    setLogs([]);
    setRunId(undefined);

    send({ type: "RUN", data: { id: "YSW.tpf" } });
  };

  // 停止自检（建议：发 STOP → 等 stopped 回包 → 再 close；若超时则强制关闭）
  const stopCheck = () => {
    // setManualStop(true);
    if (runId) {
      send({ type: "STOP", runId }); // 建议带上 runId
    } else {
      send({ type: "STOP" });
    }
    // 等待后端回 "stopped"，若 3s 内没等到则主动关闭
    clearStopTimer();
    stopTimeoutRef.current = window.setTimeout(() => {
      appendLog("⏱ 停止超时，强制断开连接\n");
      close();
      // onclose();
      setRunning(false);
    }, 3000);
  };

  const clearStopTimer = () => {
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
  };

  // 导出/清空日志
  const exportLogs = () => {
    if (logs.length === 0) {
      antdMessage.warning("没有可导出的日志");
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

  const clearLogs = () => setLogs([]);

  return (
    <ProCard title="自检日志" bordered headerBordered>
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
          if (line.includes("错误") || line.includes("失败"))
            style.color = "red";
          else if (
            line.includes("成功") ||
            line.includes("完成") ||
            line.includes("PASS")
          )
            style.color = "green";
          return (
            <div key={index} style={style}>
              {line}
            </div>
          );
        })}
        <div ref={logEndRef} />
      </div>

      <Space style={{ marginTop: 16 }}>
        <Button type="primary" onClick={startCheck} disabled={running}>
          {running ? "运行中..." : "开始自检"}
        </Button>
        <Button danger onClick={stopCheck}>
          {/* disabled={!running} */}
          停止自检
        </Button>
        <Button onClick={exportLogs}>导出日志</Button>
        <Button onClick={clearLogs}>清空日志</Button>
      </Space>
    </ProCard>
  );
};

export default LogTerminal;
