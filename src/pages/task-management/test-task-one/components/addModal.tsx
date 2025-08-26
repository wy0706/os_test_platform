import { FileTextOutlined, FolderOutlined } from "@ant-design/icons";
import type { ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { Button, Modal, Table, Tree } from "antd";
import type { DataNode } from "antd/es/tree";
import React, { useEffect, useState } from "react";
import "./index.less";
interface ModalProps {
  open: boolean;
  onCancel: () => void;
  onOk?: (values: any) => void;
  selectData: any[];
}

interface UseCase {
  id: string;
  title: string;
  description: string;
  importance: "P1" | "P2" | "P3" | "P0" | "P4";
  checked: boolean;
  libraryId?: string;
  moduleId?: string;
}

const AddModal: React.FC<ModalProps> = ({
  open,
  onCancel,
  onOk,
  selectData,
}) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>(["all"]);
  const [useCases, setUseCases] = useState<UseCase[]>([]); // 用例列表
  const [selectedUseCases, setSelectedUseCases] = useState<any[]>([]); // 已选中的用例

  // 模拟树形数据
  const treeData: DataNode[] = [
    {
      title: "全部用例",
      key: "all",
      icon: <FolderOutlined />,
    },
    {
      title: "测试库1",
      key: "library1",
      icon: <FolderOutlined />,
      children: [
        {
          title: "模块1",
          key: "module1-1",
          icon: <FileTextOutlined />,
        },
        {
          title: "模块2",
          key: "module1-2",
          icon: <FileTextOutlined />,
        },
      ],
    },
    {
      title: "测试库2",
      key: "library2",
      icon: <FolderOutlined />,
      children: [
        {
          title: "模块1",
          key: "module2-1",
          icon: <FileTextOutlined />,
        },
        {
          title: "模块2",
          key: "module2-2",
          icon: <FileTextOutlined />,
        },
      ],
    },
    {
      title: "测试库3",
      key: "library3",
      icon: <FolderOutlined />,
      children: [
        {
          title: "模块1",
          key: "module3-1",
          icon: <FileTextOutlined />,
        },
        {
          title: "模块2",
          key: "module3-2",
          icon: <FileTextOutlined />,
        },
      ],
    },
  ];

  // 模拟用例数据
  const mockUseCases: UseCase[] = [
    {
      id: "1",
      title: "DEMO-1",
      description: "订单成功提交",
      importance: "P1",
      checked: false,
      libraryId: "library1",
      moduleId: "module1-1",
    },
    {
      id: "2",
      title: "DEMO-2",
      description: "提交订单时可以修改收货地址",
      importance: "P0",
      checked: false,
      libraryId: "library1",
      moduleId: "module1-1",
    },
    {
      id: "3",
      title: "DEMO-3 ",
      description: "购物车支持修改商品数量",
      importance: "P1",
      checked: false,
      libraryId: "library1",
      moduleId: "module1-2",
    },
    {
      id: "4",
      title: "DEMO-4 ",
      description: "购物车支持批量删除商品",
      importance: "P1",
      checked: false,
      libraryId: "library1",
      moduleId: "module1-2",
    },
    {
      id: "5",
      title: "DEMO-5 ",
      description: "从购物车点击商品可进入商品详情页面",
      importance: "P1",
      checked: false,
      libraryId: "library2",
      moduleId: "module2-1",
    },
    {
      id: "6",
      title: "DEMO-6 ",
      description: "切换商品分类",
      importance: "P2",
      checked: false,
      libraryId: "library2",
      moduleId: "module2-1",
    },
    {
      id: "7",
      title: "DEMO-7 ",
      description: "商品搜索功能",
      importance: "P2",
      checked: false,
      libraryId: "library2",
      moduleId: "module2-2",
    },
    {
      id: "8",
      title: "DEMO-8 ",
      description: "商品信息页面展示",
      importance: "P1",
      checked: false,
      libraryId: "library3",
      moduleId: "module3-1",
    },
    {
      id: "9",
      title: "DEMO-9 ",
      description: "商品列表翻页",
      importance: "P1",
      checked: false,
      libraryId: "library3",
      moduleId: "module3-2",
    },
  ];

  useEffect(() => {
    if (open) {
      fetchData();
      // addIconsToTreeData(treeData);
    }
    setSelectedUseCases(selectData.map((item) => item.id));
  }, [open]);

  const fetchData = async () => {
    setUseCases(mockUseCases);
    setSelectedUseCases([]);
  };
  // 动态为树形数据添加图标的函数
  const addIconsToTreeData = (treeData: any[] = []): any[] => {
    if (!Array.isArray(treeData)) return [];
    return treeData.map((node) => {
      const newNode = { ...node };
      // 根据是否有children来决定图标类型
      if (node.children && node.children.length > 0) {
        // 有子节点的是文件夹图标
        newNode.icon = <FolderOutlined />;
        // 递归处理子节点
        newNode.children = addIconsToTreeData(node.children);
      } else {
        // 没有子节点的是文档图标
        newNode.icon = <FileTextOutlined />;
      }

      return newNode;
    });
  };
  const handleTreeSelect = (selectedKeys: React.Key[]) => {
    setSelectedKeys(selectedKeys as string[]);
    if (selectedKeys.length > 0) {
      const selectedKey = selectedKeys[0] as string;
      let filteredData: UseCase[] = [];

      if (selectedKey === "all") {
        filteredData = mockUseCases;
      } else if (selectedKey.startsWith("library")) {
        filteredData = mockUseCases.filter(
          (useCase) => useCase.libraryId === selectedKey
        );
      } else if (selectedKey.startsWith("module")) {
        filteredData = mockUseCases.filter(
          (useCase) => useCase.moduleId === selectedKey
        );
      }

      setUseCases(filteredData);
    }
  };

  const handleConfirm = () => {
    const selectedItems = mockUseCases.filter((uc) =>
      selectedUseCases.includes(uc.id)
    );
    console.log("selectedItems", selectedItems);

    onOk?.(selectedItems);
  };

  const columns: ProColumns<UseCase>[] = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      render: (dom, record) => (
        <div>
          <span style={{ marginRight: 5 }}>{record.title}</span>
          <span>{record.description}</span>
        </div>
      ),
    },
    {
      title: "重要程度",
      dataIndex: "importance",
      key: "importance",
      search: false,
      // render: (dom, record) => (
      //   <Tag color={record.importance === "P1" ? "#f50" : "#2db7f5"}>
      //     {record.importance}
      //   </Tag>
      // ),
    },
  ];

  return (
    <Modal
      title="用例规划"
      open={open}
      className="addModal-planning"
      onCancel={() => {
        onCancel && onCancel();
      }}
      maskClosable={false}
      onOk={handleConfirm}
      width={1200}
    >
      <div style={{ display: "flex", height: "600px", gap: "16px" }}>
        {/* 左侧导航树 */}
        <div
          style={{
            width: "300px",
            border: "1px solid #d9d9d9",
            borderRadius: "6px",
            padding: "16px",
            fontSize: "12px",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              fontWeight: 500,
              marginBottom: "16px",
              color: "#1890ff",
            }}
          >
            规划用例
          </div>
          <Tree
            showIcon
            treeData={treeData}
            selectedKeys={selectedKeys}
            onSelect={handleTreeSelect}
            defaultExpandAll
            style={{ fontSize: "14px" }}
            className="command-tree"
          />
        </div>

        {/* 右侧内容区域 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* 标题和搜索栏 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              padding: "0 16px",
            }}
          >
            <div style={{ fontSize: "16px", fontWeight: 500 }}>
              {selectedKeys.includes("all") ? "全部用例" : "用例列表"}
            </div>
          </div>

          {/* 表格 */}
          <div style={{ flex: 1, overflow: "auto" }}>
            <ProTable
              columns={columns}
              dataSource={useCases}
              cardBordered
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total, range) => `共${Math.ceil(total / 10)}页`,
              }}
              rowKey="id"
              options={false}
              toolBarRender={false}
              rowSelection={{
                selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                selectedRowKeys: selectedUseCases.filter((key) =>
                  useCases.some((useCase) => useCase.id === key)
                ),
                onChange: (selectedRowKeys, selectedRows) => {
                  const currentViewSelectedKeys = selectedRowKeys as string[];
                  const otherViewsSelectedKeys = selectedUseCases.filter(
                    (key) => !useCases.some((useCase) => useCase.id === key)
                  );
                  const allSelectedKeys = [
                    ...otherViewsSelectedKeys,
                    ...currentViewSelectedKeys,
                  ];
                  setSelectedUseCases(allSelectedKeys);
                },
              }}
              tableAlertRender={({
                selectedRowKeys,
                selectedRows,
                onCleanSelected,
              }) => {
                return <div>当前页面已选择 {selectedRowKeys.length} 项</div>;
              }}
            />
          </div>

          {/* 底部操作栏 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
              borderTop: "1px solid #f0f0f0",
              marginTop: "16px",
            }}
          >
            <div style={{ color: "#666" }}>
              已选择{" "}
              <span style={{ color: "#1890ff", fontWeight: 500 }}>
                {selectedUseCases.length}
              </span>{" "}
              个用例
              {selectedUseCases.length > 0 && (
                <>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => setSelectedUseCases([])}
                    style={{ marginLeft: "8px" }}
                  >
                    清空所有选择
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddModal;
