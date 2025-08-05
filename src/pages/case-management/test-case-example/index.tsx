import {
  deleteOne,
  getList,
} from "@/services/case-management/test-case.service";
import {
  EditOutlined,
  EyeOutlined,
  FolderOutlined,
  MoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  ActionType,
  PageContainer,
  ProTable,
  TableDropdown,
} from "@ant-design/pro-components";
import { history } from "@umijs/max";
import { useSetState } from "ahooks";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Menu,
  Modal,
  Popover,
  Tree,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import TestSequenceModal from "../../task-management/components/testSequenceModal";
import NewEditModal from "../../task-management/test-task-one/components/editModal";
import AddModal from "./components/addModal";
import DetailModal from "./components/detailModal";
import EditModal from "./components/editModal";
import s from "./index.less";
import {
  schemasColumns,
  schemasDescriptions,
  schemasForm,
  schemasTitle,
} from "./schemas";
const { Search } = Input;

const layout = {
  labelCol: { span: 24 },
};

interface UseCase {
  id: string;
  title: string;
  version: string;
  importance: string;
  module: string;
  icon: string;
  key: string;
}

interface Module {
  name: string;
  count: number;
  expanded: boolean;
  key: string;
}

const TestCaseExample: React.FC = () => {
  const [data, setData] = useState<any>(null);
  // const [selectedRow, setSelectedRow] = useState<string>("DEMO-6");
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [modules, setModules] = useState<Module[]>([
    { name: "注册与登录", count: 6, expanded: true, key: "login" },
    { name: "商城下单", count: 7, expanded: true, key: "shopping" },
    { name: "订单支付", count: 2, expanded: true, key: "payment" },
    { name: "无模块用例", count: 0, expanded: true, key: "no-module" },
  ]);
  const [form] = Form.useForm();
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
    formSchema: schemasForm,
    isPreviewModalOpen: false,
    detailsId: null,
    descriptionsColumns: schemasDescriptions,
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
            key="preview"
            variant="link"
            color="primary"
            icon={<EyeOutlined />}
            onClick={() => {
              setState({
                detailsId: record.id,
                isPreviewModalOpen: true,
                detailsData: record,
              });
            }}
          >
            详情
          </Button>,
          <Button
            key="edit"
            variant="link"
            color="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setState({
                updateValue: record,
                isUpdateModalOpen: true,
                optionType: "edit",
              });
            }}
          >
            编辑
          </Button>,
          <div
            key={`dropdown-${index}`}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <TableDropdown
              key={index}
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
                            删除测试用例会一起删除未完成测试计划内的执行用例，
                            删除后如果想找回测试用例，可以通过测试库设置内的回收站进行恢复
                          </div>
                        </div>
                      ),
                      // content: (
                      //   <div style={{ color: "#ff4d4f", fontWeight: "bold" }}>
                      //     {record.title}
                      //   </div>
                      // ),
                      onOk: async () => {
                        await deleteOne(record.id);
                        if (actionRef.current) {
                          actionRef.current.reload();
                        }
                      },
                    });
                    return;
                  case "copy":
                    setState({
                      updateValue: record,
                      isUpdateModalOpen: true,
                      optionType: "copy",
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
                { key: "copy", name: "复制" },
                { key: "remove", name: "移动" },
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
  // 模拟用例数据
  const useCases: UseCase[] = [
    {
      id: "DEMO-1",
      title: "订单成功提交",
      version: "v1",
      importance: "P1",
      module: "商城下单",
      icon: "user",
      key: "1",
    },
    {
      id: "DEMO-2",
      title: "购物车支持修改商品数量",
      version: "v1",
      importance: "P1",
      module: "商城下单",
      icon: "user",
      key: "2",
    },
    {
      id: "DEMO-3",
      title: "购物车支持删除商品",
      version: "v1",
      importance: "P1",
      module: "商城下单",
      icon: "user",
      key: "3",
    },
    {
      id: "DEMO-4",
      title: "购物车支持清空",
      version: "v1",
      importance: "P1",
      module: "商城下单",
      icon: "user",
      key: "4",
    },
    {
      id: "DEMO-5",
      title: "购物车支持批量操作",
      version: "v1",
      importance: "P1",
      module: "商城下单",
      icon: "user",
      key: "5",
    },
    {
      id: "DEMO-6",
      title: "切换商品分类",
      version: "v1",
      importance: "P2",
      module: "商城下单",
      icon: "thunder",
      key: "4",
    },
    {
      id: "DEMO-7",
      title: "商品搜索功能",
      version: "v1",
      importance: "P2",
      module: "商城下单",
      icon: "thunder",
      key: "7",
    },
    {
      id: "DEMO-8",
      title: "商品详情展示",
      version: "v1",
      importance: "P1",
      module: "商城下单",
      icon: "thunder",
      key: "8",
    },
    {
      id: "DEMO-9",
      title: "商品列表展示",
      version: "v1",
      importance: "P1",
      module: "商城下单",
      icon: "thunder",
      key: "9",
    },
    {
      id: "DEMO-10",
      title: "登录时记住用户名",
      version: "v1",
      importance: "P0",
      module: "注册与登录",
      icon: "user",
      key: "10",
    },
    {
      id: "DEMO-11",
      title: "登录时验证密码",
      version: "v1",
      importance: "P0",
      module: "注册与登录",
      icon: "user",
      key: "11",
    },
    {
      id: "DEMO-12",
      title: "注册时验证邮箱",
      version: "v1",
      importance: "P0",
      module: "注册与登录",
      icon: "user",
      key: "12",
    },
    {
      id: "DEMO-13",
      title: "注册时验证手机号",
      version: "v1",
      importance: "P0",
      module: "注册与登录",
      icon: "user",
      key: "13",
    },
    {
      id: "DEMO-14",
      title: "注册时检验用户名是否重复",
      version: "v1",
      importance: "P0",
      module: "注册与登录",
      icon: "user",
      key: "14",
    },
    {
      id: "DEMO-15",
      title: "注册时验证密码强度",
      version: "v1",
      importance: "P0",
      module: "注册与登录",
      icon: "user",
      key: "15",
    },
  ];

  // 创建新模块的函数
  const createNewModule = () => {
    const newKey = `module-${Date.now()}`;
    const newModule: Module = {
      name: "未命名模块",
      count: 0,
      expanded: true,
      key: newKey,
    };
    setModules([...modules, newModule]);
    // 自动选中新创建的模块
    setSelectedModule(newKey);
  };

  // 编辑模块名称的函数
  const editModuleName = (moduleKey: string) => {
    setState({
      open: true,
    });

    // const newName = prompt(
    //   "请输入模块名称:",
    //   modules.find((m) => m.key === moduleKey)?.name || ""
    // );
    // if (newName && newName.trim()) {
    //   setModules(
    //     modules.map((m) =>
    //       m.key === moduleKey ? { ...m, name: newName.trim() } : m
    //     )
    //   );
    // }
  };
  const [deleteTestCases, setDeleteTestCases] = useState(false);
  // 删除模块的函数
  const deleteModule = (module: any) => {
    const moduleToDelete = modules.find((m) => m.key === module.key);
    console.log(module.key);

    if (moduleToDelete) {
      // 使用 useState 来管理复选框状态

      Modal.confirm({
        title: (
          <div>
            <div>
              确认删除模块{" "}
              <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
                {module.name}
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
              模块删除后不可恢复
            </div>
          </div>
        ),
        content: (
          <div style={{ marginTop: "16px" }}>
            <Checkbox
              checked={deleteTestCases}
              onChange={(e) => {
                setDeleteTestCases(e.target.checked);
              }}
            >
              同时删除模块下的测试用例
            </Checkbox>
          </div>
        ),
        onOk: async () => {
          // 删除模块
          setModules(modules.filter((m) => m.key !== module.Key));

          // 如果删除的是当前选中的模块，清除选中状态
          if (selectedModule === module.Key) {
            setSelectedModule("");
          }

          // 判断是否选中了删除测试用例的选项
          if (deleteTestCases) {
            console.log("用户选择同时删除模块下的测试用例:", module.name);

            try {
              // TODO: 在这里添加删除该模块下所有测试用例的逻辑
              // 例如：调用 API 删除该模块下的所有测试用例
              // await deleteTestCasesByModule(module.Key);

              // 显示成功提示;
              Modal.success({
                title: "删除成功",
                // content: `已删除模块 "${module.name}" 及其下的所有测试用例`,
              });
            } catch (error) {
              console.error("删除测试用例失败:", error);
              Modal.error({
                title: "删除失败",
                content: "删除测试用例时发生错误，请重试",
              });
            }
          } else {
            // 只删除模块，不删除测试用例
            console.log("用户选择只删除模块，保留测试用例:", module.name);
            Modal.success({
              title: "删除成功",
              content: `已删除模块 "${module.name}"，测试用例已移至无模块用例`,
            });
          }
        },
      });
    }
  };

  // 将模块数据转换为Tree组件格式
  const treeData = modules.map((module) => ({
    title: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "8px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flex: 1,
            cursor: "pointer",
          }}
          onClick={() => {
            console.log("选择模块:", module.name, "模块key:", module.key);
            setSelectedModule(module.key);
            // 选中模块后会自动触发表格数据刷新
          }}
        >
          <FolderOutlined style={{ color: "#1890ff", fontSize: "16px" }} />
          <span style={{ fontSize: "12px" }}>{module.name}</span>
          <span style={{ fontSize: "12px" }}>{module.count}</span>
        </div>
        {/* {module.count > 0 && ( */}
        <div style={{ marginLeft: "auto" }}>
          <Popover
            content={
              <div>
                <div
                  style={{
                    padding: "2px 6px",
                    cursor: "pointer",
                    // borderBottom: "1px solid #f0f0f0",
                  }}
                  onClick={() => {
                    // editModuleName(module.key);
                    setState({
                      open: true,
                      moudleValue: module,
                    });
                    form?.setFieldsValue(module);
                  }}
                >
                  编辑
                </div>
                <div
                  style={{
                    padding: "2px 6px",
                    cursor: "pointer",
                    // color: "#ff4d4f",
                  }}
                  onClick={() => {
                    deleteModule(module);
                  }}
                >
                  删除
                </div>
              </div>
            }
            trigger="hover"
            placement="bottomRight"
          >
            <MoreOutlined
              style={{
                opacity: 0.6,
                cursor: "pointer",
                fontSize: "16px",
                color: "#666",
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </Popover>
        </div>
        {/* )} */}
      </div>
    ),
    key: module.key,
    children: [], // 只有一级，没有子级
  }));

  useEffect(() => {
    setData(useCases);
  }, []);

  // 当选中模块改变时，刷新表格数据
  useEffect(() => {
    if (actionRef.current) {
      actionRef.current.reload();
    }
  }, [selectedModule]);

  // 新建按钮菜单
  const newMenu = (
    <Menu>
      <Menu.Item key="new-case">新建用例</Menu.Item>
      <Menu.Item key="new-module">新建模块</Menu.Item>
    </Menu>
  );

  // 模块菜单
  const moduleMenu = {
    items: [
      {
        key: "edit",
        label: "编辑",
        onClick: () => {
          console.log("编辑模块");
          // 这里可以添加编辑模块的逻辑
        },
      },
      {
        key: "delete",
        label: "删除",
        onClick: () => {
          console.log("删除模块");
          // 这里可以添加删除模块的逻辑
        },
      },
    ],
  };

  // Tree组件事件处理
  const onSelect = (selectedKeys: React.Key[], info: any) => {
    // 由于我们在自定义title中处理了点击事件，这里可以留空或添加其他逻辑
    console.log("Tree onSelect:", selectedKeys);
  };

  const onExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys as string[]);
  };

  // 根据选中的模块筛选用例数据
  const getFilteredUseCases = () => {
    if (!selectedModule) {
      return useCases; // 如果没有选中模块，显示所有用例
    }

    const selectedModuleData = modules.find((m) => m.key === selectedModule);
    if (!selectedModuleData) {
      return useCases;
    }

    // 特殊处理"无模块用例"
    if (selectedModuleData.name === "无模块用例") {
      return useCases.filter(
        (useCase) => !useCase.module || useCase.module === ""
      );
    }

    // 根据模块名称筛选用例
    return useCases.filter(
      (useCase) => useCase.module === selectedModuleData.name
    );
  };

  const requestData: any = async (...args: any) => {
    try {
      // 根据选中的模块添加筛选条件
      const selectedModuleName = selectedModule
        ? modules.find((m) => m.key === selectedModule)?.name
        : undefined;
      const params = {
        ...args[0],
        module: selectedModuleName,
      };
      console.log("请求参数:", params, "选中模块:", selectedModuleName);
      const res = await getList({ params, sort: args[1] });
      return res;
    } catch {
      // 如果API请求失败，使用本地数据筛选
      const filteredData = getFilteredUseCases();
      console.log("使用本地数据筛选，结果数量:", filteredData.length);
      return {
        data: filteredData,
        total: filteredData.length,
        success: true,
      };
    }
  };
  const handleRowClick = (record: any, index: number) => {
    console.log("点击的行数据:", record);
    console.log("行索引:", index);
    setState({ isRowEditModal: true, rowValue: record });

    // 更新选中的行
    setSelectedRow(record);
  };
  return (
    <PageContainer
      header={{
        ghost: true,
        extra: [
          <Button
            key="1"
            onClick={() => {
              history.back();
            }}
          >
            返回
          </Button>,
        ],
      }}
    >
      <div
        className={s.container}
        style={{
          display: "flex",
          // height: "100vh",
          backgroundColor: "#f5f5f5",
          gap: "16px",
        }}
      >
        {/* 左侧模块列表 */}
        <div
          style={{
            width: 300,
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 185px)", // 设置固定高度，减去页面头部和边距
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 600,
                color: "#262626",
              }}
            >
              用例模块
            </h3>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
              gap: "12px",
            }}
          >
            <Search placeholder="用例模块" style={{ flex: 1 }} />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={createNewModule}
              title="创建新模块"
            />
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <Tree
              treeData={treeData}
              selectedKeys={selectedModule ? [selectedModule] : []}
              expandedKeys={expandedKeys}
              onSelect={onSelect}
              onExpand={onExpand}
              showLine={false}
              showIcon={false}
              blockNode
              style={{
                backgroundColor: "transparent",
                padding: "8px 0",
              }}
              className="custom-tree"
            />
          </div>
        </div>

        {/* 右侧主要内容区域 */}
        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 185px)", // 设置固定高度，与左侧保持一致
          }}
        >
          {/* 顶部工具栏 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
                {selectedModule
                  ? `${
                      modules.find((m) => m.key === selectedModule)?.name ||
                      "未知模块"
                    }·${getFilteredUseCases().length}`
                  : `全部用例·${useCases.length}`}
              </h2>
              {selectedModule && (
                <Button
                  size="small"
                  type="link"
                  onClick={() => setSelectedModule("")}
                  style={{ padding: 0, fontSize: "12px" }}
                >
                  清除筛选
                </Button>
              )}
            </div>
          </div>

          {/* 右侧表单 */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <ProTable<any>
              columns={columns}
              actionRef={actionRef}
              cardBordered
              options={false}
              request={requestData}
              rowKey="id"
              pagination={{
                pageSize: 10,
                onChange: (page) => requestData,
              }}
              // headerTitle={title.label}
              toolBarRender={() => [
                <Button
                  key="button"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setState({
                      isAddModalOpen: true,
                    });
                  }}
                  type="primary"
                >
                  新建
                </Button>,
              ]}
              onRow={(record, index) => ({
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
                    selectedRow?.id === record.id ? "#e6f7ff" : "transparent",
                },
              })}
            />
          </div>
        </div>
      </div>

      {/* 新建测试用例 */}
      <AddModal
        open={isAddModalOpen}
        onCancel={() => {
          setState({
            isAddModalOpen: false,
            selectTestData: null,
          });
        }}
        onSelect={() => {
          setState({
            isTestModal: true,
          });
        }}
        onOk={(values) => {
          console.log("values", values);
          setState({
            isAddModalOpen: false,
          });
        }}
        updateValue={selectTestData}
      />
      {/* 编辑移动复制用例 */}
      <EditModal
        type={optionType}
        open={isUpdateModalOpen}
        updateValue={updateValue}
        onCancel={() => {
          setState({
            isUpdateModalOpen: false,
            updateValue: {},
          });
        }}
        onOk={() => {
          setState({
            isUpdateModalOpen: false,
            updateValue: {},
          });
        }}
      />
      {/* 点击row编辑 */}

      <NewEditModal
        onCancel={() => {
          setState({ isRowEditModal: false });
        }}
        onOk={() => {
          setState({ isRowEditModal: false });
        }}
        onSelect={() => {
          setState({ isTestModal: true });
        }}
        open={isRowEditModal}
        updateValue={rowValue}
        selectData={selectTestData}
      />
      <DetailModal
        open={isPreviewModalOpen}
        details={detailsData}
        onCancel={() => {
          setState({
            isPreviewModalOpen: false,
            detailsData: {},
          });
        }}
      />
      <TestSequenceModal
        onCancel={() => {
          setState({ isTestModal: false });
        }}
        onOk={(values) => {
          const data = values && values.length > 0 ? values[0] : {};
          setState({
            isTestModal: false,
            selectTestData: data,
          });
        }}
        open={isTestModal}
      />
      {/* 编辑用例模块 */}
      <Modal
        title="编辑用例模块"
        maskClosable={false}
        open={open}
        onCancel={() => {
          setState({
            open: false,
          });
        }}
        styles={{ body: { minHeight: 100, padding: 20 } }}
        width={"50%"}
        onOk={() => {
          setState({
            open: false,
          });
          const params = form.getFieldsValue();
          console.log("params", params);
        }}
      >
        <Form {...layout} form={form} name="control-hooks">
          <Form.Item name="name" label="模块名称" rules={[{ required: true }]}>
            <Input placeholder="输入模块名称" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default TestCaseExample;
