import { DemoService } from "@/services/demos/demo.service";
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
import type { ActionType } from "@ant-design/pro-components";
import { useSetState } from "ahooks";

import {
  PageContainer,
  ProTable,
  TableDropdown,
} from "@ant-design/pro-components";
import { Button, message, Modal, Select, Spin } from "antd";
import React, { useEffect, useRef, useState } from "react";
import "./index.less";
import { schemasColumns, schemasTitle, TestItem, TreeNode } from "./schemas";

const { Option } = Select;

const DemoPage: React.FC = () => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("1-1");
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [originalNodeName, setOriginalNodeName] = useState<string>("");
  const [treeLoading, setTreeLoading] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<string[]>(["1", "2"]);
  const actionRef = useRef<ActionType>();

  const [state, setState] = useSetState<any>({
    title: schemasTitle,
    isUpdateModalOpen: false,
    updateValue: {},
    selectTestData: {}, //已选择的测试序列
    isTestModal: false, //关联测试序列modal
    isAddModalOpen: false, //新增modal
    optionType: "edit", //默认是编辑edit｜ copy
    detailsData: {}, //详情
    isRowEditModal: false, //点击row出现的编辑框
    rowValue: {}, //
    isPreviewModalOpen: false,
    detailsId: null,
    open: false, //编辑用例模块
    modulevalue: {}, //单个模块数据
    columns: schemasColumns.concat([
      {
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
              // form.setFieldsValue(record);
              // setState({
              //   updateValue: record,
              //   isUpdateModalOpen: true,
              //   optionType: "edit",
              // });
            }}
          >
            编辑
          </Button>,
          <Button
            key="preview"
            variant="link"
            color="primary"
            icon={<CopyOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              // setState({
              //   detailsId: record.id,
              //   isPreviewModalOpen: true,
              //   detailsData: record,
              // });
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
                console.log(key);
                switch (key) {
                  case "delete":
                    Modal.confirm({
                      title: (
                        <div>
                          <div>
                            确认删除测试库{" "}
                            <span
                              style={{ color: "#ff4d4f", fontWeight: "bold" }}
                            >
                              {record.title}
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
                            测试库删除后不可恢复，删除测试库会一起删除测试库内的执行用例
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
                  case "copy":
                    // form.setFieldsValue(record);
                    // setState({
                    //   updateValue: record,
                    //   isUpdateModalOpen: true,
                    //   optionType: "copy",
                    // });

                    return;
                  case "remove":
                    // form.setFieldsValue(record);
                    // setState({
                    //   updateValue: record,
                    //   isUpdateModalOpen: true,
                    //   optionType: "copy",
                    // });

                    return;
                  default:
                    return;
                }
              }}
              menus={[
                // { key: "copy", name: "复制" },
                { key: "remove", name: "移动" },

                // { key: "example", name: "示例测试库" },
                { key: "delete", name: "删除" },
              ]}
            />
          </div>,
        ],
      },
    ]),
  });
  const {
    columns,
    title,
    isUpdateModalOpen,
    updateValue,
    formSchema,
    isPreviewModalOpen,
    detailsId,
    descriptionsColumns,
    optionType,
    detailsData,
    isAddModalOpen,
    open,
    isTestModal,
    selectTestData,
    isRowEditModal,
    rowValue,
  } = state;

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
  const loadTreeData = async () => {
    try {
      setTreeLoading(true);
      const response = await DemoService.getTreeData();
      if (response.code === 200) {
        setTreeData(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("加载树数据失败");
    } finally {
      setTreeLoading(false);
    }
  };

  // 添加子菜单
  const handleAddChild = async (parentId: string) => {
    try {
      const response = await DemoService.createTreeNode({
        name: "未命名序列子集",
        type: "item",
        parentId,
      });
      if (response.code === 200) {
        await loadTreeData();
        startEditNode(response.data.id);
        message.success("添加节点成功");
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("添加节点失败");
    }
  };

  // 开始编辑节点
  const startEditNode = (nodeId: string) => {
    const node = findNodeById(treeData, nodeId);
    if (node) {
      setOriginalNodeName(node.name);
      setEditingNodeId(nodeId);
    }
  };

  // 编辑节点名称
  const handleEditNode = async (nodeId: string, newName: string) => {
    console.log("node====", nodeId, newName);

    const trimmedName = newName.trim();

    // 如果名称为空，取消编辑
    if (!trimmedName) {
      setEditingNodeId(null);
      setOriginalNodeName("");
      return;
    }

    // 如果名称没有变化，直接取消编辑，不发送请求
    if (trimmedName === originalNodeName) {
      setEditingNodeId(null);
      setOriginalNodeName("");
      return;
    }

    try {
      const response = await DemoService.updateTreeNode({
        id: nodeId,
        name: trimmedName,
      });
      if (response.code === 200) {
        await loadTreeData();
        setEditingNodeId(null);
        setOriginalNodeName("");
        message.success("修改成功");
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("修改失败");
    }
  };

  // 删除节点
  const handleDeleteNode = (nodeId: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个节点吗？",
      onOk: async () => {
        try {
          const response = await DemoService.deleteTreeNode(nodeId);
          if (response.code === 200) {
            await loadTreeData();
            if (selectedNodeId === nodeId) {
              setSelectedNodeId("1-1");
            }
            message.success("删除成功");
          } else {
            message.error(response.message);
          }
        } catch (error) {
          message.error("删除失败");
        }
      },
    });
  };

  // 初始化加载树数据
  useEffect(() => {
    loadTreeData();
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
          <div className="node-icon">
            {node.type === "folder" ? <FolderOutlined /> : <FileTextOutlined />}
          </div>
          <div className="node-label">
            {isEditing ? (
              <input
                className="editable-text"
                defaultValue={node.name}
                autoFocus
                onBlur={(e) => handleEditNode(node.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEditNode(node.id, e.currentTarget.value);
                  } else if (e.key === "Escape") {
                    setEditingNodeId(null);
                    setOriginalNodeName("");
                  }
                }}
              />
            ) : (
              <span title={node.name}>{node.name}</span>
            )}
          </div>
          <div
            className={`node-actions ${
              node.type === "folder" ? "folder-actions" : ""
            }`}
          >
            {node.type === "folder" && (
              <button
                className="action-btn add-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddChild(node.id);
                }}
              >
                <PlusOutlined />
              </button>
            )}
            {node.type === "item" ? (
              <>
                <button
                  className="action-btn edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditNode(node.id);
                  }}
                >
                  <EditOutlined />
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNode(node.id);
                  }}
                >
                  <DeleteOutlined />
                </button>
              </>
            ) : (
              <button
                className="action-btn edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  startEditNode(node.id);
                }}
              >
                <EditOutlined />
              </button>
            )}
          </div>
        </div>
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
    actionRef.current?.reload();
  };

  // 切换节点展开/收起
  const toggleExpanded = (nodeId: string) => {
    setExpandedKeys((prev) =>
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  // 获取当前选中节点信息
  const getSelectedNodePath = () => {
    const selectedNode = findNodeById(treeData, selectedNodeId);
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

  return (
    <PageContainer>
      <div className="demo-container">
        {/* 左侧树结构 */}
        <div className="left-panel">
          {/* <div className="tree-title">目录结构</div> */}
          <div className="tree-container">
            <Spin spinning={treeLoading}>
              {treeData.map((node) => renderTreeNode(node))}
            </Spin>
          </div>
        </div>

        {/* 右侧列表 */}
        <div className="right-panel">
          <div className="panel-content">
            <ProTable<TestItem>
              actionRef={actionRef}
              columns={columns}
              cardBordered
              // headerTitle="测试数据"
              // tooltip={getSelectedNodePath()}
              request={async (params) => {
                try {
                  const response = await DemoService.getTestData({
                    categoryId: selectedNodeId,
                    searchText: params.name || "",
                    type: params.type || "",
                    page: params.current || 1,
                    pageSize: params.pageSize || 10,
                  });
                  if (response.code === 200) {
                    return {
                      data: response.data.list,
                      success: true,
                      total: response.data.total,
                    };
                  }
                  message.error(response.message);
                  return {
                    data: [],
                    success: false,
                    total: 0,
                  };
                } catch (error) {
                  message.error("加载数据失败");
                  return {
                    data: [],
                    success: false,
                    total: 0,
                  };
                }
              }}
              rowKey="id"
              // search={{
              //   labelWidth: "auto",
              //   defaultCollapsed: false,
              //   collapseRender: false,
              // }}
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `第 ${range[0]}-${range[1]} 条/共计 ${total} 条`,
              }}
              toolBarRender={() => [
                <Button key="add" type="primary" icon={<PlusOutlined />}>
                  新建
                </Button>,
              ]}
              options={{
                reload: true,
                density: true,
                setting: true,
              }}
              size="middle"
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DemoPage;
