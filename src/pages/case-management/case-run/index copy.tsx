import { useWebSocket } from "@/utils/useWebSockt";
import { dispatchDown } from "@/utils/ws/dispatch";
import type { UpMsg } from "@/utils/ws/protocol";
import {
  BarsOutlined,
  BookOutlined,
  CaretRightOutlined,
  CloseOutlined,
  EnterOutlined,
  HomeOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { history, useParams, useSearchParams } from "@umijs/max";
import { useSetState } from "ahooks";
import {
  Button,
  Card,
  Col,
  Dropdown,
  message,
  Radio,
  Row,
  Space,
  Tabs,
} from "antd";
import React, { useEffect, useRef } from "react";
import ReportInfoModal from "./components/reportInfoModal";
import RunLeftPage from "./components/runLeftPage";
import TestCondition from "./components/testCondition";
import TestInfo from "./components/testInfo";
import TestInfoModal from "./components/testInfoModal";
import TestResult from "./components/testResult";
import VectorInfoModal from "./components/vectorInfoModal";
import "./index.less";

type ItemResultData = {
  itemindex: number;
  itemname: string;
  testtime: string | number;
  resultInfo: {
    resultid: number;
    name: string;
    value: string;
    result: "PASS" | "FAIL" | "SKIP" | "RUNNING" | "PENDING";
  }[];
};

const Page: React.FC = () => {
  const runLeftRef = useRef<any>(null);
  const [searchParams] = useSearchParams();
  const params = useParams();

  const [state, setState] = useSetState<any>({
    isShowAllBtn: false,
    title: null,
    breakpoints: [],
    // 显示最后的结果，测试成功“PASS”,测试失败“FAIL”；
    // 暂停，显示“BREAK”;当处于运行状态显示“TEST”；
    // 当命令对应设备通信DLL不存在发生错误“ERROR”
    currentStatus: "IDLE", // ✅ 初始空闲：IDLE | TEST | BREAK | PASS | FAIL | ERROR
    tabActiveKey: "2",
    dataSource: [],
    isSelfCheck: false,
    selfCheckMessages: [],
    isSelfChecking: false,
    stepMode: null,
    isReportInfoModalOpen: false,
    isTestInfoModalOpen: false,
    isVectorInfoModalOpen: false,
    tabItems: [
      { key: "1", label: "测试信息", icon: <HomeOutlined /> },
      { key: "2", label: "测试结果", icon: <BookOutlined /> },
      { key: "3", label: "测试条件", icon: <BarsOutlined /> },
    ],
    items: [
      { key: "1", label: "测试信息" },
      { key: "2", label: "报告信息" },
      { key: "3", label: "VECTOR通道配置" },
      { key: "4", label: "自检" },
    ],
    disableClearAll: true,
    selectRowData: null,
    // 补充
    runId: undefined,
    logs: [] as string[],
    progress: 0,
    totalResult: null as any,
    currentItemCmd: { itemindex: 0, cmdindex: 0, itemname: "", cmdname: "" },
    runningWS: false,
    itemResults: [] as ItemResultData[],
    allLogs: [] as string[], // 所有日志（字符串）
    runLogs: [] as {
      time: string;
      status: "SUCCESS" | "FAIL" | "INFO";
      message: string;
    }[],
  });

  useEffect(() => {
    setState({
      title: searchParams.get("name") || "-",
      isShowAllBtn: searchParams.get("status") === "all",
    });
  }, []);

  const appendLog = (text: string) => {
    setState((prev: any) => ({
      logs:
        prev.logs?.[prev.logs.length - 1] === text
          ? prev.logs
          : [...(prev.logs || []), text],
    }));
  };
  const appendAllLog = (text: string) => {
    setState((prev: any) => ({
      allLogs:
        prev.allLogs?.[prev.allLogs.length - 1] === text
          ? prev.allLogs
          : [...(prev.allLogs || []), text],
    }));
  };

  /** 追加到 runLogs（运行日志，结构化对象） */
  const appendRunLog = (
    message: string,
    status: "SUCCESS" | "FAIL" | "INFO" = "INFO"
  ) => {
    const time = new Date().toLocaleString();
    setState((prev: any) => ({
      runLogs: [...(prev.runLogs || []), { time, status, message }],
    }));
    appendAllLog(`[${time}] ${status} → ${message}`);
  };
  /** ============ 安全发送器：锁 + 限流 ============ */
  type CommandKey =
    | "RUN"
    | "STOP"
    | "PAUSE"
    | "GO"
    | "STEP"
    | "BKPOINT"
    | "SelfTest";
  const cmdLocks = useRef<Record<CommandKey, boolean>>({
    RUN: false,
    STOP: false,
    PAUSE: false,
    GO: false,
    STEP: false,
    BKPOINT: false,
    SelfTest: false,
  });
  const lastSentAt = useRef<Record<CommandKey, number>>({} as any);
  const releaseLock = (type: CommandKey) => {
    cmdLocks.current[type] = false;
  };
  /** 把后端 TestProcess 的不同层级统一成我们前端用的结构 */
  function normalizeTestProcess(raw: any) {
    // 后端包基本是 { type:'TestProcess', data:{ ... } }
    const payload = raw?.data ?? raw;

    const code = payload?.code ?? raw?.code;
    const info = payload?.info ?? payload; // code:2/3 在 info 里；code:1 直接在 data

    // 兼容 Message(s) 两种写法
    const message = info?.Messages ?? info?.Message;

    // code:1（过程）
    if (code === 1) {
      return {
        code: 1,
        itemindex: info?.itemindex,
        itemname: info?.itemname,
        cmdindex: info?.cmdindex,
        cmdname: info?.cmdname,
        progress:
          typeof info?.Progress === "number" ? info?.Progress : undefined,
        message,
      };
    }

    // code:2（项目结束）
    if (code === 2) {
      const ri = info?.resultInfo || info?.resultinfo || [];
      // 后端字段可能是 Value/Result/Name，转成 value/result/name
      const resultInfo = ri.map((r: any) => ({
        resultid: r?.resultid ?? r?.id ?? r?.ResultId,
        name: r?.name ?? r?.Name,
        value: r?.value ?? r?.Value,
        result: r?.result ?? r?.Result,
      }));
      return {
        code: 2,
        data: {
          itemindex: info?.itemindex,
          itemname: info?.itemname,
          testtime: info?.testtime,
          resultInfo,
        },
      };
    }

    // code:3（总结果）
    if (code === 3) {
      return {
        code: 3,
        data: {
          Result: info?.Result,
          TestEndTime: info?.TestEndTime,
          TotalTesttime: info?.TotalTesttime,
        },
      };
    }

    return { code, data: info };
  }

  const { send, close } = useWebSocket({
    url: "ws://117.133.25.215:8000/ws/",
    onOpen: () => {
      appendAllLog("🔗 WebSocket 连接已建立");
      setState({ currentStatus: "IDLE" }); // ✅ 连接后仍为空闲
    },
    onMessage: (raw) => {
      let msg = raw;
      console.log("msg====", msg);

      // try {
      //   msg = typeof raw === "string" ? JSON.parse(raw) : raw;
      // } catch {
      //   appendAllLog(`${String(raw)}`);
      //   return;
      // }

      // ------------------------------
      // 处理测试过程类消息（TestProcess）
      // ------------------------------
      const n = normalizeTestProcess(msg);
      if (msg.type === "TestProcess") {
        console.log("n====", n);

        if (n.code === 1) {
          const status = n.status === 1 ? "FAIL" : "SUCCESS";
          const message =
            n.message ??
            `${n.itemname ?? "-"} - ${n.cmdname ?? "-"} 进度 ${
              n.progress ?? 0
            }%`;

          appendRunLog(message, status); // ✅ 结构化运行日志

          setState((prev: any) => ({
            currentItemCmd: {
              itemindex: n.itemindex,
              cmdindex: n.cmdindex,
              itemname: n.itemname,
              cmdname: n.cmdname,
            },
            progress:
              typeof n.progress === "number" ? n.progress : prev.progress,
            currentStatus: "TEST",
          }));

          return;
        }
        if (n.code === 2) {
          setState((prev: any) => ({
            itemResults: [...prev.itemResults, n.data],
          }));
          appendAllLog(`项目结果：${n.data?.itemname ?? "-"} 已完成`);
          return;
        }

        if (n.code === 3) {
          setState({
            currentStatus: n.data?.Result || "ERROR",
            progress: 100,
          });
          appendRunLog(
            `总结果：${n.data?.Result} 结束时间：${n.data?.TestEndTime}`,
            n.data?.Result === "PASS" ? "SUCCESS" : "FAIL"
          );
          // 总结果后关闭连接（不重连）
          setTimeout(() => close({ disableReconnect: true }), 200);
          return;
        }
      }
      switch (msg.type) {
        case "RUN":
          releaseLock("RUN");
          const timestamp = new Date().toLocaleString();
          const text = `${timestamp}`;
          if (n?.code === 0) {
            setState({
              currentStatus: "TEST",
              itemResults: [], // ✅ 再确保清空
              progress: 0,
            });
          }
          const co = n?.code === 0 ? "SUCCESS" : "FAIL";
          appendRunLog(text, co);
          appendAllLog(`RUN → ${text}`);
          break;

        case "STOP":
          releaseLock("STOP");
          if (msg.code === 0) {
            appendAllLog(
              `STOP → ${msg.message} (Item=${msg.CurrentItem}, Cmd=${msg.CurrentCmd})`
            );
            setState({
              currentStatus: "IDLE",
              progress: 0,
            });
            // 200ms 后安全关闭 websocket，不重连
            setTimeout(() => close({ disableReconnect: true }), 200);
          } else {
            appendAllLog(` STOP 失败：${msg.message}`);
          }
          break;

        case "PAUSE":
          releaseLock("PAUSE");
          if (msg.code === 1) {
            setState({ currentStatus: "BREAK" });
            appendAllLog(`⏸ 暂停成功：${msg.message}`);
          } else {
            appendAllLog(`❌ 暂停失败：${msg.message}`);
          }
          break;

        case "GO":
          releaseLock("GO");
          if (msg.code === 0) {
            setState({ currentStatus: "TEST" });
            appendAllLog(`▶️ 继续测试：${msg.message}`);
          }
          break;

        case "STEP":
          releaseLock("STEP");
          appendAllLog(`🧩 单步测试：${msg.message}`);
          break;

        case "BKPOINT":
          releaseLock("BKPOINT");
          appendAllLog(`🎯 断点设置：${msg.message}`);
          break;

        case "SelfTest":
        case "SelfTestAll":
          releaseLock("SelfTest");
          setState({ isSelfChecking: false });
          appendAllLog(`🧪 自检：${msg.message || "完成"}`);
          break;
        default:
          break;
      }

      // return;
      // ------------------------------
      // 其他未识别类型，仍交给 dispatchDown
      // ------------------------------

      return;
      dispatchDown(raw, {
        appendLog,
        setRunning: (b) => setState({ runningWS: b }),
        setProgress: (p) => setState({ progress: p }),
        highlight: ({ itemindex, cmdindex, itemname, cmdname }) =>
          setState({
            currentItemCmd: { itemindex, cmdindex, itemname, cmdname },
          }),
        pushItemResult: (d) =>
          setState((prev: any) => ({ itemResults: [...prev.itemResults, d] })),
        setTotalResult: (d) => setState({ totalResult: d }),
      });
    },

    onClose: () => appendLog("⚠️ WebSocket 已断开"),
    onError: () => message.error("WebSocket 出错"),
    reconnectInterval: 15000,
    heartbeatInterval: 15000,
  });

  // 统一发送入口：加锁 + 限流
  const sendCommand = (
    msg: UpMsg,
    opts?: { lock?: boolean; minInterval?: number }
  ) => {
    const type = msg.type as CommandKey;
    const lock = opts?.lock ?? true;
    const minInterval = opts?.minInterval ?? 1200;
    const now = Date.now();

    if (
      lastSentAt.current[type] &&
      now - lastSentAt.current[type] < minInterval
    ) {
      message.warning(`${type} 操作过于频繁，请稍后再试`);
      return false;
    }
    if (lock && cmdLocks.current[type]) {
      message.warning(`${type} 正在处理，请稍候…`);
      return false;
    }
    const ok = send(msg);
    if (!ok) {
      message.error("WebSocket 未连接，发送失败");
      return false;
    }
    lastSentAt.current[type] = now;
    if (lock) cmdLocks.current[type] = true;
    return true;
  };

  // 菜单
  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case "1":
        setState({ isTestInfoModalOpen: true });
        break;
      case "2":
        setState({ isReportInfoModalOpen: true });
        break;
      case "3":
        setState({ isVectorInfoModalOpen: true });
        break;
      case "4":
        if (state.isSelfChecking) {
          message.info("自检进行中…");
          break;
        }
        setState({ isSelfCheck: true, isSelfChecking: true });
        sendCommand({ type: "SelfTest" } as UpMsg, {
          lock: true,
          minInterval: 3000,
        });
        break;
    }
  };

  // 步骤模式变化
  const { stepMode } = state;
  const handleStepModeChange = (value: number) => {
    setState({ stepMode: stepMode === value ? null : value });
  };

  // 断点
  const hasAnyBreakpoint = (nodes: any[]): boolean =>
    nodes?.some(
      (node: any) =>
        node.breakpoint === true ||
        (node.children && hasAnyBreakpoint(node.children))
    );

  const handleClearAll = () => {
    runLeftRef.current?.clearAllBreakpoints?.();
    setState({ disableClearAll: true });
    message.success("操作成功");
  };

  const handleRowSelect = (values: any) => {
    setState({ selectRowData: { ...values } });
  };

  // === 按钮可用性 ===
  const isRunning = state.currentStatus === "TEST";
  const isPaused = state.currentStatus === "BREAK";
  const canRun = !isRunning && !state.isSelfChecking; // 可按需增加其它限制
  const resetForNewRun = () => {
    setState({
      itemResults: [], // ✅ 清空右侧 TestResult 的数据
      runLogs: [], // 可选：清空运行日志面板
      progress: 0, // 可选：进度清零
      currentItemCmd: { itemindex: 0, cmdindex: 0, itemname: "", cmdname: "" }, // 可选：指针清零
      totalResult: null, // 可选：总结果清零
    });
  };
  return (
    <PageContainer
      header={{
        title: (
          <div>
            用例执行 &nbsp;{" "}
            <span style={{ color: "#999" }}>【 {state.title} 】</span>
          </div>
        ),
        ghost: true,
        extra: [
          <Button key="1" onClick={() => history.back()}>
            返回
          </Button>,
        ],
      }}
    >
      <div className="case-run-edit">
        <Card className="operation-bar">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Space className="operation-buttons">
              <Button
                icon={<PlayCircleOutlined />}
                disabled={!canRun} // ✅ 初始 IDLE 时可执行
                onClick={() => {
                  resetForNewRun(); // ✅ 先清
                  sendCommand({ type: "RUN" } as UpMsg, {
                    lock: true,
                    minInterval: 1500,
                  });
                }}
              >
                执行
              </Button>

              <Button
                icon={<StopOutlined />}
                disabled={!isRunning} // 仅运行中可停止
                onClick={() => {
                  console.log("点击停止");

                  sendCommand({ type: "STOP" } as UpMsg, {
                    lock: true,
                    minInterval: 1200,
                  });
                }}
              >
                停止
              </Button>

              <Button
                icon={<EnterOutlined />}
                onClick={() => {
                  if (!state.selectRowData) {
                    message.warning("请选择数据后进行测试");
                    return;
                  }
                  const method = state.stepMode === 2 ? 1 : 0;
                  const { itemindex = 1, cmdindex = 1 } = state.selectRowData;
                  sendCommand(
                    {
                      type: "STEP",
                      method,
                      StartItem: itemindex,
                      StartCmd: cmdindex,
                    } as UpMsg,
                    { lock: true, minInterval: 1200 }
                  );
                }}
              >
                单项测试
              </Button>

              {state.isShowAllBtn && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button
                    icon={<CaretRightOutlined />}
                    disabled={!isPaused} // 仅暂停态可继续
                    onClick={() =>
                      sendCommand({ type: "GO" } as UpMsg, {
                        lock: true,
                        minInterval: 800,
                      })
                    }
                  >
                    继续
                  </Button>
                  <Button
                    icon={<PauseOutlined />}
                    disabled={!isRunning} // 仅运行中可暂停
                    onClick={() =>
                      sendCommand({ type: "PAUSE" } as UpMsg, {
                        lock: true,
                        minInterval: 800,
                      })
                    }
                  >
                    暂停
                  </Button>
                  <Button
                    disabled={state.disableClearAll}
                    onClick={() => {
                      sendCommand(
                        {
                          type: "BKPOINT",
                          method: 0,
                          StartItem: 0,
                          StartCmd: 0,
                        } as UpMsg,
                        { lock: true, minInterval: 800 }
                      );
                      handleClearAll();
                    }}
                    icon={<CloseOutlined />}
                  >
                    取消所有断点
                  </Button>
                  <div>
                    <Radio.Group
                      value={stepMode}
                      onChange={(e) => handleStepModeChange(e.target.value)}
                    >
                      <Radio value={1} onClick={() => handleStepModeChange(1)}>
                        项目单步
                      </Radio>
                      <Radio value={2} onClick={() => handleStepModeChange(2)}>
                        命令单步
                      </Radio>
                    </Radio.Group>
                  </div>
                </div>
              )}
            </Space>

            <div
              style={{
                minWidth: 200,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                项目编号：<span style={{ color: "#1890ff" }}>0266</span>
              </div>
              <div>
                <div style={{ cursor: "pointer" }}>
                  <Dropdown
                    menu={{ items: state.items, onClick: handleMenuClick }}
                    placement="bottom"
                  >
                    <a onClick={(e) => e.preventDefault()}>
                      <SettingOutlined />
                    </a>
                  </Dropdown>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="run-content">
          <Row gutter={24}>
            <Col span={12}>
              <RunLeftPage
                currentItemCmd={state.currentItemCmd}
                progress={state.progress}
                logs={state.runLogs}
                currentStatus={state.currentStatus}
                autoId={params.id}
                ref={runLeftRef}
                isSelfCheck={state.isSelfCheck}
                isSelfChecking={state.isSelfChecking}
                selfCheckMessages={state.selfCheckMessages}
                onRowSelect={handleRowSelect}
                breakpoints={state.breakpoints}
                onPonitChange={(data) => {
                  const hasBreakpoint = hasAnyBreakpoint(data);
                  setState({ disableClearAll: !hasBreakpoint });
                }}
              />
            </Col>

            <Col span={12}>
              <div style={{ background: "#fff" }}>
                <Tabs
                  items={state.tabItems}
                  defaultActiveKey={state.tabActiveKey}
                  onChange={(key: any) => setState({ tabActiveKey: key })}
                />
                {state.tabActiveKey === "1" && <TestInfo autoId={params.id} />}
                {state.tabActiveKey === "2" && (
                  <TestResult itemResults={state.itemResults} />
                )}
                {state.tabActiveKey === "3" && <TestCondition id={params.id} />}
              </div>
            </Col>
          </Row>
        </div>
      </div>

      <TestInfoModal
        autoId={params.id}
        open={state.isTestInfoModalOpen}
        onCancel={() => setState({ isTestInfoModalOpen: false })}
        onOk={() => setState({ isTestInfoModalOpen: false })}
      />
      <ReportInfoModal
        autoId={params.id}
        open={state.isReportInfoModalOpen}
        onCancel={() => setState({ isReportInfoModalOpen: false })}
        onOk={() => setState({ isReportInfoModalOpen: false })}
      />
      <VectorInfoModal
        autoId={params.id}
        open={state.isVectorInfoModalOpen}
        onCancel={() => setState({ isVectorInfoModalOpen: false })}
      />
    </PageContainer>
  );
};

export default Page;
