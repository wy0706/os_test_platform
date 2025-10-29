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
  selectedId?: number | null; // 受控：选中 seq_id
  onSelectedChange?: (id: number | null, index: number) => void;
}

const Process: React.FC<ProcessProps> = ({ selectedId, onSelectedChange }) => {
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

    // 表格与选中：以 seq_id 为锚
    tableData: [] as any[],
    totalCount: 0,
    selectedSeqId: null as number | null, // 主锚
    selectedRowIndex: -1, // 高亮
    selectedRowData: null as any,

    // 忙态
    busyRow: null as null | {
      type: "insert" | "update" | "delete" | "move";
      key?: any;
    },

    // 刷新后优先聚焦的行下标（与 Result 一致）
    pendingFocusIndex: null as number | null,
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
    selectedSeqId,
    paramType,
    paramExplanation,
    paramValue,
  } = state;

  const isBusy = !!state.busyRow;
  const isInserting = state.busyRow?.type === "insert";

  const getRowCmd = (row: any) => row?.command || row?.testcommand || "";

  const ensureSelected = (record: any, index: number) => {
    const id = record?.seq_id ?? null;
    setState({
      selectedSeqId: id,
      selectedRowIndex: index,
      selectedRowData: record,
    });
    onSelectedChange?.(id, index); // ★ 回写父组件
  };

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
    // 没有命令：清空树选中 & 清空选中命令
    if (!command) {
      setState({ selectedTreeKeys: [], selectedCommand: "" });
      return;
    }

    // 树尚未就绪：清空树选中，但保留 selectedCommand（注释区仍可展示）
    if (!processedTreeData?.length) {
      setState({
        selectedTreeKeys: [],
        selectedCommand: command,
      });
      return;
    }

    const commandPath = findCommandInTree(command, processedTreeData);
    if (commandPath) {
      // 找到了：选中命令节点并展开父节点
      setState({
        selectedTreeKeys: [command as unknown as React.Key],
        expandedKeys: [
          ...new Set([...expandedKeys, ...commandPath.slice(0, -1)]),
        ],
        selectedCommand: command,
      });
    } else {
      //找不到：清空树选中，但保留 selectedCommand（仅取消树上的高亮）
      setState({
        selectedTreeKeys: [],
        selectedCommand: command,
      });
    }
  };

  const handleCommandClick = (command: string) => {
    setState({ isparamShow: false });
    syncTreeWithCommand(command);
  };
  // const handleCommandClick = (command: string) => {
  //   // 点击“测试命令”列显式联动树
  //   setState({ isparamShow: false, selectedCommand: command });
  //   if (processedTreeData.length) {
  //     const commandPath = findCommandInTree(command, processedTreeData);
  //     if (commandPath) {
  //       setState({
  //         selectedTreeKeys: [command],
  //         expandedKeys: [
  //           ...new Set([...expandedKeys, ...commandPath.slice(0, -1)]),
  //         ],
  //       });
  //     }
  //   }
  // };

  // 选中表格行 → 联动树
  const handleRowClick = (record: any, index: number) => {
    ensureSelected(record, index);
    const cmd = getRowCmd(record);
    if (cmd) syncTreeWithCommand(cmd);
    else syncTreeWithCommand("");
  };
  const afterMutate = () => {
    actionRef.current?.reload?.();
  };

  const handleTableLoad = (ds: any[]) => {
    setState({ tableData: ds, totalCount: ds?.length || 0 });

    if (!ds.length) {
      setState({
        selectedSeqId: null,
        selectedRowIndex: -1,
        selectedRowData: null,
        pendingFocusIndex: null,
      });
      syncTreeWithCommand("");
      onSelectedChange?.(null, -1); // ★ 清空上报
      return;
    }

    // ★ (0) 最高优先：父组件受控 selectedId
    if (selectedId != null) {
      const i = ds.findIndex((r) => String(r?.seq_id) === String(selectedId));
      if (i >= 0) {
        handleRowClick(ds[i], i);
        return;
      }
    }

    // (1) 其次：pendingFocusIndex
    if (state.pendingFocusIndex != null) {
      const i = Math.min(Math.max(state.pendingFocusIndex, 0), ds.length - 1);
      handleRowClick(ds[i], i);
      setState({ pendingFocusIndex: null });
      return;
    }

    // (2) 再次：本地 selectedSeqId
    let idx = -1;
    if (selectedSeqId != null) {
      idx = ds.findIndex((r) => String(r?.seq_id) === String(selectedSeqId));
    }

    // (3) 兜底：上次 index 或 0（满足“有数据默认第一条”）
    if (idx < 0) {
      const fallback = state.selectedRowIndex >= 0 ? state.selectedRowIndex : 0;
      idx = Math.min(Math.max(fallback, 0), ds.length - 1);
    }
    handleRowClick(ds[idx], idx);
  };

  const moveRow = async (
    record: any,
    index: number,
    direction: "up" | "down"
  ) => {
    const APiFn = direction === "up" ? moveUpCmd : moveDownCmd;
    const nextIndex = direction === "up" ? index - 1 : index + 1;

    try {
      ensureSelected(record, index); // 显式保持“当前行”
      // 刷新后希望聚焦的新位置（从而触发行→树同步）
      setState({
        busyRow: { type: "move", key: record?.seq_id },
        pendingFocusIndex: nextIndex,
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
      afterMutate();
    } catch (e: any) {
      message.error(e?.message || "操作失败");
    } finally {
      setState({ busyRow: null });
    }
  };

  const deleteRow = async (row: any, index: number) => {
    Modal.confirm({
      title: "确认删除吗？",
      onOk: async () => {
        try {
          ensureSelected(row, index);
          // 删除后聚焦“下一条”（中间删）或“上一条”（末尾删）
          const isLast = index === state.tableData.length - 1;
          const target = isLast ? index - 1 : index;
          setState({
            busyRow: { type: "delete", key: row?.seq_id },
            pendingFocusIndex: target >= 0 ? target : null,
          });

          const { code, message: msg } = await deleteCmd(row.seq_id);
          if (code !== 0) {
            message.error(msg || "操作失败");
            return;
          }
          message.success("删除成功");
          afterMutate();
        } catch (e: any) {
          message.error(e?.message || "操作失败");
        } finally {
          setState({ busyRow: null });
        }
      },
    });
  };

  // === 插入：设置 pendingFocusIndex + 顶部 loading，reload 后选中并联动树 ===
  const insertAt = async (
    nodeKey: string,
    nodeTitle: string
  ): Promise<boolean> => {
    if (Number(state.totalCount) > 299) {
      message.warning("数量已达上限");
      return false;
    }

    // 插入目标 seq_id 与 刷新后期望聚焦的 index（当前行后 or 末尾）
    const lastSeq = state.tableData?.length
      ? Math.max(...state.tableData.map((r: any) => Number(r.seq_id) || 0))
      : 0;
    const targetSeqId = (state.selectedSeqId ?? lastSeq) + 1;
    const targetIndex =
      state.selectedRowIndex >= 0
        ? state.selectedRowIndex + 1
        : state.tableData.length;

    const params = { seq_id: targetSeqId, testcommand: nodeKey };
    const loadingKey = "cmd-insert";

    try {
      setState({ busyRow: { type: "insert" }, pendingFocusIndex: targetIndex });
      message.loading({ content: "正在插入…", key: loadingKey, duration: 0 });

      const { code, message: msg } = await insertCmd(params);
      if (code !== 0) {
        message.error(msg || "插入失败");
        return false;
      }

      message.success({ content: `已插入 ${nodeTitle}`, key: loadingKey });
      afterMutate(); // reload → handleTableLoad → handleRowClick → syncTreeWithCommand
      return true;
    } catch (e: any) {
      message.error(e?.message || "插入失败");
      return false;
    } finally {
      message.destroy(loadingKey);
      setState({ busyRow: null });
    }
  };

  // 注释
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

  // 双击树插入：也会设置 pendingFocusIndex；reload 后选中并联动树
  const handleTreeDoubleClick = async (
    event: React.MouseEvent,
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

  useEffect(() => {
    // 任意时点只要 selectedCommand 变化就拉注释
    getComment(state.selectedCommand);
  }, [state.selectedCommand]);
  useEffect(() => {
    getTreeData();
  }, []);

  useEffect(() => {
    if (processedTreeData?.length && state.selectedCommand) {
      syncTreeWithCommand(state.selectedCommand);
    }
  }, [processedTreeData, state.selectedCommand]);
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

  const columns: any[] = [
    { title: "序号", dataIndex: "seq_id", width: 80 },
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
            handleColumnClickWithRowSelect(record, index, "INPUT");
            setState({ paramType: "INPUT", paramValue: { ...record } });
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
            setState({ paramType: "OUT", paramValue: { ...record } });
            handleColumnClickWithRowSelect(record, index, "OUT");
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
              ensureSelected(record, index);
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

  // 列点击：行选择 + 模式切换（COMMAND 会显式联动树）
  const handleColumnClickWithRowSelect = (
    record: any,
    index: number,
    mode: string
  ) => {
    handleRowClick(record, index);
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
          rowKey={(row) => String(row?.seq_id)}
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
                const selectedNodeKey = selectedTreeKeys[0] as string;

                const findNodeInTree = (treeData: any[], key: string): any => {
                  for (const node of treeData) {
                    if (node.key === key) return node;
                    if (node.children?.length) {
                      const found = findNodeInTree(node.children, key);
                      if (found) return found;
                    }
                  }
                  return null;
                };
                const selectedNode = findNodeInTree(
                  processedTreeData,
                  selectedNodeKey
                );
                if (!selectedNode)
                  return message.warning("未找到选中的测试命令");
                if (selectedNode.children?.length)
                  return message.warning("请选择具体的测试命令进行插入");

                // 工具栏插入：当前选中行后 or 末尾；reload 后选中并联动树
                const targetIndex =
                  state.selectedRowIndex >= 0
                    ? state.selectedRowIndex + 1
                    : state.tableData.length;
                setState({ pendingFocusIndex: targetIndex });
                insertAt(selectedNodeKey, selectedNode.title);
              }}
            >
              插入
            </Button>,
          ]}
          size="small"
          onRow={(record, index) => ({
            onClick: () => !isBusy && handleRowClick(record, index || 0),
          })}
          rowClassName={(_, index) =>
            selectedRowIndex === index ? "selected-row" : ""
          }
          onLoad={handleTableLoad}
        />
      </div>

      {/* 右侧区域 */}
      <div className="process-right">
        {/* 参数解释区域 */}
        <Card size="small" className="param-explanation-card">
          <div className="param-content">
            <div style={{ marginBottom: 10 }}>
              <Text strong>命令注释:</Text>
            </div>
            {paramExplanation ? (
              <Text className="param-desc">{paramExplanation}</Text>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </Card>

        {/* 树形结构区域 */}
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
              onSelect={handleTreeSelect}
              onDoubleClick={handleTreeDoubleClick}
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
