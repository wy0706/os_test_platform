import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { ActionType, ProTable } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Card, Empty, message, Modal, Tree, Typography } from "antd";
import React, { useEffect, useRef } from "react";

import {
  deleteCmd,
  getCmdList,
  getCmdTreeList,
  getCommentOne,
  insertCmd,
  moveDownCmd,
  moveUpCmd,
} from "@/services/case-management/test-sequence-edit.service";

import "./index.less";
import ParamForm from "./modals/paramForm";
import ProcessModal from "./modals/processModal";
import { buildCommandTreeData } from "./schemas";

const { Text } = Typography;

interface ProcessProps {
  selectedId?: number | null; // 用稳定主键 id 作为受控选中
  onSelectedChange?: (id: number | null, index: number) => void;
}

const Process: React.FC<ProcessProps> = ({
  selectedId: controlledSelectedId,
  onSelectedChange,
}) => {
  const actionRef = useRef<ActionType>();
  const [state, setState] = useSetState<any>({
    // 弹窗/参数
    isProcessModalOpen: false,
    isparamShow: false,
    updateValue: {},
    paramValue: {},
    paramType: "",
    paramExplanation: null,

    // 树
    processedTreeData: [],
    expandedKeys: [],
    selectedTreeKeys: [] as React.Key[],
    selectedCommand: "",

    // 表格与选中（以 id 为锚）
    tableData: [] as any[],
    totalCount: 0,
    selectedId: controlledSelectedId ?? null,
    selectedRowIndex: -1,
    selectedRowData: null as any,

    // 忙态
    busyRow: null as null | {
      type: "insert" | "update" | "delete" | "move";
      key?: any;
    },

    // 刷新后的单次选中策略
    pendingSelectId: null as number | null, // 优先：按 id 精准选中
    pendingFocusIndex: null as number | null, // 兜底：按 index 选中

    // 插入差集定位线索（insertCmd 不返回 id 时使用）
    pendingInsertHint: null as {
      commandKey: string; // 插入的 testcommand
      prevIdSet: Set<number>; // 插入前已有的 id 集合
      targetIndex: number; // 期望插入位置（多候选时最近优先）
    } | null,
  });

  const {
    isProcessModalOpen,
    isparamShow,
    updateValue,
    processedTreeData,
    expandedKeys,
    selectedTreeKeys,
    tableData,
    selectedRowIndex,
    paramType,
    paramExplanation,
    paramValue,
    pendingSelectId,
    pendingFocusIndex,
    pendingInsertHint,
  } = state;

  const isBusy = !!state.busyRow;
  const isInserting = state.busyRow?.type === "insert";

  const getRowCmd = (row: any) => row?.command || row?.testcommand || "";

  /** 仅更新表格选中（不联动树） */
  const handleRowClick = (record: any, index: number) => {
    setState({
      selectedId: record?.id ?? null,
      selectedRowIndex: index,
      selectedRowData: record,
    });
    onSelectedChange?.(record?.id ?? null, index);
  };

  /** 选中表格行 + 联动右侧命令树 */
  const onRowPick = (record: any, index: number) => {
    handleRowClick(record, index);
    const cmd = getRowCmd(record);
    if (cmd) syncTreeWithCommand(cmd);
    else syncTreeWithCommand("");
  };

  // 取离 target 最近的索引
  const nearestIndex = (target: number, indexes: number[]) => {
    if (!indexes.length) return -1;
    let best = indexes[0];
    let bestDiff = Math.abs(indexes[0] - target);
    for (let i = 1; i < indexes.length; i++) {
      const d = Math.abs(indexes[i] - target);
      if (d < bestDiff) {
        best = indexes[i];
        bestDiff = d;
      }
    }
    return best;
  };

  /** 表格加载后决定选中（优先级：插入差集 → pendingSelectId → 受控 id → pendingFocusIndex → 之前 index/0） */
  const handleTableLoad = (ds: any[]) => {
    setState({ tableData: ds, totalCount: ds?.length || 0 });

    if (!ds.length) {
      setState({
        selectedId: null,
        selectedRowIndex: -1,
        selectedRowData: null,
        pendingFocusIndex: null,
        pendingSelectId: null,
        pendingInsertHint: null,
      });
      syncTreeWithCommand("");
      onSelectedChange?.(null, -1);
      return;
    }

    // 0) 插入差集定位（insertCmd 不返回 id 的情况下）
    if (pendingInsertHint && !pendingSelectId) {
      const { commandKey, prevIdSet, targetIndex } = pendingInsertHint;
      const candidates: number[] = [];
      ds.forEach((r, idx) => {
        const id = Number(r?.id);
        if (
          !Number.isNaN(id) &&
          !prevIdSet.has(id) &&
          r?.testcommand === commandKey
        ) {
          candidates.push(idx);
        }
      });
      if (candidates.length > 0) {
        const pick = nearestIndex(targetIndex, candidates);
        const idx = pick >= 0 ? pick : candidates[0];
        onRowPick(ds[idx], idx); // ✅ 初次进入/重载后用 onRowPick 联动树
        setState({ pendingInsertHint: null, pendingFocusIndex: null });
        return;
      }
      setState({ pendingInsertHint: null });
    }

    // 1) 刚刚操作指定了 pendingSelectId
    if (pendingSelectId != null) {
      const i = ds.findIndex((r) => String(r?.id) === String(pendingSelectId));
      if (i >= 0) {
        onRowPick(ds[i], i); // ✅ 改为 onRowPick
        setState({ pendingSelectId: null, pendingFocusIndex: null });
        return;
      }
      setState({ pendingSelectId: null });
    }

    // 2) 父组件受控 id
    if (controlledSelectedId != null) {
      const i = ds.findIndex(
        (r) => String(r?.id) === String(controlledSelectedId)
      );
      if (i >= 0) {
        onRowPick(ds[i], i); // ✅ 改为 onRowPick
        setState({ pendingFocusIndex: null });
        return;
      }
    }

    // 3) 兜底：按 index
    if (pendingFocusIndex != null) {
      const i = Math.min(Math.max(pendingFocusIndex, 0), ds.length - 1);
      onRowPick(ds[i], i); // ✅ 改为 onRowPick
      setState({ pendingFocusIndex: null });
      return;
    }

    // 4) 再兜底：沿用原 index 或 0
    const fallback = selectedRowIndex >= 0 ? selectedRowIndex : 0;
    const idx = Math.min(Math.max(fallback, 0), ds.length - 1);
    onRowPick(ds[idx], idx); // ✅ 改为 onRowPick
  };

  const afterMutate = () => {
    actionRef.current?.reload?.();
  };

  /** —— 树相关 —— */
  const getAllTreeKeys = (treeData: any[]): string[] => {
    const keys: string[] = [];
    const traverse = (nodes: any[]) => {
      nodes.forEach((node) => {
        keys.push(node.key);
        if (node.children?.length) traverse(node.children);
      });
    };
    traverse(treeData);
    return keys;
  };

  const findCommandInTree = (
    command: string,
    treeData: any[],
    path: string[] = []
  ): string[] | null => {
    for (const node of treeData) {
      const currentPath = [...path, node.key];
      if (node.title === command || node.key === command) return currentPath;
      if (node.children?.length) {
        const res = findCommandInTree(command, node.children, currentPath);
        if (res) return res;
      }
    }
    return null;
  };

  const syncTreeWithCommand = (command?: string) => {
    if (!command) {
      setState({ selectedTreeKeys: [], selectedCommand: "" });
      return;
    }
    if (!processedTreeData?.length) {
      setState({ selectedTreeKeys: [], selectedCommand: command });
      return;
    }
    const commandPath = findCommandInTree(command, processedTreeData);
    if (commandPath) {
      setState({
        selectedTreeKeys: [command as unknown as React.Key],
        expandedKeys: [
          ...new Set([...expandedKeys, ...commandPath.slice(0, -1)]),
        ],
        selectedCommand: command,
      });
    } else {
      setState({ selectedTreeKeys: [], selectedCommand: command });
    }
  };

  const handleCommandClick = (command: string) => {
    setState({ isparamShow: false });
    syncTreeWithCommand(command);
  };

  // 上/下移：移动成功后仍选中“当前这条”（按稳定 id 对焦），高亮跟随到新位置
  const moveRow = async (
    record: any,
    index: number,
    direction: "up" | "down"
  ) => {
    const APiFn = direction === "up" ? moveUpCmd : moveDownCmd;
    const newIndex = direction === "up" ? index - 1 : index + 1;

    try {
      // 关键：对焦当前记录的稳定 id；index 只是兜底（防止极端情况下没找到）
      setState({
        busyRow: { type: "move", key: record?.id },
        pendingSelectId: record?.id, // ★ 用当前这条的 id 作为精准选中锚
        pendingFocusIndex: newIndex, // ★ 兜底：期望高亮的新位置
      });

      const { code, message: msg } = await APiFn({
        seq_id: record.seq_id,
        testcommand: record.testcommand,
      });
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");

      // 触发表格刷新 → handleTableLoad 会按 pendingSelectId 精准命中当前这条
      afterMutate();
    } catch (e: any) {
      message.error(e?.message || "操作失败");
    } finally {
      setState({ busyRow: null });
    }
  };

  // 删除：成功后选中“同 index 的行”，末尾则上一行
  const deleteRow = async (row: any, index: number) => {
    Modal.confirm({
      title: "确认删除吗？",
      onOk: async () => {
        try {
          const isLast = index === tableData.length - 1;
          const targetIndex = isLast ? index - 1 : index;
          const neighbor =
            targetIndex >= 0 && targetIndex < tableData.length
              ? tableData[targetIndex]
              : null;

          setState({
            busyRow: { type: "delete", key: row?.id },
            pendingSelectId: neighbor ? neighbor.id : null,
            pendingFocusIndex: neighbor ? targetIndex : null,
          });

          const { code, message: msg } = await deleteCmd(row.seq_id);
          if (code !== 0) {
            message.error(msg || "操作失败");
            return;
          }
          message.success("删除成功");
          afterMutate();
        } catch (e: any) {
        } finally {
          setState({ busyRow: null });
        }
      },
    });
  };

  // 插入：insertCmd 不返回新 id → 使用差集定位
  const insertAt = async (
    nodeKey: string,
    nodeTitle: string
  ): Promise<boolean> => {
    if (Number(state.totalCount) > 299) {
      message.warning("数量已达上限");
      return false;
    }

    // 目标插入位置（当前行之后 / 末尾）
    const targetIndex =
      state.selectedRowIndex >= 0
        ? state.selectedRowIndex + 1
        : state.tableData.length;

    // 供接口用的 seq_id（显示顺序），但不作为选中锚
    const lastSeq = state.tableData?.length
      ? Math.max(...state.tableData.map((r: any) => Number(r.seq_id) || 0))
      : 0;
    const baseSeq =
      state.selectedRowIndex >= 0
        ? Number(state.tableData[state.selectedRowIndex]?.seq_id) || lastSeq
        : lastSeq;
    const targetSeqId = baseSeq + 1;

    // 差集线索：插入前的 id 集合 + 命令 key + 目标位置
    const prevIdSet = new Set<number>(
      state.tableData
        .map((r: any) => Number(r?.id))
        .filter((x) => !Number.isNaN(x))
    );

    const params = { seq_id: targetSeqId, testcommand: nodeKey };
    const loadingKey = "cmd-insert";

    try {
      setState({
        busyRow: { type: "insert" },
        pendingSelectId: null, // 没有后端新 id，只能靠差集
        pendingFocusIndex: targetIndex, // 兜底按 index
        pendingInsertHint: {
          commandKey: String(nodeKey),
          prevIdSet,
          targetIndex,
        },
      });
      message.loading({ content: "正在插入…", key: loadingKey, duration: 0 });

      const { code, message: msg } = await insertCmd(params);
      if (code !== 0) {
        message.error(msg || "插入失败");
        setState({ pendingInsertHint: null });
        return false;
      }

      message.success({ content: `已插入 ${nodeTitle}`, key: loadingKey });
      afterMutate(); // reload → handleTableLoad 里做差集定位
      return true;
    } catch (e: any) {
      setState({ pendingInsertHint: null });
      return false;
    } finally {
      message.destroy(loadingKey);
      setState({ busyRow: null });
    }
  };

  /** —— 注释 —— */
  const getComment = async (testcommand: any) => {
    try {
      const { code, data, message: msg } = await getCommentOne(testcommand);
      if (code !== 0) {
        message.error(msg || "获取失败");
        setState({ paramExplanation: "" });
        return;
      }
      setState({ paramExplanation: data?.comment || "" });
    } catch {
      setState({ paramExplanation: "" });
    }
  };

  /** —— 树交互 —— */
  const handleTreeDoubleClick = async (
    _e: React.MouseEvent,
    node: any
  ): Promise<void> => {
    const nodeKey = node.key as React.Key;
    const nodeTitle = node.title;

    if (node.children && node.children.length > 0) {
      message.warning("请选择具体的测试命令进行插入");
      return;
    }

    setState({
      selectedTreeKeys: [nodeKey],
      selectedCommand: String(nodeKey),
      pendingFocusIndex:
        state.selectedRowIndex >= 0
          ? state.selectedRowIndex + 1
          : state.tableData.length,
    });

    await insertAt(String(nodeKey), nodeTitle);
  };

  const handleTreeSelect = (keys: any, info: any) => {
    const level = info.node.level;
    setState({
      selectedTreeKeys: keys as React.Key[],
      selectedCommand: keys[0] && level === 2 ? String(keys[0]) : "",
    });
  };

  /** —— 生命周期 —— */
  useEffect(() => {
    if (state.selectedCommand) getComment(state.selectedCommand);
  }, [state.selectedCommand]);

  useEffect(() => {
    getTreeData();
  }, []);

  useEffect(() => {
    if (processedTreeData?.length && state.selectedCommand) {
      syncTreeWithCommand(state.selectedCommand);
    }
  }, [processedTreeData, state.selectedCommand]);

  /** —— 请求 —— */
  const requestData: any = async () => {
    const { code, data, message: msg } = await getCmdList();
    if (code !== 0) {
      message.error(msg || "获取失败");
      setState({ totalCount: 0 });
      return { data: [], total: 0, success: false };
    }
    setState({ totalCount: data?.total_cnt });
    return {
      data: data?.lib_list || [],
      total: data?.total_cnt,
      success: code === 0,
    };
  };

  const getTreeData = async () => {
    try {
      const { code, data, message: msg } = await getCmdTreeList();
      if (code !== 0) {
        message.error(msg || "获取命令失败");
        setState({ processedTreeData: [] });
        return;
      }
      const treeList = buildCommandTreeData(data || []);
      const allKeys = getAllTreeKeys(treeList);
      setState({ processedTreeData: treeList, expandedKeys: allKeys });
    } catch {
      setState({ processedTreeData: [] });
    }
  };

  /** —— 列定义 —— */
  const columns: any[] = [
    { title: "序号", dataIndex: "seq_id", width: 80 }, // 仅展示顺序
    {
      title: "激活",
      dataIndex: "active",
      valueType: "select",
      valueEnum: {
        1: { text: "✓", status: "Success" },
        0: { text: "✗", status: "Error" },
      },
    },
    { title: "标签", dataIndex: "label", ellipsis: true, editable: () => true },
    {
      title: "测试命令",
      dataIndex: "testcommand",
      editable: false,
      ellipsis: true,
      render: (_: any, record: any, index: number) => (
        <div
          style={{ cursor: "pointer", color: "#1677ff" }}
          onClick={(e) => {
            e.stopPropagation();
            handleColumnClickWithRowSelect(record, index, "COMMAND");
          }}
        >
          {record.testcommand}
        </div>
      ),
    },
    {
      title: "输入参数",
      dataIndex: "inputparams",
      editable: false,
      ellipsis: true,
      render: (_: any, record: any, index: number) => (
        <div
          style={{ cursor: "pointer", color: "#1677ff" }}
          onClick={(e) => {
            e.stopPropagation();
            setState({ paramType: "INPUT", paramValue: { ...record } });
            handleColumnClickWithRowSelect(record, index, "INPUT");
          }}
        >
          {record.inputparams || "-"}
        </div>
      ),
    },
    {
      title: "输出参数",
      dataIndex: "outputparams",
      editable: false,
      ellipsis: true,
      render: (_: any, record: any, index: number) => (
        <div
          style={{ cursor: "pointer", color: "#1677ff" }}
          onClick={(e) => {
            e.stopPropagation();
            setState({ paramType: "OUTPUT", paramValue: { ...record } });
            handleColumnClickWithRowSelect(record, index, "OUTPUT");
          }}
        >
          {record.outputparams || "-"}
        </div>
      ),
    },
    {
      title: "注释",
      dataIndex: "comment",
      editable: () => true,
      ellipsis: true,
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      width: 140,
      render: (_: any, record: any, index: number) => {
        const isFirst = index === 0;
        const isLast = index === tableData.length - 1;
        return [
          <a
            key="editable"
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(record, index);
              setState({
                isProcessModalOpen: true,
                updateValue: record,
                pendingFocusIndex: index,
              });
            }}
            style={{ marginLeft: 10, marginRight: 10, color: "#1677ff" }}
          >
            <EditOutlined style={{ marginRight: 4 }} />
          </a>,
          <a
            key="up"
            onClick={(e) => {
              e.stopPropagation();
              if (!isFirst && !isBusy) moveRow(record, index, "up");
            }}
            style={{
              marginRight: 10,
              cursor: isFirst || isBusy ? "not-allowed" : "pointer",
              opacity: isFirst || isBusy ? 0.5 : 1,
              color: isFirst || isBusy ? "#ccc" : "#1677ff",
            }}
          >
            <ArrowUpOutlined style={{ marginRight: 4 }} />
          </a>,
          <a
            key="down"
            onClick={(e) => {
              e.stopPropagation();
              if (!isLast && !isBusy) moveRow(record, index, "down");
            }}
            style={{
              marginRight: 10,
              cursor: isLast || isBusy ? "not-allowed" : "pointer",
              opacity: isLast || isBusy ? 0.5 : 1,
              color: isLast || isBusy ? "#ccc" : "#1677ff",
            }}
          >
            <ArrowDownOutlined style={{ marginRight: 4 }} />
          </a>,
          <a
            key="delete"
            onClick={(e) => {
              e.stopPropagation();
              if (!isBusy) deleteRow(record, index);
            }}
            style={{ color: "#ff4d4f" }}
          >
            <DeleteOutlined style={{ marginRight: 4 }} />
          </a>,
        ];
      },
    },
  ];

  const handleColumnClickWithRowSelect = (
    record: any,
    index: number,
    mode: string
  ) => {
    onRowPick(record, index);
    if (mode === "COMMAND") {
      const cmd = getRowCmd(record);
      if (cmd) handleCommandClick(cmd);
    } else {
      setState({ isparamShow: true });
    }
  };

  return (
    <div className="process-page">
      {/* 左侧表格区域 */}
      <div className="process-left">
        <ProTable
          actionRef={actionRef}
          columns={columns}
          request={requestData}
          rowKey={(row) => String(row?.id)} // ✅ 稳定主键 id
          search={false}
          options={false}
          pagination={false}
          loading={isBusy}
          toolBarRender={() => [
            <Button
              key="button"
              icon={<PlusOutlined />}
              loading={isInserting}
              disabled={isBusy}
              onClick={() => {
                if (!selectedTreeKeys?.length)
                  return message.warning("请先选择要插入的测试命令");

                // 找到选中的叶子命令节点
                const findNodeInTree = (tree: any[], key: string): any => {
                  for (const node of tree) {
                    if (node.key === key) return node;
                    if (node.children?.length) {
                      const res = findNodeInTree(node.children, key);
                      if (res) return res;
                    }
                  }
                  return null;
                };
                const nodeKey = String(selectedTreeKeys[0]);
                const selectedNode = findNodeInTree(processedTreeData, nodeKey);
                if (!selectedNode)
                  return message.warning("未找到选中的测试命令");
                if (selectedNode.children?.length)
                  return message.warning("请选择具体的测试命令进行插入");

                // 设置兜底 index，并走插入（reload 后差集定位）
                const targetIndex =
                  state.selectedRowIndex >= 0
                    ? state.selectedRowIndex + 1
                    : state.tableData.length;
                setState({ pendingFocusIndex: targetIndex });
                insertAt(nodeKey, selectedNode.title);
              }}
            >
              插入
            </Button>,
          ]}
          size="small"
          onRow={(record, index) => ({
            onClick: () => !isBusy && onRowPick(record, index || 0),
          })}
          rowClassName={(_, index) =>
            selectedRowIndex === index ? "selected-row" : ""
          }
          onLoad={handleTableLoad}
        />
      </div>

      {/* 右侧区域 */}
      <div className="process-right">
        <Card size="small" className="param-explanation-card">
          <div className="param-content">
            <div style={{ marginBottom: 10 }}>
              <Text strong>命令注释:</Text>
            </div>
            {paramExplanation ? (
              <Text style={{ whiteSpace: "pre-wrap" }} className="param-desc">
                {paramExplanation}
              </Text>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </Card>

        <Card size="small" className="tree-card">
          <div
            style={{
              pointerEvents: isBusy ? "none" : "auto",
              opacity: isBusy ? 0.6 : 1,
            }}
          >
            <Tree
              treeData={processedTreeData}
              expandedKeys={expandedKeys}
              onExpand={(keys) => setState({ expandedKeys: keys as string[] })}
              selectedKeys={selectedTreeKeys}
              onSelect={(keys, info) => {
                const level = info.node.level;
                setState({
                  selectedTreeKeys: keys as React.Key[],
                  selectedCommand:
                    keys[0] && level === 2 ? String(keys[0]) : "",
                });
              }}
              onDoubleClick={async (e, node) => {
                const nodeKey = node.key as React.Key;
                const nodeTitle = node.title;
                if (node.children && node.children.length > 0) {
                  message.warning("请选择具体的测试命令进行插入");
                  return;
                }
                setState({
                  selectedTreeKeys: [nodeKey],
                  selectedCommand: String(nodeKey),
                  pendingFocusIndex:
                    state.selectedRowIndex >= 0
                      ? state.selectedRowIndex + 1
                      : state.tableData.length,
                });
                await insertAt(String(nodeKey), nodeTitle);
              }}
              showIcon
              className="command-tree"
            />
          </div>
        </Card>
      </div>

      {/* 参数弹窗 */}
      <ParamForm
        type={paramType}
        open={isparamShow}
        updateValue={paramValue}
        onCancel={() => setState({ isparamShow: false, updateValue: {} })}
        onOk={() => {
          setState({ isparamShow: false, updateValue: {} });
          afterMutate();
        }}
      />

      {/* 编辑弹窗 */}
      <ProcessModal
        open={isProcessModalOpen}
        updateValue={updateValue}
        onCancel={() =>
          setState({ isProcessModalOpen: false, updateValue: {} })
        }
        onOk={async () => {
          setState({ isProcessModalOpen: false, updateValue: {} });
          afterMutate();
        }}
      />
    </div>
  );
};

export default Process;
