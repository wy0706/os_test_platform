import { getList } from "@/services/case-management/case-run.service";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useSetState } from "ahooks";
import { Card, Checkbox, message, Progress, Space, Table, Tag } from "antd";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
} from "react";
import { formatTableTreeData } from "../schemas";
import "./index.less";

interface RunProps {
  autoId: any;
  /** 自检 */
  isSelfCheck: boolean;
  isSelfChecking: boolean;
  selfCheckMessages: any[];
  /** 断点回传 */
  breakpoints: any;
  onPonitChange: (value: any) => void;
  /** 左侧选中行传给父组件 */
  onRowSelect?: (row: any) => void;
  /** 运行态高亮位置（父：itemindex，子：cmdindex） */
  currentItemCmd?: {
    itemindex?: string | number;
    cmdindex?: string | number;
    itemname?: string;
    cmdname?: string;
  };
  /** 右侧面板 */
  progress?: number;
  currentStatus: string;
  /** 运行日志（对象数组） */
  logs: {
    time: string;
    status: "SUCCESS" | "FAIL" | "INFO";
    message: string;
  }[];
  /** 可选：把数据回传给父组件 */
  onDataChange?: (data: any[]) => void;
  btnType: any; //点击的按钮类型
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
    autoId,
    isSelfCheck,
    isSelfChecking,
    selfCheckMessages = [],
    currentStatus,
    onPonitChange,
    onRowSelect,
    currentItemCmd,
    logs = [],
    progress = 0,
    btnType,
  } = props;

  const [state, setState] = useSetState<any>({
    isExpandAll: true,
    dataSource: [],
    expandedRowKeys: [] as React.Key[],
    selectedRowKey: null as null | React.Key,
  });
  const { isExpandAll, dataSource, expandedRowKeys, selectedRowKey } = state;

  /** 统一计算“当前激活行”的 key（优先子行 cmdindex，没有则用父行 itemindex） */
  const activeKey = useMemo<React.Key | null>(() => {
    if (currentItemCmd?.cmdindex != null) return currentItemCmd.cmdindex as any;
    if (currentItemCmd?.itemindex != null)
      return currentItemCmd.itemindex as any;
    return null;
  }, [currentItemCmd?.cmdindex, currentItemCmd?.itemindex]);

  /** 收集所有父节点 key（用于“展开所有”） */
  const collectAllParentKeys = (nodes: any[] = []): React.Key[] => {
    const keys: React.Key[] = [];
    const dfs = (arr: any[]) => {
      arr.forEach((n) => {
        if (Array.isArray(n.children) && n.children.length > 0) {
          keys.push(n.key ?? n.id);
          dfs(n.children);
        }
      });
    };
    dfs(nodes);
    return keys;
  };

  /** 只允许“唯一一行”高亮 */
  const isActiveRow = (record: any) => {
    if (activeKey == null) return false;
    return record.key === activeKey;
  };

  /** 选中一行（点击/运行命中都走此逻辑） */
  const selectRow = (record: any) => {
    const key = record.key ?? record.id;
    setState({ selectedRowKey: key });
    onRowSelect?.(record);
  };

  /** 初次请求数据 */
  useEffect(() => {
    (async () => {
      try {
        if (!autoId) return;
        const { code, data, message: msg } = await getList(String(autoId));
        if (code !== 0) {
          message.error(msg || "获取数据失败");
          setState({ dataSource: [], expandedRowKeys: [] });
          return;
        }
        const tree = formatTableTreeData(data);
        setState({
          dataSource: tree,
          expandedRowKeys: isExpandAll ? collectAllParentKeys(tree) : [],
        });
      } catch {
        setState({ dataSource: [], expandedRowKeys: [] });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoId]);

  /** 勾选“按命令展开所有序列” */
  useEffect(() => {
    if (isExpandAll && dataSource.length) {
      setState({ expandedRowKeys: collectAllParentKeys(dataSource) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpandAll, dataSource]);

  /** 运行态高亮：展开父项 + 选中激活行 + 平滑滚动 */
  useEffect(() => {
    if (!currentItemCmd) return;

    // 展开父项
    if (currentItemCmd.itemindex != null) {
      setState((prev: any) => {
        const next = new Set(prev.expandedRowKeys);
        next.add(currentItemCmd.itemindex as any);
        return { expandedRowKeys: Array.from(next) };
      });
    }

    // 选中激活行
    if (activeKey != null) {
      setState({ selectedRowKey: activeKey });
    }

    // 滚动到该行
    requestAnimationFrame(() => {
      if (activeKey == null) return;
      const row = document.querySelector<HTMLElement>(
        `.ant-table-row[data-row-key="${activeKey}"]`
      );
      const body = document.querySelector<HTMLElement>(".ant-table-body");
      if (row && body) {
        const rowTop = row.offsetTop;
        const rowBottom = rowTop + row.offsetHeight;
        const viewTop = body.scrollTop;
        const viewBottom = viewTop + body.clientHeight;
        if (rowTop < viewTop || rowBottom > viewBottom) {
          body.scrollTo({ top: rowTop - 24, behavior: "smooth" });
        }
      }
    });
  }, [activeKey, currentItemCmd?.itemindex]);

  /** 把最新的数据回传给父组件（如需） */
  useEffect(() => {
    props.onDataChange?.(dataSource);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource]);

  /** 打断点/取消断点/清空断点 */
  const setBreakpoint = (targetKey: any, nodes: any = dataSource) => {
    const next = nodes.map((item: any) => {
      const itemKey = item.key ?? item.id;
      if (itemKey === targetKey) return { ...item, breakpoint: true };
      if (item.children)
        return { ...item, children: setBreakpoint(targetKey, item.children) };
      return item;
    });
    setState({ dataSource: next });
    onPonitChange?.(next);
    return next;
  };
  const cancelBreakpoint = (targetKey: any, nodes: any = dataSource) => {
    const next = nodes.map((item: any) => {
      const itemKey = item.key ?? item.id;
      if (itemKey === targetKey) return { ...item, breakpoint: false };
      if (item.children)
        return {
          ...item,
          children: cancelBreakpoint(targetKey, item.children),
        };
      return item;
    });
    setState({ dataSource: next });
    onPonitChange?.(next);
    return next;
  };
  const clearAllBreakpoints = (nodes: any = dataSource) => {
    const next = nodes.map((item: any) => ({
      ...item,
      breakpoint: false,
      children: item.children ? clearAllBreakpoints(item.children) : undefined,
    }));
    setState({ dataSource: next });
    return next;
  };

  /** 结果状态配置 */
  const getStatusConfig = (status: string) => {
    const map = {
      IDLE: { color: "green", text: "IDLE", description: "测试结束" },
      PASS: { color: "green", text: "PASS", description: "测试成功" },
      FAIL: { color: "red", text: "FAIL", description: "测试失败" },
      BREAK: { color: "orange", text: "BREAK", description: "处于暂停状态" },
      TEST: { color: "blue", text: "TEST", description: "正在运行测试" },
      ERROR: { color: "red", text: "ERROR", description: "设备通信DLL错误" },
    } as const;
    return (map as any)[status] || map.TEST;
  };

  /** 列定义（保持你的展示字段） */
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
    { title: "命令名称", dataIndex: "command", ellipsis: true },
    {
      title: "命令参数",
      dataIndex: "InPara",
      ellipsis: true,
      render: (_: any, record: any) =>
        record?.InPara ? (
          <span>
            {record?.InPara},{record?.OutPara}
          </span>
        ) : (
          <span>{record?.OutPara}</span>
        ),
    },
    { title: "是否合格", dataIndex: "Qualified", ellipsis: true },
  ];

  /** 暴露方法给父组件 */
  useImperativeHandle(ref, () => ({ clearAllBreakpoints }));

  return (
    <div className="runLeftPage-page">
      {/* 顶部：展开控制 */}
      <div style={{ marginBottom: 10 }}>
        <Checkbox
          checked={isExpandAll}
          onChange={(e) => {
            const checked = e.target.checked;
            setState({
              isExpandAll: checked,
              expandedRowKeys: checked ? collectAllParentKeys(dataSource) : [],
            });
          }}
        >
          按命令展开所有序列
        </Checkbox>
      </div>

      {/* 左侧树表 */}
      <Table
        bordered
        columns={columns as any}
        dataSource={dataSource}
        rowKey={(r) => r.key}
        indentSize={0}
        pagination={false}
        scroll={{ y: 300 }}
        rowClassName={(record) => {
          const isSelected = selectedRowKey === record.key;
          const active = isActiveRow(record);
          return `${isSelected ? "row-selected" : ""} ${
            active ? "row-selected" : ""
          }`.trim();
        }}
        onRow={(record) => ({
          onClick: () => {
            const key = record.key;
            setState({ selectedRowKey: key });
            onRowSelect?.(record);
            // 单击取消该行断点（保持你的旧逻辑）
            cancelBreakpoint(key);
          },
          onDoubleClick: () => {
            const key = record.key;
            setState({ selectedRowKey: key });
            onRowSelect?.(record);
            setBreakpoint(key);
          },
        })}
        expandable={{
          showExpandColumn: false,
          expandedRowKeys,
          onExpand: (expanded, record) => {
            const k = record.key ?? record.id;
            const next = expanded
              ? [...expandedRowKeys, k]
              : expandedRowKeys.filter((x) => x !== k);

            const allParents = collectAllParentKeys(dataSource);
            const allExpanded = allParents.every((p) => next.includes(p));

            setState({
              expandedRowKeys: next,
              isExpandAll: allExpanded,
            });
          },
          rowExpandable: (r) =>
            Array.isArray(r.children) && r.children.length > 0,
        }}
      />

      {/* 右侧卡片（自检 or 运行信息） */}
      {isSelfCheck ? (
        <Card className="table-card" style={{ marginTop: 10 }}>
          <div className="self-check-container">
            <div className="self-check-header">
              <h3>自检信息</h3>
              {isSelfCheck && (
                <div className="self-check-status">
                  <span className="loading-dot" />
                  自检中...
                </div>
              )}
            </div>

            <div className="self-check-content">
              {!selfCheckMessages?.length ? (
                <div className="no-messages">
                  {isSelfChecking ? "正在获取自检信息..." : "暂无自检信息"}
                </div>
              ) : (
                <div
                  className="messages-list"
                  style={{
                    height: "100%",
                    overflowY: "auto",
                    backgroundColor: "#f8f9fa",
                    borderRadius: 4,
                    padding: 8,
                    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                    fontSize: 11,
                    lineHeight: 1.4,
                  }}
                >
                  {selfCheckMessages
                    .filter((x: SelfCheckMessage) => x && x.deviceType)
                    .map((m: SelfCheckMessage) => (
                      <div key={m.id} className="message-line">
                        <span className="device-name">
                          {m.deviceType} {m.serialNumber}
                        </span>
                        <span className="error-message">{m.message}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      ) : (
        // 非自检：展示运行信息 + 进度 + 结果

        <div style={{ minHeight: 400 }}>
          {/* 运行信息 */}
          {btnType === "RUN" && (
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
                bordered
              >
                <div
                  className="console-output"
                  style={{
                    height: 120,
                    overflowY: "auto",
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: 4,
                    padding: 8,
                    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                    fontSize: 11,
                    lineHeight: 1.4,
                  }}
                >
                  {logs.map((line, idx) => {
                    const color =
                      line.status === "FAIL"
                        ? "#cf1322"
                        : line.status === "SUCCESS"
                        ? "#52c41a"
                        : "#6c757d";
                    return (
                      <div key={idx} style={{ color }}>
                        [{line.time}] {line.message}
                      </div>
                    );
                  })}
                </div>
              </Card>
              {/* 进度 */}
              <Card
                size="small"
                style={{ marginTop: 12 }}
                title={
                  <Space>
                    <InfoCircleOutlined style={{ color: "#1890ff" }} />
                    <span>Progress</span>
                  </Space>
                }
                bordered
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Progress
                    percent={Math.max(0, Math.min(100, Number(progress ?? 0)))}
                    size="small"
                    strokeColor="#52c41a"
                    showInfo
                  />
                </Space>
              </Card>
              {/* 结果 */}
              <Card
                size="small"
                style={{ marginTop: 12 }}
                title={
                  <Space>
                    <InfoCircleOutlined style={{ color: "#1890ff" }} />
                    <span>Result</span>
                  </Space>
                }
                bordered
              >
                <div style={{ textAlign: "center", padding: "8px 0" }}>
                  <Tag
                    color={getStatusConfig(currentStatus).color}
                    style={{ fontSize: 14, padding: "4px 12px" }}
                  >
                    {getStatusConfig(currentStatus).text}
                  </Tag>
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
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
