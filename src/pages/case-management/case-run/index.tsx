import { isEmptyObject } from "@/utils";
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
type StatusRun = "SUCCESS" | "FAIL" | "PASS" | "INFO";
type StatusCheck = "SUCCESS" | "FAIL";
type UiStatus = "TEST" | "PASS" | "FAIL" | "STOP" | "BREAK" | "ERROR";
type WSMsgType =
  | "RUN"
  | "STOP"
  | "PAUSE"
  | "GO"
  | "STEP"
  | "SelfTest"
  | "SelfTestAll"
  | "TestProcess";

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
    stepMode: 0,
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
    runLogs,
    itemResults,
    progress,
    tabItems,
    isReportInfoModalOpen,
    isTestInfoModalOpen,
    isVectorInfoModalOpen,
    isSelfChecking,
    currentStatus,
    tabActiveKey,
    isShowAllBtn,
    breakpoints,
    disableClearAll,
    pointsList,
    checkSelfLogs,
  } = state;
  const testResultRef = useRef<any>(null);
  useEffect(() => {
    setState({
      title: searchParams.get("name") || "-",
      isShowAllBtn: searchParams.get("status") === "all",
      pointsList: [],
    });
    handleInitData({});
  }, []);

  const statusFromNumber = (n?: number): "SUCCESS" | "FAIL" =>
    n === 1 ? "FAIL" : "SUCCESS";
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
  function handleTestProcess(n: any) {
    if (n?.code === 1) {
      // 运行到某一行
      const status = statusFromNumber(n?.Status);
      const message =
        n?.Message ??
        `${n?.itemname ?? "-"} - ${n?.cmdname ?? "-"} 进度 ${
          n?.Progress ?? 0
        }%`;

      appendRunLog(message, status);

      setState((prev: any) => ({
        ...prev,
        currentItemCmd: {
          itemindex: n?.itemindex,
          cmdindex: n?.cmdindex,
          itemname: n?.itemname,
          cmdname: n?.cmdname,
        },
        progress: typeof n?.Progress === "number" ? n.Progress : prev.progress,
        currentStatus: "TEST",
      }));

      if (btnType === "STEP" && stepMode === 1) {
        // 单项测试中：命令单步，收到 code=1 视为执行结束
        setState((prev: any) => ({ ...prev, currentStatus: "PASS" }));
      }
      return;
    }

    if (n?.code === 2) {
      setState((prev: any) => ({
        ...prev,
        itemResults: [...(prev.itemResults || []), n.info],
      }));

      runLeftRef.current?.setItemQualified?.(
        n?.info?.itemindex,
        n?.info?.result
      );

      appendAllLog(`项目结果：${n?.data?.itemname ?? "-"} 已完成`);
      testResultRef.current?.ensureVisibleByItemIndex?.(n?.itemindex);

      if (btnType === "STEP" && stepMode === 0) {
        // 单项测试中：项目单步，收到 code=2 视为执行结束
        setState((prev: any) => ({ ...prev, currentStatus: "PASS" }));
      }
      return;
    }

    if (n?.code === 3) {
      setState((prev: any) => ({
        ...prev,
        currentStatus: (n?.info?.Result as UiStatus) || "ERROR",
        currentItemCmd: {}, // 运行结束清空当前行数
      }));

      appendAllLog(
        `执行完成：${n?.info?.Result} 结束时间：${n?.info?.TestEndTime}`
      );
      // 如需确保不再重连，可按需关闭：
      // setTimeout(() => close({ disableReconnect: true }), 150);
      return;
    }

    // 其它 code：可作 INFO 记录
    appendRunLog(`未处理的 TestProcess code：${String(n?.code)}`, "INFO");
  }
  const { send, close } = useWebSocket({
    url: "ws://117.133.25.215:8000/ws/",
    onOpen: () => {
      appendAllLog("🔗 WebSocket 连接已建立");
    },
    onMessage: (msg) => {
      console.log("服务端msg", msg);
      const n = msg?.data ?? "";
      const t = msg?.type ?? "";
      if (t === "TestProcess") {
        handleTestProcess(n);
        return;
      }
      switch (t) {
        case "RUN":
          setState((prev: any) => ({
            ...prev,
            currentStatus: "TEST",
            projectNumber: n?.code === 0 ? n?.SN || "-" : prev.projectNumber,
          }));
          appendRunLog(
            `${n?.code === 0 ? "开始执行" : "执行失败"}`,
            `${n?.code === 0 ? "SUCCESS" : "FAIL"}`
          );

          break;

        case "STOP":
          setState((prev: any) => ({
            ...prev,
            currentStatus: "STOP",
            progress: 0,
          }));
          appendRunLog(
            `${n?.code === 0 ? "停止成功" : "停止失败"}`,
            `${n?.code === 0 ? "SUCCESS" : "FAIL"}`
          );
          // setTimeout(() => close({ disableReconnect: true }), 150);
          break;
        case "PAUSE":
          setState((prev: any) => ({ ...prev, currentStatus: "BREAK" }));
          appendRunLog(
            `${n?.code === 0 ? "暂停成功" : "暂停失败"}`,
            `${n?.code === 0 ? "SUCCESS" : "FAIL"}`
          );

          break;

        case "GO":
          setState((prev: any) => ({ ...prev, currentStatus: "TEST" }));
          appendRunLog(
            `${n?.code === 0 ? "继续执行" : "继续执行失败"}`,
            `${n?.code === 0 ? "SUCCESS" : "FAIL"}`
          );
          break;
        case "STEP":
          setState((prev: any) => ({ ...prev, currentStatus: "TEST" }));
          appendRunLog(
            `${n?.code === 0 ? "开始单步测试" : "单步测试失败"}`,
            `${n?.code === 0 ? "SUCCESS" : "FAIL"}`
          );
          break;
        case "SelfTest":
        case "SelfTestAll":
          const isSelf = t === "SelfTest";
          setState((prev: any) => ({
            ...prev,
            isSelfChecking: isSelf ? true : false,
            currentStatus: isSelf ? "TEST" : "PASS",
          }));
          appendChecklog(
            `${t === "SelfTestAll" ? "自检完成 ： " : ""}${
              n?.SelfTestResult ?? "_"
            }`,
            statusFromNumber(msg?.code) as StatusCheck
          );

          break;
        default:
          appendRunLog(`收到未知消息类型：${String(t)}`, "INFO");
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
    console.log("currentItemCmd", currentItemCmd);

    if (isEmptyObject(state.currentItemCmd)) {
      message.warning("请选择数据后进行测试");
      return;
    }
    handleInitData({ btnType: "STEP" });

    const { itemindex, cmdindex } = currentItemCmd;
    send({
      type: "STEP",
      method: state.stepMode, // 0 项目单步 1命令单步
      StartItem: itemindex,
      StartCmd: cmdindex,
    } as UpMsg);
  };
  const handleInitData = (obj: any) => {
    // 先清空左侧父级的“是否合格”
    runLeftRef.current?.clearQualified?.();
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

  const handleRowSelect = (row: any) => {
    console.log("values=========", row);
    if (row?.itemindex != null) {
      // 若需要，可切换到“测试结果”页签
      setState({ tabActiveKey: "2" });
      testResultRef.current?.ensureVisibleByItemIndex?.(row.itemindex);
    }
    setState({
      currentItemCmd: {
        ...row,
        cmdname: row?.command,
        itemname: row?.sequence_name,
      },
    });
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
                      <Radio value={0}>项目单步</Radio>
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
                  activeKey={tabActiveKey}
                  onChange={(key: any) => setState({ tabActiveKey: key })}
                />
                {tabActiveKey === "1" && <TestInfo autoId={params.id} />}
                {tabActiveKey === "2" && (
                  <TestResult ref={testResultRef} itemResults={itemResults} />
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
