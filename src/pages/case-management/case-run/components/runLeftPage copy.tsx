import { getList } from "@/services/case-management/case-run.service";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useSetState } from "ahooks";
import { Card, Checkbox, message, Progress, Space, Table, Tag } from "antd";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { formatTableTreeData } from "../schemas";
import "./index.less";

interface RunProps {
  autoId: any;
  /** 自检 */
  isSelfChecking: boolean; //是否正在自检中
  selfCheckMessages: any[];
  /** 断点回传 */
  breakpoints: any;
  onPonitChange?: (payload: { data: any[]; pointsSeq: React.Key[] }) => void;
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
  onRowSelectChange?: (row: any) => void;
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
    pointsSeq: [] as React.Key[], // ← 统一命名
    loading: false,
  });
  const {
    isExpandAll,
    dataSource,
    expandedRowKeys,
    selectedRowKey,
    pointsSeq,
    loading,
  } = state;
  const messageBoxRef = useRef<HTMLDivElement | null>(null);
  const selfCheckBoxRef = useRef<HTMLDivElement | null>(null);
  const smartScrollToBottom = (el: HTMLElement | null) => {
    if (!el) return;
    const threshold = 24; // 距离底部阈值（像素）
    const isNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    if (!isNearBottom) return; // 用户在看历史时，不打断
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  };
  useEffect(() => {
    smartScrollToBottom(messageBoxRef.current);
  }, [logs]);

  // 自检消息变化时自动滚动到底（自检面板）
  useEffect(() => {
    smartScrollToBottom(selfCheckBoxRef.current);
  }, [selfCheckMessages]);
  /** 统一计算“当前激活行”的 key（优先子行 cmdindex，没有则用父行 itemindex） */
  const activeKey = useMemo<React.Key | null>(() => {
    if (currentItemCmd?.cmdindex != null) return currentItemCmd.cmdindex as any;
    if (currentItemCmd?.itemindex != null)
      return currentItemCmd.itemindex as any;
    return null;
  }, [currentItemCmd?.cmdindex, currentItemCmd?.itemindex]);
  const initBreakpointSeqFromTree = (nodes: any[]): React.Key[] => {
    const seq: React.Key[] = [];
    const dfs = (arr: any[]) => {
      arr.forEach((n) => {
        if (n.breakpoint) seq.push(n.key ?? n.id);
        if (Array.isArray(n.children)) dfs(n.children);
      });
    };
    dfs(nodes);
    return seq;
  };
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

  /** 初次请求数据 */
  useEffect(() => {
    (async () => {
      try {
        if (!autoId) return;
        setState({ loading: true });
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
          pointsSeq: initBreakpointSeqFromTree(tree),
        });
      } catch {
        setState({ dataSource: [], expandedRowKeys: [] });
      } finally {
        setState({ loading: false });
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
  const isCmdEmpty =
    !currentItemCmd ||
    (typeof currentItemCmd === "object" &&
      currentItemCmd !== null &&
      Object.keys(currentItemCmd).length === 0) ||
    (currentItemCmd?.itemindex == null && currentItemCmd?.cmdindex == null);
  // 当运行结束（或被清空）时，清除选中与高亮
  useEffect(() => {
    if (isCmdEmpty) {
      setState({ selectedRowKey: null });
    }
  }, [isCmdEmpty]);
  /** 运行态高亮：展开父项 + 选中激活行 + 平滑滚动 */
  useEffect(() => {
    if (isCmdEmpty) return;
    // 展开父项
    if (currentItemCmd.itemindex != null) {
      setState((prev: any) => {
        const next = new Set(prev.expandedRowKeys);
        next.add(currentItemCmd.itemindex as any);
        return { expandedRowKeys: Array.from(next) };
      });
    }

    // 选中激活行（运行时高亮）
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
  }, [activeKey, currentItemCmd?.itemindex, isCmdEmpty]);

  /** 把最新的数据回传给父组件 */
  // useEffect(() => {
  //   props.onDataChange?.(dataSource);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [dataSource]);

  useEffect(() => {
    props.onRowSelectChange?.(dataSource);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource]);

  const updateTree = (nodes: any[], updater: (n: any) => any): any[] =>
    nodes.map((n) => ({
      ...updater(n),
      children: Array.isArray(n.children)
        ? updateTree(n.children, updater)
        : n.children,
    }));

  // 在树中按 key 找节点
  const findNodeByKey = (nodes: any[], targetKey: React.Key): any | null => {
    for (const n of nodes) {
      const k = n.key ?? n.id;
      if (k === targetKey) return n;
      if (Array.isArray(n.children)) {
        const r = findNodeByKey(n.children, targetKey);
        if (r) return r;
      }
    }
    return null;
  };

  // 生成“行数据快照”
  const toSnapshot = (row: any) => {
    return {
      key: row.key ?? row.id,
      itemindex: row.itemindex,
      cmdindex: row.cmdindex,
      // sequence_name: row.sequence_name,
    };
  };

  // 根据 key 去重并把新的/更新的快照放到队尾
  const upsertSnapshotToTail = (seq: any[], snap: any) => {
    const next = seq.filter((x) => x?.key !== snap.key);
    next.push(snap);
    return next;
  };
  const setBreakpoint = (targetKey: React.Key) => {
    // 1) 更新树上的 breakpoint 标记
    const nextData = updateTree(dataSource, (item) => {
      const k = item.key ?? item.id;
      if (k === targetKey) return { ...item, breakpoint: true };
      return item;
    });

    // 2) 在“更新后的树”里找到该行，做一个快照
    const row = findNodeByKey(nextData, targetKey);
    const snap = row ? toSnapshot(row) : null;

    // 3) 维护“断点顺序（行数据快照）”
    const nextSeq = snap
      ? upsertSnapshotToTail(pointsSeq ?? [], snap)
      : pointsSeq ?? [];

    // 4) 一次性更新 + 回调
    setState({ dataSource: nextData, pointsSeq: nextSeq });
    onPonitChange?.({ data: nextData, pointsSeq: nextSeq });
    return nextData;
  };

  const cancelBreakpoint = (targetKey: React.Key) => {
    const nextData = updateTree(dataSource, (item) => {
      const k = item.key ?? item.id;
      if (k === targetKey) return { ...item, breakpoint: false };
      return item;
    });

    // 从队列中移除该行（按 key）
    const nextSeq = (pointsSeq ?? []).filter((x) => x?.key !== targetKey);

    setState({ dataSource: nextData, pointsSeq: nextSeq });
    onPonitChange?.({ data: nextData, pointsSeq: nextSeq });
    return nextData;
  };
  useEffect(() => {
    console.log("=====", currentStatus);
    console.log("btnType", btnType);
  }, [currentStatus, btnType]);
  const clearAllBreakpoints = () => {
    const nextData = updateTree(dataSource, (item) => ({
      ...item,
      breakpoint: false,
    }));
    const nextSeq: any[] = [];
    setState({ dataSource: nextData, pointsSeq: nextSeq });
    onPonitChange?.({ data: nextData, pointsSeq: nextSeq });
    return nextData;
  };
  /** 结果状态配置 */
  const getStatusConfig = (status: string) => {
    const map = {
      PASS: { color: "green", text: "PASS", description: "测试成功" },
      FAIL: { color: "red", text: "FAIL", description: "测试失败" },
      BREAK: { color: "orange", text: "BREAK", description: "处于暂停状态" },
      TEST: { color: "blue", text: "TEST", description: "正在运行测试" },
      ERROR: { color: "red", text: "ERROR", description: "设备通信DLL错误" },
      STOP: { color: "red", text: "STOP", description: "停止测试" },
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
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {record.breakpoint && <span className="bp-dot" aria-label="断点" />}
          <span>{text}</span>
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

  // 根据 itemindex 设置父级行的 Qualified（PASS/FAIL/...）
  const setItemQualified = (
    targetItemIndex: number | string,
    result: string
  ) => {
    const patch = (nodes: any[]): any[] =>
      nodes.map((n) => {
        const hasChildren = Array.isArray(n.children) && n.children.length > 0;
        const matchParent = hasChildren && n.itemindex === targetItemIndex;
        return {
          ...n,
          Qualified: matchParent ? result : n.Qualified,
          children: hasChildren ? patch(n.children) : n.children,
        };
      });

    setState((prev: any) => ({
      ...prev,
      dataSource: patch(prev.dataSource || []),
    }));
  };
  const clearQualified = () => {
    const patch = (nodes: any[]): any[] =>
      nodes.map((n) => {
        const hasChildren = Array.isArray(n.children) && n.children.length > 0;
        return {
          ...n,
          Qualified: hasChildren ? undefined : n.Qualified, // 仅父级清空
          children: hasChildren ? patch(n.children) : n.children,
        };
      });

    setState((prev: any) => ({
      ...prev,
      dataSource: patch(prev.dataSource || []),
    }));
  };
  useImperativeHandle(ref, () => ({
    clearAllBreakpoints,
    setItemQualified,
    clearQualified,
  }));
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
        loading={loading}
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
            cancelBreakpoint(key); // 会把该行快照从 pointsSeq 移除
          },
          onDoubleClick: () => {
            const key = record.key;
            setState({ selectedRowKey: key });
            onRowSelect?.(record);
            setBreakpoint(key); // 会把该行快照放到 pointsSeq 队尾
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
      <div style={{ minHeight: 400 }}>
        {btnType === "CHECK_SELF" ? (
          <Card
            style={{ marginTop: 16 }}
            bordered
            size="small"
            title={
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Space>
                  <InfoCircleOutlined style={{ color: "#1890ff" }} />
                  <span>自检信息</span>
                </Space>
                {isSelfChecking && (
                  <div className="self-check-status">
                    <span className="loading-dot" />
                    自检中...
                  </div>
                )}
              </div>
            }
          >
            <div
              ref={selfCheckBoxRef}
              className="console-output"
              style={{
                height: 200,
                overflowY: "auto",
                backgroundColor: "#f8f9fa",
                borderRadius: 4,
                border: "1px solid #e9ecef",
                padding: 8,
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                fontSize: 11,
                lineHeight: 1.4,
              }}
            >
              {selfCheckMessages.map((m: any, i: any) => (
                <div
                  key={i}
                  style={{
                    color: m?.status === "SUCCESS" ? "#666" : "#cf1322",
                  }}
                >
                  {m?.message || ""}
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <>
            {(btnType === "RUN" || btnType === "STEP") && (
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
                  ref={messageBoxRef}
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
                        ? "#6c757d"
                        : "#6c757d";
                    return (
                      <div key={idx} style={{ color }}>
                        [{line.time}] {line.message}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
            {/* 进度 */}
            {btnType === "RUN" && (
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
            )}
            {/* 结果  {!!currentStatus && btnType !== "STEP"   */}
            {!!currentStatus && (
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
                {/* <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "#666",
                    textAlign: "center",
                  }}
                >
                  {getStatusConfig(currentStatus).description}
                </div> */}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
});

export default RunLeftPage;
