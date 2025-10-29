import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { ActionType, ProTable } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Card, Empty, Modal, Tree, Typography, message } from "antd";
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
import ParamForm from "./paramForm";
import ProcessModal from "./processModal";
import { buildCommandTreeData } from "./schemas";

const { Text } = Typography;

interface ProcessProps {
  selectedRowIndex?: number; // 如需受控可保留；否则可不传
}

const Process: React.FC<ProcessProps> = () => {
  const actionRef = useRef<ActionType>();
  const [state, setState] = useSetState<any>({
    // 状态
    isProcessModalOpen: false,
    isparamShow: false,
    updateValue: {},
    paramValue: {},

    // 树
    processedTreeData: [],
    expandedKeys: [],
    selectedTreeKeys: [] as React.Key[],
    selectedCommand: "",

    // 表格 / 选中：以 seq_id 作为唯一主标记
    tableData: [] as any[],
    totalCount: 0,
    selectedSeqId: null as number | null, // ⭐ 主锚
    selectedRowIndex: -1, // 仅用于渲染高亮
    selectedRowData: null as any,
    paramType: "",
    // 请求中的行
    busyRow: null as null | {
      type: "insert" | "update" | "delete" | "move";
      key?: any;
    },
    paramExplanation: null,
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
    selectedRowData,
    selectedSeqId,
    paramType,
    paramExplanation,
    paramValue,
  } = state;

  // ===== helpers =====
  const getRowCmd = (row: any) => row?.command || row?.testcommand || "";

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
      setState({
        selectedCommand: command,
        selectedTreeKeys: [command as unknown as React.Key],
      });
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
    }
  };

  const handleCommandClick = (command: string) => {
    setState({
      isparamShow: false,
      selectedCommand: command,
    });
    if (processedTreeData.length) {
      const commandPath = findCommandInTree(command, processedTreeData);
      if (commandPath) {
        setState({ selectedTreeKeys: [command] });
        const newExpanded = [
          ...new Set([...expandedKeys, ...commandPath.slice(0, -1)]),
        ];
        setState({ expandedKeys: newExpanded });
      }
    }
  };

  const handleRowClick = (record: any, index: number) => {
    setState({
      selectedSeqId: record?.seq_id ?? null,
      selectedRowIndex: index,
      selectedRowData: record,
    });
    const cmd = getRowCmd(record);
    if (cmd) syncTreeWithCommand(cmd);
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
      });
      syncTreeWithCommand("");
      return;
    }

    // 优先用 selectedSeqId 精准命中；命不中再兜底到 selectedRowIndex 或 0
    let idx = -1;
    if (selectedSeqId != null) {
      idx = ds.findIndex((r) => String(r?.seq_id) === String(selectedSeqId));
    }
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
    const delta = direction === "up" ? -1 : 1;

    try {
      setState({ busyRow: { type: "move", key: record?.seq_id } });
      const { code, message: msg } = await APiFn({
        seq_id: record.seq_id,
        testcommand: record.testcommand,
      });
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");

      // 若移动的是当前选中行，预判下一次选中的 seq_id
      if (state.selectedSeqId === record.seq_id) {
        setState({ selectedSeqId: record.seq_id + delta });
      }
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
          setState({ busyRow: { type: "delete", key: row?.seq_id } });
          const { code, message: msg } = await deleteCmd(row.seq_id);
          if (code !== 0) {
            message.error(msg || "操作失败");
            return;
          }
          message.success("删除成功");

          // 如果删除的是选中行，预先调整选中 seq_id：优先选中“下一条”，否则“上一条”
          if (state.selectedSeqId === row.seq_id) {
            const isLast = index === state.tableData.length - 1;
            const nextSeqId = isLast ? row.seq_id - 1 : row.seq_id; // 中间删：下一条补位则 seq_id 不变
            setState({ selectedSeqId: nextSeqId >= 1 ? nextSeqId : null });
          }
          afterMutate();
        } catch (e: any) {
          message.error(e?.message || "操作失败");
        } finally {
          setState({ busyRow: null });
        }
      },
    });
  };

  const insertAt = async (
    nodeKey: string,
    nodeTitle: string
  ): Promise<boolean> => {
    if (Number(state.totalCount) > 299) {
      message.warning("数量已达上限");
      return false;
    }

    // 以 seq_id 为锚：在当前选中行之后插入；若无选中则追加到末尾
    const lastSeq = state.tableData?.length
      ? Math.max(...state.tableData.map((r: any) => Number(r.seq_id) || 0))
      : 0;
    const targetSeqId = (state.selectedSeqId ?? lastSeq) + 1;
    const params = { seq_id: targetSeqId, testcommand: nodeKey };

    try {
      setState({ busyRow: { type: "insert" } });
      const { code, message: msg } = await insertCmd(params);
      if (code !== 0) {
        message.error(msg || "插入失败");
        return false;
      }
      message.success(`已插入${nodeTitle}`);
      setState({ selectedSeqId: targetSeqId }); // 新插入行作为选中
      afterMutate();
      return true;
    } catch (e: any) {
      message.error(e?.message || "插入失败");
      return false;
    } finally {
      setState({ busyRow: null });
    }
  };
  // 获取注释
  const getComment = async (testcommand: any) => {
    try {
      const { code, data, message: msg } = await getCommentOne(testcommand);
      if (code !== 0) {
        message.error(msg || "获取失败");
        setState({
          paramExplanation: "",
        });
        return;
      }
      setState({
        paramExplanation: data?.comment || "",
      });
    } catch (e) {
      setState({
        paramExplanation: "",
      });
    }
  };
  const handleTreeDoubleClick = async (
    event: React.MouseEvent,
    node: any
  ): Promise<void> => {
    const nodeKey = node.key as React.Key; // 用原始 key 做选中
    const nodeTitle = node.title;

    // 父节点拦截
    if (node.children && node.children.length > 0) {
      message.warning("请选择具体的测试命令进行插入");
      return;
    }

    // 高亮树节点
    setState({
      selectedTreeKeys: [nodeKey],
      selectedCommand: String(nodeKey),
    });

    await insertAt(String(nodeKey), nodeTitle);
  };

  const handleTreeSelect = (keys: any, info: any) => {
    console.log("keys", keys);
    console.log("info", info);

    const level = info.node.level;
    setState({
      selectedTreeKeys: keys as React.Key[],
      selectedCommand: keys[0] && level === 2 ? String(keys[0]) : "",
    });
  };

  useEffect(() => {
    getComment(state.selectedCommand);
  }, [state.selectedCommand]);

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
    } catch (error) {
      setState({ processedTreeData: [] });
    }
  };

  useEffect(() => {
    getTreeData();
  }, []);

  const columns: any[] = [
    { title: "序号", dataIndex: "index", valueType: "index", width: 80 },
    {
      title: "激活",
      dataIndex: "active",
      valueType: "select",
      valueEnum: {
        1: { text: "✓", status: "Success" },
        0: { text: "✗", status: "Error" },
      },
      editable: () => true,
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
            // e.stopPropagation();
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
            // e.stopPropagation();
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
            onClick={() =>
              setState({ isProcessModalOpen: true, updateValue: record })
            }
            style={{ marginLeft: 10, marginRight: 10, color: "#1677ff" }}
          >
            <EditOutlined style={{ marginRight: 4 }} />
          </a>,
          <a
            key="up"
            onClick={(e) => {
              if (!isFirst) moveRow(record, index, "up");
            }}
            style={{
              marginRight: 10,
              cursor: isFirst ? "not-allowed" : "pointer",
              opacity: isFirst ? 0.5 : 1,
              color: isFirst ? "#ccc" : "#1677ff",
            }}
          >
            <ArrowUpOutlined style={{ marginRight: 4 }} />
          </a>,
          <a
            key="down"
            onClick={(e) => {
              if (!isLast) moveRow(record, index, "down");
            }}
            style={{
              marginRight: 10,
              cursor: isLast ? "not-allowed" : "pointer",
              opacity: isLast ? 0.5 : 1,
              color: isLast ? "#ccc" : "#1677ff",
            }}
          >
            <ArrowDownOutlined style={{ marginRight: 4 }} />
          </a>,
          <a
            key="delete"
            onClick={(e) => {
              deleteRow(record, index);
            }}
            style={{ color: "#ff4d4f" }}
          >
            <DeleteOutlined style={{ marginRight: 4 }} />
          </a>,
        ];
      },
    },
  ];

  // 列点击：行选择 + 模式切换
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
          toolBarRender={() => [
            <Button
              key="button"
              icon={<PlusOutlined />}
              onClick={() => {
                // 从树中选择叶子后，点击插入按钮也可插入
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
                insertAt(selectedNodeKey, selectedNode.title);
              }}
            >
              插入
            </Button>,
          ]}
          size="small"
          onRow={(record, index) => ({
            onClick: () => handleRowClick(record, index || 0),
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

      {/* 编辑弹窗（示例：保存后 reload + 保持选中） */}
      <ProcessModal
        open={isProcessModalOpen}
        updateValue={updateValue}
        onCancel={() =>
          setState({ isProcessModalOpen: false, updateValue: {} })
        }
        onOk={async (value) => {
          setState({ isProcessModalOpen: false, updateValue: {} });
          afterMutate();
        }}
      />
    </div>
  );
};

export default Process;
