import {
  deleteSequenceType,
  getSequenceList,
  getTypeList,
} from "@/services/case-management/test-sequence.service";
import { deleteOne } from "@/services/task-management/test-requirement.service";
import { transformParams } from "@/utils/params";
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  ActionType,
  PageContainer,
  ProTable,
  TableDropdown,
} from "@ant-design/pro-components";
import { history, useAccess } from "@umijs/max";
import { useSetState } from "ahooks";
import { Button, Divider, Empty, message, Modal, Spin, Tree } from "antd";
import React, { useEffect, useRef } from "react";
import AddLeftModal from "./components/addLeftModal";
import AddModal from "./components/addModal";
import EditModal from "./components/editModal";
import "./index.less";
import {
  schemasColumns,
  schemasTitle,
  transformToMockTreeData,
  TreeNode,
} from "./schemas";

const TestSequence: React.FC = () => {
  const access = useAccess();
  const actionRef = useRef<ActionType>();

  const [state, setState] = useSetState<any>({
    title: schemasTitle,
    isUpdateModalOpen: false,
    isLeftTreeModalOpen: false,
    addLeftTypeId: null,
    leftOptionType: "add",
    updateValue: {},
    leftNodeValue: {},
    isAddModalOpen: false, // 新增 modal
    addModalValue: {},
    addModalType: "add", // add | edit | save
    optionType: "copy", // copy | remove
    selectedNodeId: null,
    editingNodeId: null,
    treeData: [],
    originalNodeName: "",
    treeLoading: false,
    expandedKeys: ["1", "2"],
    selectedRow: null,
    sequencetype_id: null,
    sysoruser: null,
  });

  const {
    title,
    isUpdateModalOpen,
    updateValue,
    optionType,
    isAddModalOpen,
    leftOptionType,
    isLeftTreeModalOpen,
    leftNodeValue,
    addModalType,
    addModalValue,
    addLeftTypeId,
    selectedNodeId,
    editingNodeId,
    treeData,
    originalNodeName,
    treeLoading,
    expandedKeys,
    selectedRow,
    sequencetype_id,
    sysoruser,
  } = state;

  const operationColumn = {
    title: "操作",
    valueType: "option",
    key: "option",
    width: 200,
    render: (text: any, record: any, index: any, action: any) => [
      <Button
        key="edit"
        variant="link"
        color="primary"
        icon={<EditOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          setState({
            isAddModalOpen: true,
            addModalType: "edit",
            addModalValue: record,
          });
        }}
      >
        编辑
      </Button>,
      <Button
        key="copy"
        variant="link"
        color="primary"
        icon={<CopyOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          setState({
            updateValue: record,
            isUpdateModalOpen: true,
            optionType: "copy",
          });
        }}
      >
        复制
      </Button>,

      <div
        key={`dropdown-${index}`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <TableDropdown
          onSelect={(key: string) => {
            switch (key) {
              case "delete":
                Modal.confirm({
                  title: (
                    <div>
                      <div>
                        确认删除序列{" "}
                        <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
                          {record.name}
                        </span>{" "}
                        吗？
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginTop: "8px",
                        }}
                      >
                        序列删除后不可恢复
                      </div>
                    </div>
                  ),

                  onOk: async () => {
                    await deleteOne(record.id);
                    if (actionRef.current) {
                      actionRef.current.reload();
                    }
                  },
                });
                return;
              case "remove":
                setState({
                  updateValue: record,
                  isUpdateModalOpen: true,
                  optionType: "remove",
                });
                return;
              default:
                return;
            }
          }}
          menus={[
            { key: "remove", name: "移动" },
            { key: "delete", name: "删除" },
          ]}
        />
      </div>,
    ],
  } as const;

  // 递归查找节点
  const findNodeById = (nodes: TreeNode[], id: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // 加载树数据
  const fetchModules = async () => {
    try {
      setState({ treeLoading: true });
      const { code, data, message: msg } = await getTypeList();
      if (code !== 0) {
        message.error(msg || "获取失败");
        setState({ treeData: [] });
        return;
      }
      setState({ treeData: transformToMockTreeData(data) || [] });
    } catch (error) {
      setState({ treeData: [] });
      message.error("加载树数据失败");
    } finally {
      setState({ treeLoading: false });
    }
  };

  // 删除节点
  const handleDeleteNode = (record: any) => {
    console.log(record);

    Modal.confirm({
      title: (
        <div>
          <div>
            确认删除序列类型{" "}
            <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
              {record.name}
            </span>{" "}
            吗？
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#666",
              marginTop: "8px",
            }}
          >
            序列类型删除后不可恢复，同时删除类型下的测试序列
          </div>
        </div>
      ),

      onOk: async () => {
        const { code, message: msg } = await deleteSequenceType(record.rawKey);
        if (code === 0) {
          // // 如果删除的是当前选中的模块，则自动切换到“全部模块”
          // if (selectedNodeId == record.rawKey) {
          //   setState({
          //     selectedNodeId: record.parantId,
          //     sysoruser: record.parantId,
          //     sequencetype_id: null,
          //   });
          // }
          const isDeletingSelected =
            String(selectedNodeId) === String(record.rawKey);
          const parentId = record.parentId ?? record.parantId ?? null;
          if (isDeletingSelected) {
            setState((prev: any) => ({
              ...prev,
              selectedNodeId: parentId, // Tree 的受控选中
              sysoruser: parentId, // 父节点 -> 视为“父级/类别”，用于列表查询
              sequencetype_id: null,
              selectedRow: null,
            }));
          }
          message.success(msg);
          await fetchModules(); // 刷新左侧模块树
        } else {
          message.error(msg || "删除模块失败");
        }
      },
    });
  };

  // 初始化加载树数据
  useEffect(() => {
    fetchModules();
  }, []);

  // 当选中模块改变时，刷新表格数据
  useEffect(() => {
    actionRef.current?.reload();
  }, [sysoruser, sequencetype_id]);

  // 获取当前选中节点的路径 —— 修正参数使用 selectedId
  const getSelectedNodePath = (selectedId: any) => {
    const selectedNode = findNodeById(treeData, selectedId);
    if (!selectedNode) return "";

    // 找到父节点
    const findParent = (
      nodes: TreeNode[],
      targetId: string
    ): TreeNode | null => {
      for (const node of nodes) {
        if (node.children?.some((child) => child.id === targetId)) {
          return node;
        }
        if (node.children) {
          const found = findParent(node.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const parent = findParent(treeData, selectedId);
    return parent ? `${parent.name} / ${selectedNode.name}` : selectedNode.name;
  };

  const handleRowClick = (record: any, index: number) => {
    const name = `${getSelectedNodePath(selectedNodeId)} / ${
      record.sequence_name
    }`;
    history.push({
      pathname: `/case-management/test-sequence-edit/${record.sequence_id}?name=${name}&status=${record?.is_published}&selectedId=${selectedNodeId}`,
    });
    // 将选中行写入 state
    setState({ selectedRow: record });
  };

  const requestData: any = async (...args: any) => {
    if (!args[0]?.sysoruser) return;
    const params = transformParams({ params: args[0] });

    const { code, data, message: msg } = await getSequenceList({ ...params });

    if (code !== 0) {
      message.error(msg);
      return { data: [], total: 0, success: false };
    }
    return {
      data: data?.list || [],
      total: data?.total_cnt,
      success: code === 0,
    };
  };

  const renderTreeData: any = (data: any[]) => {
    return data.map((module: any) => ({
      title: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              flex: 1,
              cursor: "pointer",
            }}
          >
            <FolderOutlined style={{ color: "#8c8c8c", fontSize: "14px" }} />
            <span
              style={{
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                fontSize: 12,
              }}
              title={module.name}
            >
              {module.name}
            </span>
          </div>
          <div
            style={{
              maxWidth: 100,
            }}
          >
            {access["testDesign-edit"] && (
              <>
                {module.type == "folder" ? (
                  <Button
                    // style={{ color: "#999" }}
                    type="link"
                    onClick={(e) => {
                      e.stopPropagation();
                      setState({
                        addLeftTypeId: module.name, // 若需要父级 ID，可替换为 node.id
                        isLeftTreeModalOpen: true,
                        leftOptionType: "add",
                        leftNodeValue: {},
                      });
                    }}
                  >
                    <PlusOutlined />
                  </Button>
                ) : (
                  <>
                    <Button
                      type="link"
                      onClick={(e) => {
                        e.stopPropagation();
                        setState({
                          isLeftTreeModalOpen: true,
                          leftOptionType: "edit",
                          leftNodeValue: module,
                        });
                      }}
                    >
                      <EditOutlined />
                    </Button>
                    <Divider type="vertical" />
                    <Button
                      type="link"
                      danger
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNode(module);
                      }}
                    >
                      <DeleteOutlined />
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      ),
      key: String(module.rawKey),

      dataRef: module, // ✅ 保留原始数据，onSelect 可直接拿
      // 👇 如果有 children，则递归处理，否则为空数组
      children: module.children ? renderTreeData(module.children) : [],
    }));
  };

  const treeDataDemo = renderTreeData(treeData) || [];

  // 根据节点结构/类型综合判断是否父级
  const isParentNode = (node: any) => {
    // node 是 info.node 或 node.dataRef，二者都兼容
    const data = node?.dataRef ?? node;
    return (
      (node?.children && node.children.length > 0) ||
      node?.isLeaf === false ||
      data?.type === "folder"
    );
  };
  const handleTreeSelect = (keys: any, info: any) => {
    if (!keys?.length) return;
    const clickedKey = keys[0] as string;
    const clickedNode = info.node;
    const nodeData = (clickedNode as any)?.dataRef ?? clickedNode;
    const parent = isParentNode(clickedNode);
    // 更新选中态
    setState({
      selectedNodeId: clickedKey, //选中的节点
      selectedRow: nodeData,
      sysoruser: parent ? clickedKey : nodeData.parentId || null,
      sequencetype_id: parent ? null : nodeData.rawKey,
    });
  };
  return (
    <PageContainer>
      <div className="demo-container">
        {/* 左侧树结构 */}
        <div className="left-panel">
          <div className="tree-container">
            <Spin spinning={treeLoading} tip="加载数据中...">
              {treeDataDemo.length > 0 ? (
                <Tree
                  treeData={treeDataDemo}
                  selectedKeys={[selectedNodeId]}
                  defaultExpandAll
                  onSelect={handleTreeSelect}
                  showLine={false}
                  showIcon={false}
                  blockNode
                  style={{
                    backgroundColor: "transparent",
                  }}
                  className="custom-tree"
                />
              ) : (
                <Empty
                  description="暂无数据"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Spin>
          </div>
        </div>

        {/* 右侧列表 */}
        <div className="right-panel">
          <div className="panel-content">
            <ProTable<any>
              actionRef={actionRef}
              columns={
                access["testDesign-edit"]
                  ? [...schemasColumns, operationColumn]
                  : schemasColumns
              }
              cardBordered
              params={{
                sysoruser: sysoruser,
                sequencetype_id: sequencetype_id,
              }}
              request={requestData}
              rowKey={(row) => String(row?.sequence_id)}
              pagination={{ defaultPageSize: 10 }}
              toolBarRender={() =>
                access["testDesign-edit"]
                  ? [
                      <Button
                        onClick={() => {
                          setState({
                            isAddModalOpen: true,
                            addModalType: "add",
                            addModalValue: {},
                          });
                        }}
                        key="add"
                        type="primary"
                        icon={<PlusOutlined />}
                      >
                        新建
                      </Button>,
                    ]
                  : []
              }
              options={{ reload: true, density: true, setting: true }}
              size="small"
              onRow={(record, index) =>
                access["testDesign-edit"]
                  ? {
                      onClick: (e) => {
                        const target = e.target as HTMLElement;
                        const isActionColumn =
                          target.closest(".ant-table-cell:last-child") ||
                          target.closest(".ant-btn") ||
                          target.closest("button") ||
                          target.closest("a") ||
                          target.closest(".ant-dropdown") ||
                          target.closest(".ant-dropdown-menu") ||
                          target.closest(".ant-dropdown-menu-item") ||
                          target.closest(".ant-dropdown-trigger");
                        if (isActionColumn) {
                          e.stopPropagation();
                          return;
                        }
                        handleRowClick(record, index || 0);
                      },
                      style: {
                        cursor: "pointer",
                        backgroundColor:
                          selectedRow?.sequence_id === record.sequence_id
                            ? "#e6f7ff"
                            : "transparent",
                      },
                    }
                  : {}
              }
            />
          </div>
        </div>
      </div>

      {/* 左侧树结构编辑新增 */}
      <AddLeftModal
        updateValue={leftNodeValue}
        type={leftOptionType}
        open={isLeftTreeModalOpen}
        parentsId={addLeftTypeId}
        onCancel={() => {
          setState({
            isLeftTreeModalOpen: false,
            addLeftTypeId: null,
            leftNodeValue: {},
          });
        }}
        onOk={() => {
          setState({
            isLeftTreeModalOpen: false,
            addLeftTypeId: null,
            leftNodeValue: {},
          });
          fetchModules();
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}
      />

      {/* 复制移动 */}
      <EditModal
        currentNode={selectedNodeId}
        type={optionType}
        open={isUpdateModalOpen}
        updateValue={updateValue}
        onOk={(values) => {
          setState({ isUpdateModalOpen: false });
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}
        onCancel={() => {
          setState({ isUpdateModalOpen: false });
        }}
      />

      {/* 新建/编辑/另存为测试序列 */}
      <AddModal
        open={isAddModalOpen}
        onCancel={() => {
          setState({ isAddModalOpen: false });
        }}
        currentNode={state.sequencetype_id}
        type={addModalType}
        updateValue={addModalValue}
        onOk={(values) => {
          if (addModalType == "edit") {
            setState({ isAddModalOpen: false });
            if (actionRef.current) {
              actionRef.current.reload();
            }
          } else {
            const { tigroup, sequence_name } = values;
            const titles = tigroup
              ? `${getSelectedNodePath(tigroup)} / ${sequence_name}`
              : `${sequence_name}`;
            history.push(
              `/case-management/test-sequence-edit/add?name=${titles}selectedId=${selectedNodeId}`
            );
          }
        }}
      />
    </PageContainer>
  );
};

export default TestSequence;
