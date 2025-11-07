import { useWebSocket } from "@/utils/useWebSockt";
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
    disableClearAll: false,
    selectRowData: null,

    currentStatus: "", // | TEST | BREAK | PASS | FAIL | ERROR |STOP
    tabActiveKey: "2",

    isSelfChecking: false,

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

    progress: 0,
    currentItemCmd: {}, //当前选中行数据  { itemindex: 0, cmdindex: 0, itemname: "", cmdname: "" },
    itemResults: [] as ItemResultData[],
    allLogs: [] as string[], // 所有日志（字符串）
    runLogs: [] as {
      time: string;
      status: "SUCCESS" | "FAIL" | "INFO";
      message: string;
    }[],
    stepMode: 2,
    btnType: null, //点击了哪个按钮
    projectNumber: null,
    pointsList: [],
    checkSelfLogs: [],
  });
  const {
    btnType,
    projectNumber,
    currentItemCmd,
    stepMode,
    allLogs,
    runLogs,
    itemResults,
    progress,
    items,
    tabItems,
    isReportInfoModalOpen,
    isTestInfoModalOpen,
    isVectorInfoModalOpen,
    isSelfChecking,
    currentStatus,
    tabActiveKey,
    isShowAllBtn,
    title,
    breakpoints,
    disableClearAll,
    selectRowData,
    pointsList,
    checkSelfLogs,
  } = state;
  useEffect(() => {
    setState({
      title: searchParams.get("name") || "-",
      isShowAllBtn: searchParams.get("status") === "all",
      pointsList: [],
      // checkSelfLogs: [],
      // allLogs: [],
      // runLogs: [],
      // progress: 0,
      // currentItemCmd: {},
      // itemResults: [],
    });
    handleInitData({});
  }, []);

  /** 日志工具 */
  const appendAllLog = (text: string) => {
    setState((prev: any) => ({
      allLogs:
        prev.allLogs?.[prev.allLogs.length - 1] === text
          ? prev.allLogs
          : [...(prev.allLogs || []), text],
    }));
  };
  const appendRunLog = (
    message: string,
    status: "SUCCESS" | "FAIL" | "PASS" | "INFO" = "INFO"
  ) => {
    const time = new Date().toLocaleString();
    setState((prev: any) => ({
      runLogs: [...(prev.runLogs || []), { time, status, message }],
    }));
    appendAllLog(`[${time}] ${status} → ${message}`);
  };

  const appendChecklog = (message: string, status: "SUCCESS" | "FAIL") => {
    const time = new Date().toLocaleString();
    setState((prev: any) => ({
      checkSelfLogs: [...(prev.checkSelfLogs || []), { time, status, message }],
    }));
    // appendAllLog(`[${time}] ${status} → ${message}`);
  };

  const { send, close } = useWebSocket({
    url: "ws://117.133.25.215:8000/ws/",
    onOpen: () => {
      appendAllLog("🔗 WebSocket 连接已建立");
    },
    onMessage: (msg) => {
      console.log("服务端msg", msg);
      const n = msg?.data;
      if (msg?.type === "TestProcess") {
        if (n.code === 1) {
          //表示运行到某一行
          const status = n.Status === 1 ? "FAIL" : "SUCCESS";
          const message =
            n.Message ??
            `${n.itemname ?? "-"} - ${n.cmdname ?? "-"} 进度 ${
              n.Progress ?? 0
            }%`;

          appendRunLog(message, status);
          setState((prev: any) => ({
            currentItemCmd: {
              itemindex: n.itemindex,
              cmdindex: n.cmdindex,
              itemname: n.itemname,
              cmdname: n.cmdname,
            },
            progress:
              typeof n.Progress === "number" ? n.Progress : prev.progress,
            currentStatus: "TEST",
          }));
          if (btnType === "STEP" && stepMode === 1) {
            //单项测试中 如果是命令单步，只要收到code为1就表示执行结束
            setState({
              currentStatus: "PASS",
            });
          }

          return;
        }

        if (n.code === 2) {
          setState((prev: any) => ({
            itemResults: [...prev.itemResults, n.info],
          }));
          appendAllLog(`项目结果：${n.data?.itemname ?? "-"} 已完成`);

          if (btnType === "STEP" && stepMode === 2) {
            //单项测试中 如果是项目单步，只要收到code为2就表示执行结束
            setState({
              currentStatus: "PASS",
            });
          }
          return;
        }

        if (n.code === 3) {
          setState({
            currentStatus: n.info?.Result || "ERROR",
            currentItemCmd: {}, //运行结束清空当前行数
          });

          appendAllLog(
            `执行完成：${n.info?.Result} 结束时间：${n.info?.TestEndTime}`
          );
          // 不再有后续消息，安全关闭且不重连
          // setTimeout(() => close({ disableReconnect: true }), 150);
          return;
        }
      }
      switch (msg?.type) {
        case "RUN":
          setState({ currentStatus: "TEST" });
          appendRunLog(
            `${n?.code === 0 ? "开始执行" : "执行失败"}`,
            `${n?.code === 0 ? "SUCCESS" : "FAIL"}`
          );

          break;

        case "STOP":
          setState({ currentStatus: "STOP", progress: 0 });

          appendRunLog(
            `${n?.code === 0 ? "停止成功" : "停止失败"}`,
            `${n?.code === 0 ? "SUCCESS" : "FAIL"}`
          );
          // setTimeout(() => close({ disableReconnect: true }), 150);
          break;
        case "PAUSE":
          setState({ currentStatus: "BREAK" });
          appendRunLog(
            `${n?.code === 0 ? "暂停成功" : "暂停失败"}`,
            `${n?.code === 0 ? "SUCCESS" : "FAIL"}`
          );

          break;

        case "GO":
          setState({ currentStatus: "TEST" });
          appendRunLog(
            `${n?.code === 0 ? "继续执行" : "继续执行失败"}`,
            `${n?.code === 0 ? "SUCCESS" : "FAIL"}`
          );
          break;
        case "STEP":
          setState({ currentStatus: "TEST" });
          appendRunLog(
            `${n?.code === 0 ? "开始单步测试" : "单步测试失败"}`,
            `${n?.code === 0 ? "SUCCESS" : "FAIL"}`
          );
          break;
        case "SelfTest":
        case "SelfTestAll":
          setState({
            isSelfChecking: msg.type === "SelfTest" ? true : false,
            currentStatus: msg.type === "SelfTest" ? "TEST" : "PASS",
          });
          appendChecklog(
            `${msg.type === "SelfTestAll" ? "自检完成 ： " : ""} ${
              n.SelfTestResult ?? "_"
            }`,
            `${n?.code === 0 ? "SUCCESS" : "FAIL"}`
          );

          break;
        default:
          break;
      }
    },
    onClose: () => appendAllLog("⚠️ WebSocket 已断开"),
    onError: () => message.error("WebSocket 出错"),
    reconnectInterval: 15000,
    heartbeatInterval: 15000,
  });
  /** —— 基础交互 —— */

  const handleRun = () => {
    handleInitData({
      btnType: "RUN",
    });
    // 发 RUN
    send({ type: "RUN", data: pointsList } as UpMsg);
  };

  const handleStop = () => {
    setState({
      btnType: "STOP",
    });
    send({ type: "STOP" } as UpMsg);
  };

  const handleStep = () => {
    if (isRunning) {
      message.warning(`当前有任务正在运行，请先点击“停止”后再进行该操作。`);
      return;
    }

    if (!state.selectRowData) {
      message.warning("请选择数据后进行测试");
      return;
    }
    handleInitData({ btnType: "STEP" });

    const method = state.stepMode === 2 ? 0 : 1; // 0 项目单步 1命令单步

    const { itemindex = 1, cmdindex = 1 } = state.selectRowData;
    send({
      type: "STEP",
      method,
      StartItem: itemindex,
      StartCmd: cmdindex,
    } as UpMsg);
  };
  const handleInitData = (obj: any) => {
    setState({
      currentItemCmd: {},
      itemResults: [],
      progress: 0,
      currentStatus: null,
      runLogs: [],
      checkSelfLogs: [],
      ...obj,
    });
  };
  // 3) 修改 handleGo：在继续前先拦截“其他任务正在运行”的情况
  // 注意：“继续”一般用于 BREAK（暂停）状态，不应阻断 BREAK -> TEST 的恢复
  const handleGo = () => {
    // 若此刻有“别的任务”在跑（TEST），不允许再继续
    if (state.currentStatus === "TEST" || state.isSelfChecking) {
      message.warning("当前有任务正在运行，请先点击“停止”后再进行继续操作。");
      return;
    }
    setState({
      btnType: "GO",
    });
    send({ type: "GO" } as UpMsg);
  };
  const handlePause = () => {
    setState({
      btnType: "PAUSE",
    });
    send({ type: "PAUSE" } as UpMsg);
  };

  // 自检菜单
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
        if (isRunning) {
          message.warning(`当前有任务正在运行，请先点击“停止”后再进行该操作。`);
          return;
        }
        handleInitData({ btnType: "CHECK_SELF" });
        send({ type: "SelfTest" } as UpMsg);
        break;
    }
  };

  const handleClearAllPoint = () => {
    runLeftRef.current?.clearAllBreakpoints?.();
    setState((prev) => ({ ...prev, pointsList: [], disableClearAll: false }));
    message.success("操作成功");
  };

  const handleRowSelect = (values: any) => {
    setState({ selectRowData: { ...values } });
  };
  const isRunning = state.currentStatus === "TEST"; //是否处于执行状态
  const isPaused = state.currentStatus === "BREAK"; //是否处于暂停状态
  const canRun = !state.isRunning && !state.isSelfChecking; //是否可以运行

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
                disabled={!canRun}
                onClick={handleRun}
              >
                执行
              </Button>

              <Button
                disabled={!isRunning}
                icon={<StopOutlined />}
                onClick={handleStop}
              >
                停止
              </Button>

              <Button
                icon={<EnterOutlined />}
                disabled={!canRun}
                onClick={handleStep}
              >
                单项测试
              </Button>

              {isShowAllBtn && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button
                    icon={<CaretRightOutlined />}
                    onClick={handleGo}
                    disabled={!isPaused}
                  >
                    继续
                  </Button>
                  <Button
                    disabled={!isRunning}
                    icon={<PauseOutlined />}
                    onClick={handlePause}
                  >
                    暂停
                  </Button>
                  <Button
                    disabled={!disableClearAll}
                    onClick={() => {
                      send({
                        type: "BKPOINT",
                        method: 0,
                        StartItem: 0,
                        StartCmd: 0,
                      } as UpMsg);
                      handleClearAllPoint();
                    }}
                    icon={<CloseOutlined />}
                  >
                    取消所有断点
                  </Button>

                  <div style={{ marginLeft: 8 }}>
                    <Radio.Group
                      value={stepMode}
                      onChange={(e) => setState({ stepMode: e.target.value })}
                    >
                      <Radio value={2}>项目单步</Radio>
                      <Radio value={1}>命令单步</Radio>
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
                项目编号：
                <span style={{ color: "#1890ff" }}>{projectNumber || "-"}</span>
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
                btnType={btnType}
                ref={runLeftRef}
                autoId={params.id}
                currentItemCmd={currentItemCmd}
                progress={progress}
                logs={runLogs}
                currentStatus={currentStatus}
                isSelfChecking={isSelfChecking}
                selfCheckMessages={checkSelfLogs}
                onRowSelect={handleRowSelect}
                breakpoints={breakpoints}
                onPonitChange={({ data, pointsSeq }) => {
                  setState((prev) => ({
                    ...prev,
                    pointsList: pointsSeq,
                    disableClearAll: pointsSeq.length > 0,
                  }));
                }}
              />
            </Col>

            <Col span={12}>
              <div style={{ background: "#fff" }}>
                <Tabs
                  items={tabItems}
                  defaultActiveKey={tabActiveKey}
                  onChange={(key: any) => setState({ tabActiveKey: key })}
                />
                {tabActiveKey === "1" && <TestInfo autoId={params.id} />}
                {tabActiveKey === "2" && (
                  <TestResult itemResults={itemResults} />
                )}
                {tabActiveKey === "3" && <TestCondition id={params.id} />}
              </div>
            </Col>
          </Row>
        </div>
      </div>

      <TestInfoModal
        autoId={params.id}
        open={isTestInfoModalOpen}
        onCancel={() => setState({ isTestInfoModalOpen: false })}
        onOk={() => setState({ isTestInfoModalOpen: false })}
      />
      <ReportInfoModal
        autoId={params.id}
        open={isReportInfoModalOpen}
        onCancel={() => setState({ isReportInfoModalOpen: false })}
        onOk={() => setState({ isReportInfoModalOpen: false })}
      />
      <VectorInfoModal
        autoId={params.id}
        open={isVectorInfoModalOpen}
        onCancel={() => setState({ isVectorInfoModalOpen: false })}
      />
    </PageContainer>
  );
};

export default Page;
