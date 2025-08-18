import { InfoCircleOutlined } from "@ant-design/icons";
import { useSetState } from "ahooks";
import { Card, Checkbox, Progress, Space, Switch, Table, Tag } from "antd";
import React, { useEffect } from "react";
interface RunProps {
  data?: any;
  id?: any;
  isSelfCheck: Boolean;
  isSelfChecking: boolean;
  selfCheckMessages: any;
  onPointChange: (record: any, checked: any) => void;
  currentStatus: string;
  breakpoints: any;
}
interface SelfCheckMessage {
  id: number;
  deviceType: string;
  serialNumber: string;
  errorCode: string;
  message: string;
  timestamp: Date;
}
const RunLeftPage: React.FC<RunProps> = ({
  isSelfCheck,
  isSelfChecking,
  selfCheckMessages,
  data,
  id,
  onPointChange,
  currentStatus,
  breakpoints,
}) => {
  const [state, setState] = useSetState<any>({
    isExpandAll: true,
    dataSource: [],
    expandedRowKeys: [],
  });
  const { isExpandAll, dataSource, expandedRowKeys } = state;

  useEffect(() => {
    setState({
      dataSource: convertToTreeData(data),
    });
  }, [data]);

  // 数据加载后，若开启“按命令展开所有项目”，默认展开全部可展开的行
  useEffect(() => {
    if (isExpandAll && dataSource && dataSource.length > 0) {
      const allExpandableKeys = dataSource
        .filter((item: any) => item.children && item.children.length > 0)
        .map((item: any) => item.key || item.id);
      setState({ expandedRowKeys: allExpandableKeys });
    }
  }, [dataSource, isExpandAll]);

  // 定义表格列
  const columns = [
    {
      title: " ",
      dataIndex: "breakpoint",
      width: 80,
      align: "center" as const,
      render: (_: any, record: any) => {
        const hasBreakpoint =
          Array.isArray(breakpoints) &&
          breakpoints.map(String).includes(String(record.id));
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

  // 处理断点切换
  const handleBreakpointChange = (record: any, checked: boolean) => {
    onPointChange && onPointChange(record, checked);
    // if (checked) {
    //   setState({
    //     breakpoints: [...breakpoints, record.id],
    //   });
    //   onPointChange && onPointChange([...breakpoints, record.id]);
    // } else {
    //   let list = breakpoints.filter((id: any) => id !== record.id);
    //   setState({
    //     breakpoints: list,
    //   });

    // }
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
  return (
    <div className="runLeftPage-page">
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
                  (item: any) => item.children && item.children.length > 0
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
              .filter((item: any) => item.children && item.children.length > 0)
              .map((item: any) => item.key || item.id);
            const allExpanded = allExpandableKeys.every((key: any) =>
              newExpandedKeys.includes(key)
            );
            console.log("allExpanded", allExpanded);
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
                  {isSelfChecking ? "正在获取自检信息..." : "暂无自检信息"}
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
                    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
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
                        <span className="error-message">{message.message}</span>
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
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
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
                [2023-12-07 14:32:17] 执行 test add - PreTestItemProcessing
              </div>
              <div style={{ color: "#cf1322" }}>
                [2023-12-07 14:32:18] 错误: 参数1.000000,2.000000,b 验证失败
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
    </div>
  );
};

export default RunLeftPage;
