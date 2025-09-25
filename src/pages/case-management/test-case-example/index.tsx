import {
  deleteCase,
  deleteOne,
  getCaseList,
  getList,
} from "@/services/case-management/test-case-example.service";
import { isArray } from "@/utils";
import { transformParams } from "@/utils/params";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FolderOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  ActionType,
  PageContainer,
  ProTable,
  TableDropdown,
} from "@ant-design/pro-components";
import { history, useParams } from "@umijs/max";
import { useSetState } from "ahooks";
import { Button, Empty, Input, message, Modal, Spin, Tree } from "antd";
import React, { useEffect, useRef } from "react";
import TestSequenceModal from "../../task-management/components/testSequenceModal";
import NewEditModal from "./components/NewEditModal";
import AddModal from "./components/addModal";
import DetailModal from "./components/detailModal";
import EditModal from "./components/editModal";
import EditModuleModal from "./components/editModuleModal";
import s from "./index.less";
import { schemasColumns, schemasTitle } from "./schemas";
const { Search } = Input;

const TestCaseExample: React.FC = () => {
  const params = useParams();
  const actionRef = useRef<ActionType>();
  const [state, setState] = useSetState<any>({
    id: params.id || "",
    title: schemasTitle,
    isUpdateModalOpen: false,
    updateValue: {},
    selectedModule: "all", //左侧选中的模块
    loading: false, //模块加载loading
    selectTestData: {}, //已选择的测试序列
    isTestModal: false, //关联测试序列modal
    isAddModalOpen: false, //新增modal
    moduleType: "add", //默认是add |edit
    moduleSearchText: "",
    optionType: "copy", //默认是编辑 copy|remove
    isRowEditModal: false, //点击row出现的编辑框
    newEditModalID: null,
    isPreviewModalOpen: false,
    detailsId: null,
    open: false, //编辑用例模块
    modulevalue: {}, //单个模块数据
    isEditMode: false, //是否为编辑模式，false为新增
    isEditModuleModalOpen: false, //编辑模块modal
    editModuleData: {}, //编辑模块数据
    deleteTestCases: false, //删除模块时是否删除测试用例
    modules: [], //左侧模块列表
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
              // setState({
              //   updateValue: record,
              //   isUpdateModalOpen: true,
              //   optionType: "edit",
              // });
              setState({
                isRowEditModal: true,
                newEditModalID: record.id,
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
                      onOk: async () => {
                        const { code, message: msg } = await deleteCase(
                          record.id
                        );
                        if (code === 0) {
                          message.success(msg);
                          if (actionRef.current) {
                            actionRef.current.reload();
                          }
                        } else {
                          message.error(msg || "操作失败");
                          return;
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
    isPreviewModalOpen,
    detailsId,
    optionType,
    isAddModalOpen,
    open,
    isTestModal,
    selectTestData,
    isRowEditModal,

    modulevalue,
    isEditMode,
    isEditModuleModalOpen,
    editModuleData,
    deleteTestCases,
    modules,
    moduleType,
    moduleSearchText,
    id,
    selectedModule,
    loading,
    newEditModalID,
  } = state;
  // 模拟用例数据
  const useCases: any[] = [
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

  // 从后端获取模块列表
  const fetchModules = async (params?: any) => {
    setState({ loading: true });
    try {
      const {
        code,
        message: msg,
        data,
      } = await getList({
        lib_id: id,
        page_index: 1,
        page_size: 9999,
        module_name: moduleSearchText,
        ...params,
      });
      if (code === 0 && isArray(data.list)) {
        if (data.list.length == 0) {
          setState({ modules: [] });
          return;
        }
        const moduleData = data.list.map((item: any) => ({
          ...item,
          expanded: true,
          key: item.id,
        }));

        let allItem = {
          id: "all",
          name: "全部模块",
          tc_cnt: data?.list_cnt || 0,
          expanded: true,
          key: "all",
        };
        const finalModules = [allItem, ...moduleData];
        setState({ modules: finalModules });
      } else {
        console.log("获取模块列表API返回失败，使用默认数据");
        message.error(msg || "获取模块列表失败");
        setState({
          modules: [],
        });
      }
    } finally {
      setState({ loading: false });
    }
  };

  // 删除模块的函数
  const handleDeleteModule = (module: any) => {
    // 重置复选框状态
    setState({
      deleteTestCases: false,
    });

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
            模块删除后不可恢复,删除模块会删除该用例库模块下的所有信息
          </div>
        </div>
      ),
      // content: (
      //   <div style={{ marginTop: "16px" }}>
      //     <Checkbox
      //       onChange={(e) => {
      //         setState({
      //           deleteTestCases: e.target.checked,
      //         });
      //       }}
      //     >
      //       同时删除模块下的测试用例
      //     </Checkbox>
      //   </div>
      // ),
      onOk: async () => {
        // 调用后端删除接口
        const { code, message: msg } = await deleteOne(module.id);

        if (code === 0) {
          // 如果删除的是当前选中的模块，清除选中状态
          if (selectedModule === module.key) {
            setState({ selectedModule: "" });
          }
          message.success(msg);
          fetchModules();
        } else {
          message.error(msg || "删除模块失败");
        }
      },
    });
  };

  // 将模块数据转换为Tree组件格式
  const treeData = modules.map((module: any) => ({
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
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flex: 1,
              cursor: "pointer",
            }}
          >
            <FolderOutlined style={{ color: "#8c8c8c", fontSize: "14px" }} />
            <span
              style={{
                flex: 1,
                minWidth: 0, //  flex 子元素要省略必须加 minWidth:0
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                fontSize: 12,
              }}
              title={module.name} //  鼠标悬浮显示完整文本
            >
              {module.name}
            </span>
            {module.id != "all" ? (
              <>
                <span style={{ fontSize: "12px" }}>
                  ( {module.tc_cnt || 0} )
                </span>
                <span style={{ fontSize: "12px" }}>
                  ( {module.coverage || 0} )
                </span>
                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    color: "#999",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      cursor: "pointer",
                      padding: "2px",
                      borderRadius: "4px",
                      transition: "all 0.2s",
                    }}
                    className="tree-icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();

                      setState({
                        isEditModuleModalOpen: true,
                        editModuleData: module,
                        moduleType: "edit",
                      });
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(24, 144, 255, 0.1)";
                      e.currentTarget.style.color = "#1890ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#999";
                    }}
                  >
                    <EditOutlined />
                  </div>
                  <div
                    style={{
                      cursor: "pointer",
                      padding: "2px",
                      borderRadius: "4px",
                      transition: "all 0.2s",
                    }}
                    className="tree-icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteModule(module);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 77, 79, 0.1)";
                      e.currentTarget.style.color = "#ff4d4f";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#999";
                    }}
                  >
                    <DeleteOutlined />
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </>
      </div>
    ),
    key: String(module.key),
    children: [], // 只有一级，没有子级
  }));

  useEffect(() => {
    // 初始化加载模块数据
    fetchModules();
  }, []);

  // 当选中模块改变时，刷新表格数据
  useEffect(() => {
    actionRef.current?.reload();
  }, [selectedModule]);

  // 获取测试用例数据
  const requestData: any = async (...args: any) => {
    let params = transformParams({ params: args[0], sort: args[1] });
    const { code, data, message: msg } = await getCaseList({ ...params });
    if (code !== 0) {
      message.error(msg);
      return;
    }
    return {
      data: data?.list || [],
      total: data?.total_cnt,
      success: code === 0,
    };
  };

  const handleSearch = (value: string) => {
    setState({ moduleSearchText: value });
    fetchModules({ module_name: value });
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
              paddingLeft: "25px",
            }}
          >
            <Search
              placeholder="用例模块"
              style={{ flex: 1 }}
              enterButton // 显示按钮
              onSearch={handleSearch}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setState({
                  isEditModuleModalOpen: true,
                  editModuleData: {},
                  moduleType: "add",
                });
              }}
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
            <Spin spinning={loading} tip="加载模块中...">
              {treeData.length > 0 ? (
                <Tree
                  treeData={treeData}
                  selectedKeys={[selectedModule]}
                  onSelect={(selectedKeys) => {
                    setState({ selectedModule: selectedKeys[0] || "" });
                  }}
                  showLine={false}
                  showIcon={false}
                  blockNode
                  style={{
                    backgroundColor: "transparent",
                    padding: "8px 0",
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
              {/* <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
                {selectedModule
                  ? `${
                      modules.find((m) => m.key === selectedModule)?.name ||
                      "未知模块"
                    }·${getFilteredUseCases().length}`
                  : `全部用例·${useCases.length}`}
              </h2> */}
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
              params={{
                module_id: selectedModule !== "all" ? selectedModule : null,
                lib_id: id,
              }}
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
              toolBarRender={() => [
                <Button
                  key="button"
                  icon={<PlusOutlined />}
                  type="primary"
                  onClick={() => {
                    setState({ isAddModalOpen: true });
                  }}
                >
                  新建
                </Button>,
              ]}

              // onRow={(record, index) => ({
              //   onClick: (e) => {
              //     // 检查点击的元素是否在操作栏内
              //     const target = e.target as HTMLElement;
              //     const isActionColumn =
              //       target.closest(".ant-table-cell:last-child") ||
              //       target.closest(".ant-btn") ||
              //       target.closest("button") ||
              //       target.closest("a") ||
              //       target.closest(".ant-dropdown") ||
              //       target.closest(".ant-dropdown-menu") ||
              //       target.closest(".ant-dropdown-menu-item") ||
              //       target.closest(".ant-dropdown-trigger");

              //     // 如果点击的是操作栏，则不跳转
              //     if (isActionColumn) {
              //       e.stopPropagation();
              //       return;
              //     }

              //     // 否则执行正常的行点击逻辑
              //     handleRowClick(record, index || 0);
              //   },
              //   style: {
              //     cursor: "pointer",
              //     backgroundColor:
              //       selectedRow?.id === record.id ? "#e6f7ff" : "transparent",
              //   },
              // })}
            />
          </div>
        </div>
      </div>

      {/* 新建测试用例 */}
      <AddModal
        mouduleId={selectedModule === "all" ? null : selectedModule}
        libId={id}
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
        onOk={() => {
          setState({
            isAddModalOpen: false,
          });
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}
      />
      {/* 移动复制用例 */}
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
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}
      />
      {/* 点击row编辑 */}

      <NewEditModal
        onCancel={() => {
          setState({ isRowEditModal: false });
        }}
        onOk={() => {
          setState({ isRowEditModal: false });
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}
        onSelect={() => {
          setState({ isTestModal: true });
        }}
        open={isRowEditModal}
        id={newEditModalID}
        selectData={selectTestData}
      />
      <DetailModal
        open={isPreviewModalOpen}
        id={detailsId}
        onCancel={() => {
          setState({
            isPreviewModalOpen: false,
            detailsId: null,
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
      {/* 编辑创建模块 */}
      <EditModuleModal
        licId={id}
        type={moduleType}
        open={isEditModuleModalOpen}
        onCancel={() => {
          setState({ isEditModuleModalOpen: false });
        }}
        data={editModuleData}
        onOk={() => {
          setState({ isEditModuleModalOpen: false });
          fetchModules();
        }}
      />
    </PageContainer>
  );
};

export default TestCaseExample;
