import { getList } from "@/services/task-management/test-requirement.service";
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
import { ActionType, PageContainer } from "@ant-design/pro-components";
import { history, useSearchParams } from "@umijs/max";
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
interface SelfCheckMessage {
  id: number;
  deviceType: string;
  serialNumber: string;
  errorCode: string;
  message: string;
  timestamp: Date;
}
const Page: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    setState({
      title: searchParams.get("name") || "-",
      isShowAllBtn: searchParams.get("status") === "all",
    });

    requestData();
  }, []);
  const [state, setState] = useSetState<any>({
    isShowAllBtn: false, //是否展示全部操作按钮 ，从任务列表跳转的不需要展示某些按钮
    title: null,
    breakpoints: [], //打断点的行keys
    currentStatus: "PASS", // 当前运行状态：PASS, FAIL, BREAK, TEST, ERROR
    tabActiveKey: "1",
    dataSource: [],
    isSelfCheck: false, //是否点击自检
    selfCheckMessages: [], //自检信息列表
    isSelfChecking: false, //是否正在自检中
    stepMode: null, // 步骤模式：null(未选择), 1(项目单步), 2(命令单步)
    isReportInfoModalOpen: false,
    isTestInfoModalOpen: false,
    isVectorInfoModalOpen: false,
    tabItems: [
      {
        key: "1",
        label: "测试信息",
        icon: <HomeOutlined />,
      },
      {
        key: "2",
        label: "测试结果", //测试结果
        icon: <BookOutlined />,
      },
      {
        key: "3",
        label: "测试条件",
        icon: <BarsOutlined />,
      },
    ],

    items: [
      {
        key: "1",
        label: "测试信息",
      },
      {
        key: "2",
        label: "报告信息",
      },
      {
        key: "3",
        // label: (
        //   <a
        //     target="_blank"
        //     rel="noopener noreferrer"
        //     href="https://www.luohanacademy.com"
        //   >
        //     VECTOR通道配置
        //   </a>
        // ),
        label: "VECTOR通道配置",
        // disabled: true,
      },
      {
        key: "4",
        // danger: true,
        label: "自检",
      },
    ],
  });
  const {
    title,
    tabItems,
    tabActiveKey,
    dataSource,
    breakpoints,
    currentStatus,
    stepMode,
    items,
    isSelfCheck,
    selfCheckMessages,
    isSelfChecking,
    isShowAllBtn,
    isReportInfoModalOpen,
    isTestInfoModalOpen,
    isVectorInfoModalOpen,
  } = state;

  // 处理下拉菜单点击事件
  const handleMenuClick = ({ key }: { key: string }) => {
    console.log("点击的菜单项key:", key);
    switch (key) {
      case "1":
        console.log("点击了测试信息");
        setState({ isTestInfoModalOpen: true });
        break;
      case "2":
        console.log("点击了报告信息");
        setState({ isReportInfoModalOpen: true });
        break;
      case "3":
        console.log("点击了VECTOR通道配置");
        setState({ isVectorInfoModalOpen: true });
        break;
      case "4":
        console.log("点击了自检");
        setState({ isSelfCheck: true });
        break;
      default:
        break;
    }
  };

  // 处理步骤模式变化
  const handleStepModeChange = (value: number) => {
    // 如果点击的是当前已选择的选项，则取消选择
    if (stepMode === value) {
      setState({ stepMode: null });
    } else {
      setState({ stepMode: value });
    }
  };
  const requestData: any = async (...args: any) => {
    try {
      const res = await getList({ params: args[0], sort: args[1] });
      // const treeData = convertToTreeData(res);
      setState({ dataSource: res });
    } catch {
      // Mock数据
      const mockData = [
        {
          id: 100,
          title: "test add",
          describe: "",
          schemas: "",
          qualified: "",
          group: 100,
        },
        {
          id: 11,
          title: "test add",
          describe: "PreTestItemProcessing2",
          schemas: "1.000000,2.000000,b",
          qualified: "",
          group: 100,
        },
        {
          id: 2,
          title: "test add",
          describe: "ADD",
          schemas: "",
          qualified: "",
          group: 100,
        },
        {
          id: 101,
          title: "test add2",
          describe: "",
          schemas: "",
          qualified: "",
          group: 101,
        },
        {
          id: 31,
          title: "",
          describe: "PreTestItemProcessing",
          schemas: "1.000000,2.000000,b",
          qualified: "合格",
          group: 101,
        },
      ];
      // 转换为树形结构
      // const treeData = convertToTreeData(mockData);
      // console.log("treeData", treeData);

      setState({ dataSource: mockData });
    }
  };
  // 处理断点切换
  const handleBreakpointChange = (record: any, checked: boolean) => {
    if (checked) {
      setState({
        breakpoints: [...breakpoints, record.id],
      });
    } else {
      setState({
        breakpoints: breakpoints.filter((id: any) => id !== record.id),
      });
    }
  };
  return (
    <PageContainer
      // style={{ backgroundColor: "#fff" }}
      header={{
        title: (
          <div>
            用例执行 &nbsp; <span style={{ color: "#999" }}>【 {title} 】</span>
          </div>
        ),
        ghost: true,
        extra: [
          <Button
            key="1"
            onClick={() => {
              history.back();
            }}
          >
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
              {/* <div> */}
              <Button
                icon={<PlayCircleOutlined />}
                onClick={() => {
                  setState({ isSelfCheck: false, isSelfChecking: false });
                }}
              >
                执行
              </Button>
              <Button icon={<StopOutlined />}>停止</Button>
              <Button icon={<EnterOutlined />}>单项测试</Button>
              {/* 如果不是序列跳转的 ，就不展示div中的button */}
              {isShowAllBtn && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button icon={<CaretRightOutlined />}>继续</Button>
                  <Button icon={<PauseOutlined />}>暂停</Button>
                  <Button
                    disabled={breakpoints.length == 0}
                    onClick={() => {
                      console.log("brena", breakpoints);
                      setState({ breakpoints: [] });
                      message.success("操作成功");
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

              {/* <Button icon={<FileAddOutlined />}>单项测试</Button> */}

              {/* 取消所有断点 */}
              {/* 项目单步 */}
              {/* 命令单步  */}
              {/* </div> */}
            </Space>
            <div
              style={{
                minWidth: 200,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                {" "}
                项目编号：<span style={{ color: "#1890ff" }}>0266</span>
              </div>
              <div>
                {" "}
                <div style={{ cursor: "pointer" }}>
                  <Dropdown
                    menu={{
                      items,
                      onClick: handleMenuClick,
                    }}
                    placement="bottom"
                  >
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
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
                onPointChange={handleBreakpointChange}
                isSelfCheck={isSelfCheck}
                isSelfChecking={isSelfChecking}
                selfCheckMessages={selfCheckMessages}
                data={dataSource}
                currentStatus={currentStatus}
                breakpoints={breakpoints}
              />
            </Col>
            <Col span={12}>
              <div
                style={{
                  background: "#fff",
                  // paddingTop: "20px",
                }}
              >
                <Tabs
                  items={tabItems}
                  defaultActiveKey={tabActiveKey}
                  onChange={(key: any) => {
                    setState({ tabActiveKey: key });
                  }}
                />
                {tabActiveKey === "1" && <TestInfo />}
                {tabActiveKey === "2" && <TestResult />}
                {tabActiveKey === "3" && <TestCondition />}
              </div>
            </Col>
          </Row>
        </div>
      </div>
      <TestInfoModal
        open={isTestInfoModalOpen}
        onCancel={() => {
          setState({ isTestInfoModalOpen: false });
        }}
      />
      <ReportInfoModal
        open={isReportInfoModalOpen}
        onCancel={() => {
          setState({ isReportInfoModalOpen: false });
        }}
      />
      <VectorInfoModal
        open={isVectorInfoModalOpen}
        onCancel={() => {
          setState({ isVectorInfoModalOpen: false });
        }}
      />
    </PageContainer>
  );
};

export default Page;
