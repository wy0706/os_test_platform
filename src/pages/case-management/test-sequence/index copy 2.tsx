import {
  deleteSequenceType,
  getSequenceList,
  getTypeList,
} from "@/services/case-management/test-sequence.service";
import { deleteOne } from "@/services/task-management/test-requirement.service";
import {
  CopyOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  FileTextOutlined,
  FolderOutlined,
  PlusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { history, useAccess } from "@umijs/max";

import { transformParams } from "@/utils/params";
import {
  ActionType,
  PageContainer,
  ProTable,
  TableDropdown,
} from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Empty, message, Modal, Select, Spin } from "antd";
import React, { useEffect, useRef } from "react";
import AddLeftModal from "./components/addLeftModal";
import AddModal from "./components/addModal";
import EditModal from "./components/editModal";
import "./index.less";
import {
  schemasColumns,
  schemasTitle,
  TestItem,
  transformToMockTreeData,
  TreeNode,
} from "./schemas";

const { Option } = Select;

const DemoPage: React.FC = () => {
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  // const [treeData, setTreeData] = useState<TreeNode[]>([]);
  // const [selectedNodeId, setSelectedNodeId] = useState<string>("1-1");
  // const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  // const [originalNodeName, setOriginalNodeName] = useState<string>("");
  // const [treeLoading, setTreeLoading] = useState(false);
  // const [expandedKeys, setExpandedKeys] = useState<string[]>(["1", "2"]);

  // const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const [state, setState] = useSetState<any>({
    title: schemasTitle,
    isUpdateModalOpen: false,
    isLeftTreeModalOpen: false,
    addLeftTypeId: null,
    leftOptionType: "add",
    updateValue: {},
    leftNodeValue: {},
    isAddModalOpen: false, //新增modal
    addModalValue: {},
    addModalType: "add", //默认是add add|edit|save
    optionType: "copy", //默认是｜ copy|'remove'
    selectedNodeId: null,
    editingNodeId: null,
    treeData: [],
    originalNodeName: "",
    treeLoading: false,
    expandedKeys: ["1", "2"],
    selectedRow: null,
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
            console.log("key----", key);
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
  };

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

  // 递归更新树数据
  const updateTreeData = (
    nodes: TreeNode[],
    targetId: string,
    updates: Partial<TreeNode>
  ): TreeNode[] => {
    return nodes.map((node) => {
      if (node.id === targetId) {
        return { ...node, ...updates };
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, targetId, updates),
        };
      }
      return node;
    });
  };

  // 递归添加子节点
  const addChildNode = (
    nodes: TreeNode[],
    parentId: string,
    newNode: TreeNode
  ): TreeNode[] => {
    return nodes.map((node) => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), newNode],
        };
      }
      if (node.children) {
        return {
          ...node,
          children: addChildNode(node.children, parentId, newNode),
        };
      }
      return node;
    });
  };

  // 递归删除节点
  const deleteNode = (nodes: TreeNode[], targetId: string): TreeNode[] => {
    return nodes.filter((node) => {
      if (node.id === targetId) return false;
      if (node.children) {
        node.children = deleteNode(node.children, targetId);
      }
      return true;
    });
  };

  // 加载树数据
  const fetchModules = async () => {
    try {
      setState({
        treeLoading: true,
      });
      const { code, data, message: msg } = await getTypeList();
      if (code !== 0) {
        message.error(msg || "获取失败");
        setState({
          treeData: [],
        });
        return;
      }

      setState({
        treeData: transformToMockTreeData(data) || [],
      });
    } catch (error) {
      setState({
        treeData: [],
      });
      message.error("加载树数据失败");
    } finally {
      setState({
        treeLoading: false,
      });
    }
  };

  // 删除节点
  const handleDeleteNode = (record: any) => {
    return;
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
          // 如果删除的是当前选中的模块，则自动切换到“全部模块”
          if (selectedNodeId == record.rawKey) {
            setState({ selectedNodeId: record.parantId });
          }
          message.success(msg);
          fetchModules(); // 刷新左侧模块树
          // 刷新右侧表格
          if (actionRef.current) {
            actionRef.current.reload();
          }
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

  // 渲染树节点
  const renderTreeNode = (node: TreeNode, level = 0) => {
    const isSelected = selectedNodeId === node.id;
    const isEditing = editingNodeId === node.id;
    const isExpanded = expandedKeys.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="tree-node">
        <div
          className={`node-content ${isSelected ? "selected" : ""}`}
          onClick={() => handleNodeSelect(node.id)}
        >
          {/* 展开图标 */}
          <div className="expand-icon">
            {hasChildren ? (
              <button
                className="expand-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(node.id);
                }}
              >
                {isExpanded ? <DownOutlined /> : <RightOutlined />}
              </button>
            ) : (
              <span className="expand-placeholder" />
            )}
          </div>

          {/* 节点图标 */}
          <div className="node-icon">
            {node.type === "folder" ? <FolderOutlined /> : <FileTextOutlined />}
          </div>

          {/* 节点文本或输入框 */}
          <div className="node-label">
            <span title={node.name}>{node.name}</span>
          </div>

          {/* 操作按钮区域：根据权限动态渲染 */}
          {access["testDesign-edit"] && (
            <div
              className={`node-actions ${
                node.type === "folder" ? "folder-actions" : ""
              }`}
            >
              {/* 文件夹：可以新增子节点 */}
              {node.type === "folder" && (
                <button
                  className="action-btn add-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("新建", node);
                    setState({
                      addLeftTypeId: node.name,
                      isLeftTreeModalOpen: true,
                      leftOptionType: "add",
                      leftNodeValue: {},
                    });
                  }}
                >
                  <PlusOutlined />
                </button>
              )}

              {/* 只有 item 时才有删除编辑按钮 */}
              {node.type === "item" && (
                <>
                  <button
                    className="action-btn edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      // startEditNode(node.id);
                      setState({
                        isLeftTreeModalOpen: true,
                        leftOptionType: "edit",
                        leftNodeValue: node,
                      });
                    }}
                  >
                    <EditOutlined />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNode(node);
                    }}
                  >
                    <DeleteOutlined />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* 递归渲染子节点 */}
        {hasChildren && isExpanded && (
          <div className="children">
            {node.children!.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  // 节点选中处理
  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  // 当选中模块改变时，刷新表格数据
  useEffect(() => {
    actionRef.current?.reload();
  }, [selectedNodeId]);

  // 切换节点展开/收起
  const toggleExpanded = (nodeId: string) => {
    // setExpandedKeys((prev) =>
    //   prev.includes(nodeId)
    //     ? prev.filter((id) => id !== nodeId)
    //     : [...prev, nodeId]
    // );
    // setState((prev) => {
    //   expandedKeys: prev.includes(nodeId)
    //     ? prev.filter((id) => id !== nodeId)
    //     : [...prev, nodeId]
    // })
  };

  // 获取当前选中节点信息
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

    const parent = findParent(treeData, selectedNodeId);
    return parent ? `${parent.name} / ${selectedNode.name}` : selectedNode.name;
  };
  const handleRowClick = (record: any, index: number) => {
    console.log("点击的行数据:", record);
    let name = `${getSelectedNodePath(selectedNodeId)} / ${record.name}`;
    history.push({
      pathname: `/case-management/test-sequence-edit/${record.id}?name=${name}&status=${record?.status}`,
      // search: `?de=123&name=Tom`, // 这里用 search
    });

    // 更新选中的行
    setSelectedRow(record);
  };

  const requestData: any = async (...args: any) => {
    let params = transformParams({ params: args[0], sort: args[1] });
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

  return (
    <PageContainer>
      <div className="demo-container">
        {/* 左侧树结构 */}
        <div className="left-panel">
          {/* <div className="tree-title">目录结构</div> */}
          <div className="tree-container">
            <Spin spinning={treeLoading} tip="加载数据中...">
              {treeData && treeData.length > 0 ? (
                treeData.map((node: any) => renderTreeNode(node))
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
            <ProTable<TestItem>
              actionRef={actionRef}
              columns={
                access["testDesign-edit"]
                  ? [...schemasColumns, operationColumn]
                  : schemasColumns
              }
              cardBordered
              params={{
                sysoruser: selectedNodeId,
              }}
              request={requestData}
              // headerTitle="测试数据"
              // tooltip={getSelectedNodePath()}
              // request={async (params) => {
              //   try {
              //     const response = await DemoService.getTestData({
              //       categoryId: selectedNodeId,
              //       searchText: params.name || "",
              //       type: params.type || "",
              //       page: params.current || 1,
              //       pageSize: params.pageSize || 10,
              //     });
              //     if (response.code === 200) {
              //       return {
              //         data: response.data.list,
              //         success: true,
              //         total: response.data.total,
              //       };
              //     }
              //     message.error(response.message);
              //     return {
              //       data: [],
              //       success: false,
              //       total: 0,
              //     };
              //   } catch (error) {
              //     message.error("加载数据失败");
              //     return {
              //       data: [],
              //       success: false,
              //       total: 0,
              //     };
              //   }
              // }}
              rowKey="id"
              // search={{
              //   labelWidth: "auto",
              //   defaultCollapsed: false,
              //   collapseRender: false,
              // }}
              pagination={{
                defaultPageSize: 10,
                // showSizeChanger: false,
                // showQuickJumper: true,
                // showTotal: (total, range) =>
                //   `第 ${range[0]}-${range[1]} 条/共计 ${total} 条`,
              }}
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
              options={{
                reload: true,
                density: true,
                setting: true,
              }}
              size="small"
              onRow={(record, index) =>
                access["testDesign-edit"]
                  ? {
                      onClick: (e) => {
                        // 检查点击的元素是否在操作栏内
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

                        // 如果点击的是操作栏，则不跳转
                        if (isActionColumn) {
                          e.stopPropagation();
                          return;
                        }

                        // 否则执行正常的行点击逻辑
                        handleRowClick(record, index || 0);
                      },
                      style: {
                        cursor: "pointer",
                        backgroundColor:
                          selectedRow?.id === record.id
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
          fetchModules(); // 更新后刷新左侧模块数
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}
      />

      {/* 复制移动 */}
      <EditModal
        currentNode={selectedNodeId} //当前选中的树节点
        type={optionType}
        open={isUpdateModalOpen}
        updateValue={updateValue}
        onOk={(values) => {
          setState({
            isUpdateModalOpen: false,
          });
          console.log("values", values);
        }}
        onCancel={() => {
          setState({
            isUpdateModalOpen: false,
          });
        }}
      />
      {/* 新建编辑另存为测试序列 */}
      <AddModal
        open={isAddModalOpen}
        onCancel={() => {
          setState({ isAddModalOpen: false });
        }}
        type={addModalType}
        updateValue={addModalValue}
        onOk={(values) => {
          console.log(values);
          const { gender, name } = values;
          let titles = gender
            ? `${getSelectedNodePath(gender)} / ${name}`
            : `${name}`;
          history.push(
            `/case-management/test-sequence-edit/add?name=${titles}`
          );
        }}
      />
    </PageContainer>
  );
};

export default DemoPage;
