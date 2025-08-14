import { getList } from "@/services/case-management/case-run.service";
import {
  BarsOutlined,
  BookOutlined,
  CaretRightOutlined,
  CloseOutlined,
  HomeOutlined,
  InfoCircleOutlined,
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
  Checkbox,
  Col,
  Dropdown,
  Progress,
  Radio,
  Row,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
} from "antd";
import React, { useEffect, useRef } from "react";
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
    setState({ title: searchParams.get("name") || "-" });
    requestData();
  }, []);
  const [state, setState] = useSetState<any>({
    title: null,
    isExpandAll: false, //是否展开所有命令
    expandedRowKeys: [], //当前展开的行keys
    breakpoints: [], //打断点的行keys
    currentStatus: "PASS", // 当前运行状态：PASS, FAIL, BREAK, TEST, ERROR
    tabActiveKey: "1",
    dataSource: [],
    isSelfCheck: false, //是否点击自检
    selfCheckMessages: [], //自检信息列表
    isSelfChecking: false, //是否正在自检中
    stepMode: null, // 步骤模式：null(未选择), 1(项目单步), 2(命令单步)
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
    isExpandAll,
    expandedRowKeys,
    breakpoints,
    currentStatus,
    stepMode,
    items,
    isSelfCheck,
    selfCheckMessages,
    isSelfChecking,
  } = state;

  // 处理下拉菜单点击事件
  const handleMenuClick = ({ key }: { key: string }) => {
    console.log("点击的菜单项key:", key);
    switch (key) {
      case "1":
        console.log("点击了测试信息");

        break;
      case "2":
        console.log("点击了报告信息");

        break;
      case "3":
        console.log("点击了VECTOR通道配置");

        break;
      case "4":
        console.log("点击了自检");
        setState({ isSelfCheck: true });
        break;
      default:
        break;
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

  // 处理步骤模式变化
  const handleStepModeChange = (value: number) => {
    // 如果点击的是当前已选择的选项，则取消选择
    if (stepMode === value) {
      setState({ stepMode: null });
    } else {
      setState({ stepMode: value });
    }
  };

  // 获取状态配置
  const getStatusConfig = (status: string) => {
    const statusConfigs = {
      PASS: { color: "green", text: "PASS", description: "测试成功" },
      FAIL: { color: "red", text: "FAIL", description: "测试失败" },
      BREAK: { color: "orange", text: "BREAK", description: "处于暂停状态" },
      TEST: { color: "blue", text: "TEST", description: "正在运行测试" },
      ERROR: {
        color: "red",
        text: "ERROR",
        description: "设备通信DLL不存在或发生错误",
      },
    };
    return (
      statusConfigs[status as keyof typeof statusConfigs] || statusConfigs.TEST
    );
  };

  // 定义表格列
  const columns = [
    {
      title: " ",
      dataIndex: "breakpoint",
      width: 80,
      align: "center" as const,
      render: (_: any, record: any) => {
        const hasBreakpoint = breakpoints.includes(record.id);
        return (
          <Switch
            size="small"
            checked={hasBreakpoint}
            onChange={(checked) => handleBreakpointChange(record, checked)}
            className="breakpoint-switch"
          />
        );
      },
    },
    {
      title: "项目名称",
      dataIndex: "title",
      ellipsis: true,
    },
    {
      title: "项目名称/项目说明",
      dataIndex: "describe",
      ellipsis: true,
    },
    {
      title: "命令参数",
      dataIndex: "schemas",
      ellipsis: true,
    },
    {
      title: "是否合格",
      dataIndex: "qualified",
      ellipsis: true,
    },
  ];

  // 将平铺数据转换为按group分组的树形结构
  const convertToTreeData = (flatData: any[]) => {
    if (!flatData || flatData.length === 0) return [];

    // 按group分组
    const groupMap = new Map();

    flatData.forEach((item) => {
      const group = item.group;
      if (!groupMap.has(group)) {
        groupMap.set(group, []);
      }
      groupMap.get(group).push(item);
    });

    // 转换为树形结构
    const treeData: any[] = [];

    groupMap.forEach((items, group) => {
      if (items.length === 1) {
        // 如果组内只有一个项目，直接作为根节点
        treeData.push({
          ...items[0],
          key: items[0].id,
        });
      } else {
        // 查找id等于group的项目作为父节点
        const parentItem = items.find(
          (item: any) => String(item.id) === String(group)
        );
        const childItems = items.filter(
          (item: any) => String(item.id) !== String(group)
        );

        if (parentItem) {
          // 如果找到了父节点，将其他项目作为子节点
          const groupNode = {
            ...parentItem,
            key: parentItem.id,
            children: childItems.map((item: any) => ({
              ...item,
              key: item.id,
            })),
          };
          treeData.push(groupNode);
        } else {
          // 如果没有找到id等于group的项目，使用第一个项目作为父节点
          const firstItem = items[0];
          const otherItems = items.slice(1);
          const groupNode = {
            ...firstItem,
            key: firstItem.id,
            children: otherItems.map((item: any) => ({
              ...item,
              key: item.id,
            })),
          };
          treeData.push(groupNode);
        }
      }
    });

    return treeData;
  };

  const requestData: any = async (...args: any) => {
    try {
      const res = await getList({ params: args[0], sort: args[1] });
      const treeData = convertToTreeData(res);
      setState({ dataSource: treeData });
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
      const treeData = convertToTreeData(mockData);
      setState({ dataSource: treeData });
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
              {/* 如果不是序列跳转的 ，就不展示div中的button */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <Button icon={<CaretRightOutlined />}>继续</Button>
                <Button icon={<PauseOutlined />}>暂停</Button>
                <Button
                  onClick={() => {
                    setState({ breakpoints: [] });
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
              <div
                style={{
                  marginBottom: 10,
                }}
              >
                <Checkbox
                  checked={isExpandAll}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (checked) {
                      // 展开所有有children的行
                      const allExpandableKeys = dataSource
                        .filter(
                          (item: any) =>
                            item.children && item.children.length > 0
                        )
                        .map((item: any) => item.key || item.id);
                      setState({
                        isExpandAll: true,
                        expandedRowKeys: allExpandableKeys,
                      });
                    } else {
                      // 收起所有行
                      setState({
                        isExpandAll: false,
                        expandedRowKeys: [],
                      });
                    }
                  }}
                >
                  按命令展开所有项目
                </Checkbox>
              </div>
              <Table<any>
                bordered
                columns={columns}
                dataSource={dataSource}
                rowKey={(record) => record.key || record.id}
                pagination={false}
                expandable={{
                  expandedRowKeys: expandedRowKeys,
                  onExpand: (expanded, record) => {
                    let newExpandedKeys: any[];
                    const recordKey = record.key || record.id;
                    if (expanded) {
                      // 展开行：添加到expandedRowKeys
                      newExpandedKeys = [...expandedRowKeys, recordKey];
                    } else {
                      // 收起行：从expandedRowKeys中移除
                      newExpandedKeys = expandedRowKeys.filter(
                        (key: any) => key !== recordKey
                      );
                    }

                    // 检查是否所有可展开的行都已展开
                    const allExpandableKeys = dataSource
                      .filter(
                        (item: any) => item.children && item.children.length > 0
                      )
                      .map((item: any) => item.key || item.id);
                    const allExpanded = allExpandableKeys.every((key: any) =>
                      newExpandedKeys.includes(key)
                    );

                    setState({
                      expandedRowKeys: newExpandedKeys,
                      isExpandAll: allExpanded,
                    });
                  },
                  // 只有有children的行才显示展开按钮
                  rowExpandable: (record) =>
                    !!(record.children && record.children.length > 0),
                }}
              />
              {isSelfCheck ? (
                <Card className="table-card" style={{ marginTop: 10 }}>
                  {" "}
                  <div className="self-check-container">
                    <div className="self-check-header">
                      <h3>自检信息</h3>
                      {isSelfCheck && (
                        <div className="self-check-status">
                          <span className="loading-dot"></span>
                          自检中...
                        </div>
                      )}
                    </div>
                    <div className="self-check-content">
                      {!selfCheckMessages || selfCheckMessages.length === 0 ? (
                        <div className="no-messages">
                          {isSelfChecking
                            ? "正在获取自检信息..."
                            : "暂无自检信息"}
                        </div>
                      ) : (
                        <div
                          className="messages-list"
                          style={{
                            // height: "120px",
                            height: "100%",
                            overflowY: "auto",
                            backgroundColor: "#f8f9fa",
                            // border: "1px solid #e9ecef",
                            borderRadius: "4px",
                            padding: "8px",
                            fontFamily:
                              'Monaco, Consolas, "Courier New", monospace',
                            fontSize: "11px",
                            lineHeight: "1.4",
                          }}
                        >
                          {selfCheckMessages
                            .filter(
                              (message: SelfCheckMessage) =>
                                message && message.deviceType
                            )
                            .map((message: SelfCheckMessage) => (
                              <div key={message.id} className="message-line">
                                <span className="device-name">
                                  {message.deviceType} {message.serialNumber}
                                </span>
                                <span className="error-message">
                                  {message.message}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ) : (
                <div>
                  {/* 运行信息卡片 */}
                  <Card
                    size="small"
                    style={{ marginTop: 16 }}
                    title={
                      <Space>
                        <InfoCircleOutlined style={{ color: "#1890ff" }} />
                        <span>Message</span>
                      </Space>
                    }
                    bordered={true}
                  >
                    <div
                      className="console-output"
                      style={{
                        height: "120px",
                        overflowY: "auto",
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #e9ecef",
                        borderRadius: "4px",
                        padding: "8px",
                        fontFamily:
                          'Monaco, Consolas, "Courier New", monospace',
                        fontSize: "11px",
                        lineHeight: "1.4",
                      }}
                    >
                      <div style={{ color: "#6c757d" }}>
                        [2023-12-07 14:32:15] 开始执行测试序列...
                      </div>

                      <div style={{ color: "#6c757d" }}>
                        [2023-12-07 14:32:16] 初始化测试环境
                      </div>
                      <div style={{ color: "#6c757d" }}>
                        [2023-12-07 14:32:17] 执行 test add -
                        PreTestItemProcessing
                      </div>
                      <div style={{ color: "#cf1322" }}>
                        [2023-12-07 14:32:18] 错误: 参数1.000000,2.000000,b
                        验证失败
                      </div>
                      <div style={{ color: "#6c757d" }}>
                        [2023-12-07 14:32:19] test add 执行完成
                      </div>
                    </div>
                  </Card>

                  {/* 执行进度卡片 */}
                  <Card
                    size="small"
                    style={{ marginTop: 12 }}
                    title={
                      <Space>
                        <InfoCircleOutlined style={{ color: "#1890ff" }} />
                        <span>Progress</span>
                      </Space>
                    }
                    bordered={true}
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Progress
                        percent={65}
                        size="small"
                        strokeColor="#52c41a"
                        showInfo={true}
                        // format={(percent) => `${percent}% (3/5)`}
                      />
                      {/* <div style={{ fontSize: "12px", color: "#999" }}>
                当前执行: test add - PreTestItemProcessing2
              </div> */}
                    </Space>
                  </Card>

                  {/* 运行结果卡片 */}
                  <Card
                    size="small"
                    style={{ marginTop: 12 }}
                    title={
                      <Space>
                        <InfoCircleOutlined style={{ color: "#1890ff" }} />
                        <span>Result</span>
                      </Space>
                    }
                    bordered={true}
                  >
                    <div style={{ textAlign: "center", padding: "8px 0" }}>
                      <Tag
                        color={getStatusConfig(currentStatus).color}
                        style={{ fontSize: "14px", padding: "4px 12px" }}
                      >
                        {getStatusConfig(currentStatus).text}
                      </Tag>
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: "12px",
                        color: "#666",
                        textAlign: "center",
                      }}
                    >
                      {getStatusConfig(currentStatus).description}
                    </div>
                  </Card>
                </div>
              )}
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
                {tabActiveKey === "1" && <div>测试信息</div>}
                {tabActiveKey === "2" && <div>测试结果</div>}
                {tabActiveKey === "3" && <div>测试条件</div>}
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </PageContainer>
  );
};

export default Page;
