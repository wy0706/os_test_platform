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
  onOk?: (values: any[]) => void;
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

  const [state, setState] = useSetState<{
    module_id: string | null;
    lib_id: string | null;
    selectedKeys: string[];
    useCases: UseCase[];
    selectedUseCases: UseCase[];
    treeData: DataNode[];
  }>({
    module_id: null,
    lib_id: null,
    selectedKeys: ["all"],
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

  // 转换接口返回的库/模块为 Tree 数据
  const transformToTreeData = (libs: any[]): DataNode[] => {
    return libs.map((lib) => ({
      title: lib.name,
      key: `library${lib.id}`,
      icon: <FolderOpenOutlined />,
      libId: lib.id,
      children:
        lib.module_list?.map((mod: any) => ({
          title: mod.name,
          key: `module${mod.id}`,
          icon: <FileOutlined />,
          moduleId: mod.id,
          parentLibId: lib.id,
        })) || [],
    }));
  };

  useEffect(() => {
    initData();
  }, [open]);

  const initData = async () => {
    if (!open) {
      setState({
        selectedUseCases: [],
      });
      return;
    }
    await fetchData();
    // 初始注入 selectData -> selectedUseCases（不要让 getCaseLists 再过滤掉）
    setState((prev) => ({
      ...prev,
      selectedUseCases: (selectData as UseCase[]) || [],
    }));
  };

  useEffect(() => {
    // 切换模块时刷新表格
    actionRef.current?.reload();
  }, [module_id, lib_id, open]);

  const fetchData = async () => {
    const { code, data } = await getModuleOptions();
    if (code === 0) {
      const libs = data?.lib_list || [];
      const tree: DataNode[] = [
        {
          title: "全部用例",
          key: "all",
          icon: <FolderOpenOutlined />,
        },
        ...transformToTreeData(libs),
      ];
      setState({ treeData: tree });
    } else {
      setState({ treeData: [] });
    }
  };

  // 点击 Tree 节点
  const handleTreeSelect = async (keys: React.Key[], info: any) => {
    const selectedKey = (keys.length ? keys[0] : info.node.key) as string;
    setState({ selectedKeys: [selectedKey] }); // 强制单选

    let lib_id: string | null = null;
    let module_id: string | null = null;
    if (selectedKey.startsWith("module")) {
      module_id = selectedKey.replace("module", "");
      lib_id = info.node.parentLibId;
    } else if (selectedKey.startsWith("library")) {
      lib_id = selectedKey.replace("library", "");
    }
    setState({ lib_id, module_id });
  };
  // 获取测试用例数据
  const getCaseLists: any = async (...args: any) => {
    const params = transformParams({ params: args[0], sort: args[1] });
    const { code, data, message: msg } = await getCaseList({ ...params });
    if (code !== 0) {
      message.error(msg);
      return { data: [], total: 0, success: false };
    }
    const list = data?.list || [];
    // 仅更新当前页数据；不要覆盖 selectedUseCases（避免初始选择被清掉）
    setState((prev) => ({
      ...prev,
      useCases: list,
    }));

    return {
      data: list,
      total: data?.total_cnt,
      success: true,
    };
  };

  // 确认
  const handleConfirm = () => {
    // 直接传 UseCase[] 给 onOk
    if (selectedUseCases.length == 0) {
      message.warning("请选择数据");
      return;
    }
    onOk?.(selectedUseCases);
  };

  const columns: ProColumns<UseCase>[] = [
    {
      title: "标题",
      dataIndex: "title",
      key: "tc_title",
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
      hideInSearch: true,
    },
  ];

  return (
    <div className="addModal-page">
      <Modal
        title="用例规划"
        open={open}
        onCancel={onCancel}
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
              <ProTable<UseCase>
                columns={columns}
                params={{ module_id, lib_id }}
                actionRef={actionRef}
                request={getCaseLists}
                rowKey="id"
                options={false}
                toolBarRender={false}
                cardBordered
                pagination={{ pageSize: 10 }}
                rowSelection={{
                  preserveSelectedRowKeys: true, // ✅ 跨页/切换筛选保留
                  selectedRowKeys: selectedUseCases.map((item) => item.id),
                  onChange: (
                    currentSelectedKeys: React.Key[],
                    selectedRows: UseCase[]
                  ) => {
                    // 当前页新选择
                    const currentViewSelected = selectedRows;

                    // 其他页之前已选但当前页中不存在的
                    const otherViewSelected = selectedUseCases.filter(
                      (item: UseCase) =>
                        !useCases.some((uc: UseCase) => uc.id === item.id)
                    );

                    setState({
                      selectedUseCases: [
                        ...otherViewSelected,
                        ...currentViewSelected,
                      ],
                    });
                  },
                }}
                tableAlertRender={({ selectedRowKeys }) => {
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
                  <Button
                    type="link"
                    size="small"
                    onClick={() => setState({ selectedUseCases: [] })}
                    style={{ marginLeft: "8px" }}
                  >
                    清空所有选择
                  </Button>
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
