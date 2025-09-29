import {
  getCaseList,
  getModuleOptions,
} from "@/services/case-management/test-case-example.service";
import { transformParams } from "@/utils/params";
import { FileOutlined, FolderOpenOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, message, Modal, Tree } from "antd";
import { DataNode } from "antd/es/tree";
import React, { useEffect, useRef } from "react";

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

const PlanModal: React.FC<ModalProps> = ({
  open,
  onCancel,
  onOk,
  selectData,
}) => {
  const actionRef = useRef<ActionType>();

  // const [selectedKeys, setSelectedKeys] = useState<string[]>(["all"]);
  // const [useCases, setUseCases] = useState<UseCase[]>([]); // 用例列表
  // const [selectedUseCases, setSelectedUseCases] = useState<any[]>([]); // 已选中的用例
  // const [treeData, setTreeData] = useState<any>([]);
  const [state, setState] = useSetState<any>({
    module_id: null,
    lib_id: null,
    selectedKeys: "all",
    useCases: [],
    selectedUseCases: [],
    treeData: [],
  });
  const {
    module_id,
    lib_id,
    selectedKeys,
    useCases,
    selectedUseCases,
    treeData,
  } = state;
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
  const transformToTreeData = (libs: any[]): DataNode[] => {
    return libs.map((lib) => ({
      title: lib.name,
      key: `library${lib.id}`,
      icon: <FolderOpenOutlined />,
      // 自定义字段，后面好取
      libId: lib.id,
      children:
        lib.module_list?.map((mod: any) => ({
          title: mod.name,
          key: `module${mod.id}`,
          icon: <FileOutlined />,
          moduleId: mod.id,
          // 在模块节点上挂父库 id
          parentLibId: lib.id,
        })) || [],
    }));
  };
  useEffect(() => {
    if (open) {
      fetchData();
    }

    setState({
      selectedUseCases: selectData.map((item) => item.id),
    });
  }, [open]);
  useEffect(() => {
    actionRef.current?.reload();
  }, [module_id, lib_id]);
  const fetchData = async () => {
    setState({
      useCases: mockUseCases,
    });
    const { code, data } = await getModuleOptions();
    if (code === 0) {
      const libs = data?.lib_list || [];
      // 最外层加一个“全部用例”
      const tree: DataNode[] = [
        {
          title: "全部用例",
          key: "all",
          icon: <FolderOpenOutlined />,
        },
        ...transformToTreeData(libs),
      ];

      setState({
        treeData: tree,
      });
    } else {
      setState({
        treeData: [],
      });
    }
    console.log("cde", data);

    setState({ selectedUseCases: [] });
  };

  const handleTreeSelect = async (keys: React.Key[], info: any) => {
    // 如果本次点击的是已选中的节点，就不要清空，保持原来
    if (keys.length === 0) {
      // info.node.key 就是你点击的那个节点的 key

      setState({
        selectedKeys: [info.node.key as string],
      });
    } else {
      setState({
        selectedKeys: keys as string[],
      });
    }
    const selectedKey = (keys.length ? keys[0] : info.node.key) as string;
    let lib_id: string | null = null;
    let module_id: string | null = null;

    if (selectedKey.startsWith("module")) {
      module_id = selectedKey.replace("module", "");
      lib_id = info.node.parentLibId; // 父库 id
    } else if (selectedKey.startsWith("library")) {
      lib_id = selectedKey.replace("library", "");
    }

    setState({
      lib_id,
      module_id,
    });
  };

  // 获取测试用例

  // 获取测试用例数据
  const getCaseLists: any = async (...args: any) => {
    let params = transformParams({ params: args[0], sort: args[1] });
    const { code, data, message: msg } = await getCaseList({ ...params });
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

  const handleConfirm = () => {
    // const selectedItems = mockUseCases.filter((uc) =>
    //   // selectedUseCases.includes(uc.id)
    // );
    // console.log("selectedItems", selectedItems);

    onOk?.(1);
  };

  const columns: ProColumns<UseCase>[] = [
    {
      title: "标题",
      dataIndex: "title",
      key: "tc_title",
      // render: (dom, record) => (
      //   <div>
      //     <span style={{ marginRight: 5 }}>{record.title}</span>
      //     <span>{record.description}</span>
      //   </div>
      // ),
    },
    {
      title: "重要程度",
      dataIndex: "importance",
      hideInSearch: true,
      // sorter: true,
      // render: (dom, record) => (
      //   <Tag color={record.importance === "P1" ? "#f50" : "#2db7f5"}>
      //     {record.importance}
      //   </Tag>
      // ),
    },
  ];

  return (
    <div className="addModal-page">
      <Modal
        title="用例规划"
        open={open}
        onCancel={() => {
          onCancel && onCancel();
        }}
        maskClosable={false}
        onOk={handleConfirm}
        width={1200}
        zIndex={1100}
      >
        <div style={{ display: "flex", height: "600px", gap: "16px" }}>
          {/* 左侧导航树 */}
          <div
            style={{
              width: "300px",
              border: "1px solid #d9d9d9",
              borderRadius: "6px",
              padding: "16px",
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
                params={{
                  module_id,
                  lib_id,
                }}
                actionRef={actionRef}
                // dataSource={useCases}
                cardBordered
                pagination={{
                  pageSize: 10,
                }}
                request={getCaseLists}
                rowKey="id"
                options={false}
                toolBarRender={false}
                rowSelection={{
                  onChange: (selectedRowKeys, selectedRows) => {},
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
                      // onClick={() => setSelectedUseCases([])}
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
    </div>
  );
};

export default PlanModal;
