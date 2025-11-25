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
type StatusCheck = "SUCCESS" | "FAIL";
type UiStatus = "TEST" | "PASS" | "FAIL" | "STOP" | "BREAK" | "ERROR";

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
  const breakpointActionRef = useRef<{
    type: "set" | "cancel" | "clearAll";
    row?: any;
  } | null>(null);
  const params = useParams();
  const [state, setState] = useSetState<any>({
    isShowAllBtn: false,
    title: null,
    breakpoints: [],
    disableClearAll: false,
    currentStatus: "", //  TEST | BREAK | PASS | FAIL | ERROR |STOP|STEP|BKPOINT
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
    runBtnIsDisabled: false, //是否禁用
    stopBtnIsDisabled: true,
    oneTestBtnIsDisabled: false,
    goBtnIsDisabled: true,
    pauseBtnIsDisabled: true,
  });
  const btnInit = () => {
    setState({
      runBtnIsDisabled: false,
      stopBtnIsDisabled: true,
      oneTestBtnIsDisabled: false,
      goBtnIsDisabled: true,
      pauseBtnIsDisabled: true,
    });
  };
  const stepModeRef = useRef(state.stepMode);
  const btnTypeRef = useRef(state.btnType);
  const currentStatusRef = useRef(state.currentStatus);

  const {
    projectNumber,
    currentItemCmd,
    runLogs,
    itemResults,
    progress,
    tabItems,
    isReportInfoModalOpen,
    isTestInfoModalOpen,
    isVectorInfoModalOpen,
    isSelfChecking,
    tabActiveKey,
    isShowAllBtn,
    breakpoints,
    disableClearAll,
    pointsList,
    checkSelfLogs,
    runBtnIsDisabled,
    stopBtnIsDisabled,
    oneTestBtnIsDisabled,
    goBtnIsDisabled,
    pauseBtnIsDisabled,
  } = state;

  useEffect(() => {
    stepModeRef.current = state.stepMode;
    btnTypeRef.current = state.btnType;
    currentStatusRef.current = state.currentStatus;
    console.log("state.currentStatus=====", state.currentStatus);
  }, [state.stepMode, state.btnType, state.currentStatus]);
  const testResultRef = useRef<any>(null);
  useEffect(() => {
    setState({
      title: searchParams.get("name") || "-",
      isShowAllBtn: searchParams.get("status") === "all",
      pointsList: [],
      runLogs: [],
    });
    handleInitData();
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
          //高亮当前行
          itemindex: n?.itemindex,
          cmdindex: n?.cmdindex,
          itemname: n?.itemname,
          cmdname: n?.cmdname,
        },
        progress: typeof n?.Progress === "number" ? n.Progress : prev.progress,
      }));
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
      if (btnTypeRef.current === "STEP" && stepModeRef.current === 0) {
        setState((prev: any) => ({
          ...prev,
          stopBtnIsDisabled: false,
          pauseBtnIsDisabled: true,
          runBtnIsDisabled: true,
          oneTestBtnIsDisabled: true,
          goBtnIsDisabled: false,
        }));
      }
      appendAllLog(`项目结果：${n?.info?.itemname ?? "-"} 已完成`);
      testResultRef.current?.ensureVisibleByItemIndex?.(n?.itemindex);

      return;
    }

    if (n?.code === 3) {
      let result: any = n?.info?.Result || "_";
      setState((prev: any) => ({
        ...prev,
        currentStatus: (result as UiStatus) || "ERROR",
        // currentItemCmd: {}, // 运行结束清空当前行数
      }));
      if (result == "PASS" || result == "FAIL" || result == "BREAK") {
        appendRunLog(`执行完成 结束时间：${n?.info?.TestEndTime}`, `${result}`);
      }

      if (n?.info?.Result !== "BREAK") {
        btnInit();
      }
      return;
    }
    // 其它 code：可作 INFO 记录
    appendRunLog(`未处理的 TestProcess code：${String(n?.code)}`, "INFO");
  }
  const { send, close } = useWebSocket({
    url: "ws://218.247.161.72:8000/ws/",
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
          if (n?.code === 0) {
            setState((prev: any) => ({
              ...prev,
              currentStatus: "TEST",
              projectNumber: n?.code === 0 ? n?.SN || "-" : prev.projectNumber,
              stopBtnIsDisabled: false,
              pauseBtnIsDisabled: false,
              runBtnIsDisabled: true,
              oneTestBtnIsDisabled: true,
              goBtnIsDisabled: true,
            }));
            appendRunLog(`开始执行`, `SUCCESS`);
          } else {
            appendRunLog(`执行失败`, `FAIL`);
          }

          break;

        case "STOP":
          appendRunLog(`停止成功`, `SUCCESS`);
          if (n?.code === 0) {
            setState((prev: any) => ({
              ...prev,
              currentStatus: "STOP",
              progress: 0,
            }));
          } else {
            appendRunLog(`停止失败`, `FAIL`);
          }
          // setTimeout(() => close({ disableReconnect: true }), 150);
          break;
        case "PAUSE": //暂停 停止和继续高亮
          if (n?.code === 0) {
            setState((prev: any) => ({
              ...prev,
              currentStatus: "BREAK",
              stopBtnIsDisabled: false,
              pauseBtnIsDisabled: true,
              runBtnIsDisabled: true,
              oneTestBtnIsDisabled: true,
              goBtnIsDisabled: false,
            }));
            appendRunLog(`暂停成功`, `SUCCESS`);
          } else {
            appendRunLog(`暂停失败`, `FAIL`);
          }

          break;

        case "GO": //点击继续 停止和继续高亮
          if (n?.code === 0) {
            setState((prev: any) => ({
              ...prev,
              currentStatus: "TEST",
              stopBtnIsDisabled: false,
              pauseBtnIsDisabled: true,
              runBtnIsDisabled: true,
              oneTestBtnIsDisabled: true,
              goBtnIsDisabled: false,
            }));
            appendRunLog(`继续执行`, `SUCCESS`);
          } else {
            appendRunLog(`继续执行失败`, `FAIL`);
          }

          break;
        case "STEP": //点单步
          if (n?.code === 0) {
            appendRunLog(`开始单步测试`, `SUCCESS`);
            if (stepModeRef.current === 0) {
              //项目单步
              setState((prev: any) => ({
                ...prev,
                currentStatus: "TEST",
                stopBtnIsDisabled: false,
                pauseBtnIsDisabled: false,
                runBtnIsDisabled: true,
                oneTestBtnIsDisabled: true,
                goBtnIsDisabled: true,
              }));
            } else {
              //命令单步
              setState((prev: any) => ({
                ...prev,
                currentStatus: "STEP",
                stopBtnIsDisabled: false,
                pauseBtnIsDisabled: true,
                runBtnIsDisabled: true,
                oneTestBtnIsDisabled: true,
                goBtnIsDisabled: false,
              }));
            }
          } else {
            appendRunLog(`单步测试失败`, `FAIL`);
          }

          break;
        case "BKPOINT":
          // { type:'BKPOINT', data:{ code:1, message:'succeed' }, info:[...] }
          const data = msg?.data || {};
          const code = data.code;
          const bkMsg = data.message;
          const pending = breakpointActionRef.current;
          if (code === 0 && pending) {
            if (pending.type === "set" && pending.row) {
              // 真正给当前行打红点
              runLeftRef.current?.setBreakpoint?.(pending.row.key);
              appendRunLog("设置断点成功", "SUCCESS");
            } else if (pending.type === "cancel" && pending.row) {
              // 真正取消当前行红点
              runLeftRef.current?.cancelBreakpoint?.(pending.row.key);
              appendRunLog("取消断点成功", "SUCCESS");
            } else if (pending.type === "clearAll") {
              // 清除所有断点
              handleClearAllPoint(); // 内部会调用 runLeftRef.current.clearAllBreakpoints()
              appendRunLog("取消所有断点成功", "SUCCESS");
            }
          } else {
            appendRunLog(`断点操作失败：${bkMsg ?? ""}`, "FAIL");
            message.error(bkMsg || "断点操作失败，请重试");
          }

          breakpointActionRef.current = null;
          break;
          break;
        case "SelfTest":
        case "SelfTestAll":
          const isSelf = t === "SelfTest";
          setState((prev: any) => ({
            ...prev,
            isSelfChecking: isSelf ? true : false,
            currentStatus: "",
          }));
          appendChecklog(
            `${t === "SelfTestAll" ? "自检完成 ： " : ""}${
              n?.SelfTestResult ?? "_"
            }`,
            statusFromNumber(msg?.code) as StatusCheck
          );

          break;
        default:
          appendAllLog(`收到未知消息类型：${String(t)}`);
          break;
      }
    },
    onClose: () => appendAllLog("⚠️ WebSocket 已断开"),
    onError: () => message.error("WebSocket 出错"),
    reconnectInterval: 15000,
    heartbeatInterval: 15000,
  });
  const handleRequestBreakpoint = (action: "set" | "cancel", row: any) => {
    if (!row) return;
    // 记录这次要做的动作，等 BKPOINT 回包时用
    breakpointActionRef.current = { type: action, row };

    const { itemindex, cmdindex } = row;
    // 1 = 设置断点，2 = 取消断点
    const method = action === "set" ? 1 : 2;
    send({
      type: "BKPOINT",
      method,
      StartItem: itemindex ?? 0,
      StartCmd: cmdindex ?? 0,
    } as UpMsg);
  };

  const handleRun = () => {
    if (state.isSelfChecking) {
      message.warning("当前正在自检，请先点击“停止”后再进行继续操作。");
      return;
    }
    handleInitData();
    setState({
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
    // if (isRunning && btnTypeRef.current != "STEP") {
    //   message.warning(`当前有任务正在运行，请先点击“停止”后再进行该操作。`);
    //   return;
    // }

    if (isEmptyObject(state.currentItemCmd)) {
      message.warning("请选择数据后进行测试");
      return;
    }
    const modeToUse = state.stepMode; // capture now
    handleInitData();
    setState({ btnType: "STEP" });
    btnTypeRef.current = "STEP"; // 同步 ref
    const { itemindex, cmdindex } = currentItemCmd;

    send({
      type: "STEP",
      method: modeToUse, // 0 项目单步 1命令单步
      StartItem: itemindex,
      StartCmd: cmdindex,
    } as UpMsg);
  };
  const handleInitData = () => {
    // 先清空左侧父级的“是否合格”
    runLeftRef.current?.clearQualified?.();
    setState({
      currentItemCmd: {},
      itemResults: [],
      progress: 0,
      currentStatus: null,
      // runLogs: [],
      checkSelfLogs: [],
    });
  };
  const handleGo = () => {
    if (state.isSelfChecking) {
      message.warning("当前正在自检，请先点击“停止”后再进行继续操作。");
      return;
    }
    setState({
      btnType: "GO",
    });
    send({ type: "GO" } as UpMsg);
  };
  const handlePause = () => {
    if (state.isSelfChecking) {
      message.warning("当前正在自检，请先点击“停止”后再进行继续操作。");
      return;
    }
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
        if (currentStatusRef.current === "TEST") {
          message.warning(`当前有任务正在运行，请先点击“停止”后再进行该操作。`);
          return;
        }
        handleInitData();
        setState({ btnType: "CHECK_SELF" });
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
    // console.log("values=========", row);
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
                disabled={runBtnIsDisabled}
                onClick={handleRun}
              >
                执行
              </Button>

              <Button
                disabled={stopBtnIsDisabled}
                icon={<StopOutlined />}
                onClick={handleStop}
              >
                停止
              </Button>

              <Button
                icon={<EnterOutlined />}
                disabled={oneTestBtnIsDisabled}
                onClick={handleStep}
              >
                单项测试
              </Button>

              {isShowAllBtn && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button
                    icon={<CaretRightOutlined />}
                    onClick={handleGo}
                    disabled={goBtnIsDisabled}
                  >
                    继续
                  </Button>
                  <Button
                    disabled={pauseBtnIsDisabled}
                    icon={<PauseOutlined />}
                    onClick={handlePause}
                  >
                    暂停
                  </Button>
                  <Button
                    disabled={!disableClearAll}
                    onClick={() => {
                      breakpointActionRef.current = { type: "clearAll" };
                      send({
                        type: "BKPOINT",
                        method: 0, //取消所有断点
                        StartItem: 0,
                        StartCmd: 0,
                      } as UpMsg);
                    }}
                    icon={<CloseOutlined />}
                  >
                    取消所有断点
                  </Button>

                  <div style={{ marginLeft: 8 }}>
                    <Radio.Group
                      value={state.stepMode}
                      onChange={(e) => {
                        const v = e.target.value;
                        setState({ stepMode: v });
                        stepModeRef.current = v;
                      }}
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
                btnType={state.btnType}
                ref={runLeftRef}
                autoId={params.id}
                currentItemCmd={currentItemCmd}
                progress={progress}
                logs={runLogs}
                currentStatus={state.currentStatus}
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
                onRequestBreakpoint={handleRequestBreakpoint}
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
