import { getList } from "@/services/case-management/case-run.service";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useSetState } from "ahooks";
import { Card, Checkbox, message, Progress, Space, Table, Tag } from "antd";
import { forwardRef, useEffect, useImperativeHandle } from "react";

import { formatTableTreeData } from "../schemas";
import "./index.less";
interface RunProps {
  id?: any;
  isSelfCheck: Boolean;
  isSelfChecking: boolean;
  selfCheckMessages: any;
  breakpoints: any;
  onDataChange?: (newData: any[]) => void;
  onPonitChange: (value: any) => void;
  onRowSelect?: (row: any) => void; // 把选中行数据回传给父组件
  autoId: any;
  currentItemCmd?: {
    itemindex: number;
    cmdindex: number;
    itemname?: string;
    cmdname?: string;
  };
  progress?: number;
  currentStatus: string; // 用于结果卡片
  logs: any;
}
interface SelfCheckMessage {
  id: number;
  deviceType: string;
  serialNumber: string;
  errorCode: string;
  message: string;
  timestamp: Date;
}
const RunLeftPage = forwardRef((props: RunProps, ref) => {
  const {
    isSelfCheck,
    isSelfChecking,
    selfCheckMessages,
    currentStatus,
    onDataChange,
    onPonitChange,
    onRowSelect,
    currentItemCmd,
    logs,
  } = props;
  const [state, setState] = useSetState<any>({
    isExpandAll: true,
    dataSource: [],
    expandedRowKeys: [],
    selectedRowKey: null, // ✅ 当前仅选中一条
  });

  const { isExpandAll, dataSource, expandedRowKeys, selectedRowKey } = state;
  const isActiveRow = (record: any) => {
    const pos = currentItemCmd;
    if (!pos) return false;

    const rowKey = record.key ?? record.id;
    const rowGroup = record.group; // 如果你的“项目ID”存在 group 字段

    const hitItem =
      rowGroup === pos.itemindex ||
      rowKey === pos.itemindex ||
      record.itemindex === pos.itemindex;

    const hitCmd = rowKey === pos.cmdindex || record.cmdindex === pos.cmdindex;

    // 有 children 的当项目行处理，命中 item 就高亮；叶子当命令行处理，命中 cmd 高亮
    if (record.children?.length) return hitItem;
    return hitCmd || (hitItem && !pos.cmdindex);
  };
  const selectRow = (record: any) => {
    const key = record.key || record.id;
    setState({ selectedRowKey: key });
    onRowSelect?.(record);
  };
  useEffect(() => {
    requestData();
  }, []);
  useEffect(() => {
    console.log(logs);
  }, [logs]);
  // 数据加载后，若开启“按命令展开所有项目”，默认展开全部可展开的行
  useEffect(() => {
    if (isExpandAll && dataSource && dataSource.length > 0) {
      const allExpandableKeys = dataSource
        .filter((item: any) => item.children && item.children.length > 0)
        .map((item: any) => item.key || item.id);
      setState({ expandedRowKeys: allExpandableKeys });
    }
  }, [dataSource, isExpandAll]);
  useEffect(() => {
    if (onDataChange) {
      onDataChange(dataSource);
    }
  }, [dataSource, onDataChange]);

  const requestData: any = async () => {
    try {
      if (!props.autoId) return;
      const { code, data, message: msg } = await getList(String(props.autoId));
      if (code !== 0) {
        message.error(msg || "获取数据失败");
        setState({ dataSource: [] });
        return;
      }
      console.log("formatTableTreeData(data) ", formatTableTreeData(data));

      setState({ dataSource: formatTableTreeData(data) });
    } catch {
      setState({ dataSource: [] });
    }
  };

  // 定义表格列
  const columns = [
    {
      title: "序列名称",
      dataIndex: "sequence_name",
      ellipsis: true,
      render: (text: string, record: any) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {record.breakpoint && <span className="breakpoint-dot" />}
          {text}
        </div>
      ),
    },
    {
      title: "命令名称",
      dataIndex: "command",
      ellipsis: true,
    },
    {
      title: "命令参数",
      dataIndex: "InPara",
      ellipsis: true,
      render: (text: any, record: any) => {
        return record?.InPara ? (
          <span>
            {record?.InPara},{record?.OutPara}
          </span>
        ) : (
          <span>{record?.OutPara}</span>
        );
      },
    },
    {
      title: "是否合格",
      dataIndex: "Qualified",
      ellipsis: true,
    },
  ];
  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    clearAllBreakpoints,
  }));

  const setBreakpoint = (targetKey: any, nodes: any = dataSource) => {
    const newData = nodes.map((item: any) => {
      const itemKey = item.key ?? item.id;
      if (itemKey === targetKey) return { ...item, breakpoint: true };
      if (item.children)
        return { ...item, children: setBreakpoint(targetKey, item.children) };
      return item;
    });

    console.log("newData", newData);

    setState({ dataSource: newData });
    onPonitChange?.(newData);
    return newData;
  };

  const cancelBreakpoint = (targetKey: any, nodes: any = dataSource) => {
    const newData = nodes.map((item: any) => {
      const itemKey = item.key ?? item.id;
      if (itemKey === targetKey) return { ...item, breakpoint: false };
      if (item.children)
        return {
          ...item,
          children: cancelBreakpoint(targetKey, item.children),
        };
      return item;
    });
    setState({ dataSource: newData });
    onPonitChange?.(newData);
    return newData;
  };

  // 取消所有断点
  const clearAllBreakpoints = (nodes: any = dataSource) => {
    const newData = nodes.map((item: any) => ({
      ...item,
      breakpoint: false,
      children: item.children ? clearAllBreakpoints(item.children) : undefined,
    }));
    setState({ dataSource: newData });
    return newData;
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
          按命令展开所有序列
        </Checkbox>
      </div>
      <Table<any>
        bordered
        columns={columns}
        scroll={{ y: 300 }}
        indentSize={0} // 取消树形缩进
        dataSource={dataSource}
        rowKey={(record) => record.key || record.id}
        pagination={false}
        // rowClassName={(record) =>
        //   selectedRowKey === (record.key || record.id) ? "row-selected" : ""
        // }
        rowClassName={(record) => {
          const selected = selectedRowKey === (record.key || record.id);
          const active = isActiveRow(record);
          return `${selected ? "row-selected" : ""} ${
            active ? "row-active" : ""
          }`.trim();
        }}
        onRow={(record) => ({
          onClick: () => {
            selectRow(record);
            const targetKey = record.key ?? record.id;
            cancelBreakpoint(targetKey);
          },

          onDoubleClick: () => {
            selectRow(record);
            const targetKey = record.key ?? record.id;
            setBreakpoint(targetKey);
          },
        })}
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
          {logs.length > 0 && (
            <>
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
                  {logs.map((line: any, index: any) => {
                    let color = line?.status === "FAIL" ? "#cf1322" : "#6c757d";
                    return (
                      <div
                        key={index}
                        style={{
                          color: color,
                        }}
                      >
                        {line?.message || "-"}
                      </div>
                    );
                  })}
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
                    percent={Math.max(
                      0,
                      Math.min(100, Number(props.progress ?? 0))
                    )}
                    size="small"
                    strokeColor="#52c41a"
                    showInfo
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
            </>
          )}
        </div>
      )}
    </div>
  );
});

export default RunLeftPage;
