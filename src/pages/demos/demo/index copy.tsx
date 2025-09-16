import ProCard from "@ant-design/pro-card";
import { Button, Space, message } from "antd";
import React, { useEffect, useRef, useState } from "react";

const LogTerminal: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const logEndRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 滚动到最新日志
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // 模拟生成日志
  const generateLog = () => {
    const samples = [
      "开始检测网络连接...",
      "网络连接成功",
      "正在检测数据库连接...",
      "数据库连接失败",
      "正在检测磁盘空间...",
      "磁盘空间充足",
      "系统自检完成",
    ];
    const index = Math.floor(Math.random() * samples.length);
    return samples[index];
  };

  // 启动自检（模拟）
  const startCheck = () => {
    if (running) {
      message.warning("自检已在运行中");
      return;
    }
    setRunning(true);
    setLogs((prev) => [...prev, "✅ 自检开始...\n"]);

    timerRef.current = setInterval(() => {
      const msg = generateLog();
      setLogs((prev) => [...prev, msg]);
    }, 1000);
  };

  // 停止自检
  const stopCheck = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false);
    setLogs((prev) => [...prev, "🛑 自检已停止\n"]);
  };

  // 导出日志
  const exportLogs = () => {
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

  // 渲染日志内容（带关键字高亮）
  const renderLogLine = (line: string, index: number) => {
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
  };

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
        {logs.map((line, index) => renderLogLine(line, index))}
        <div ref={logEndRef} />
      </div>

      <Space style={{ marginTop: 16 }}>
        <Button type="primary" onClick={startCheck} disabled={running}>
          {running ? "运行中..." : "开始自检"}
        </Button>
        <Button danger onClick={stopCheck} disabled={!running}>
          停止自检
        </Button>
        <Button onClick={exportLogs}>导出日志</Button>
      </Space>
    </ProCard>
  );
};

export default LogTerminal;
