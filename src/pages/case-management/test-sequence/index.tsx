import { getList } from "@/services/case-management/test-case.service";
import {
  createSubset,
  deleteSubset,
  getTreeData,
  updateSubset,
} from "@/services/case-management/test-sequence.service";
import {
  CopyOutlined,
  EditOutlined,
  FileTextOutlined,
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
import { useSetState } from "ahooks";
import { Button, Form, Input, Menu, message, Modal, Popover, Tree } from "antd";
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
  type: number;
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
  const [expandedKeys, setExpandedKeys] = useState<string[]>([
    "user",
    "system",
  ]);
  const [modules, setModules] = useState<Module[]>([
    { name: "用户类", count: 2, expanded: true, key: "user" },
    { name: "系统类", count: 3, expanded: true, key: "system" },
  ]);
  const [dynamicTreeData, setDynamicTreeData] = useState<any[]>([]);
  const [treeLoading, setTreeLoading] = useState<boolean>(false);
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
  // 模拟用例数据
  const useCases: UseCase[] = [
    {
      id: "DEMO-1",
      title: "订单成功提交",
      version: "1",
      type: 1,
    },
    {
      id: "DEMO-2",
      title: "购物车支持修改商品数量",
      version: "1",
      type: 2,
    },
    {
      id: "DEMO-3",
      title: "购物车支持删除商品",
      version: "1",
      type: 2,
    },
    {
      id: "DEMO-4",
      title: "购物车支持清空",
      version: "0",
      type: 3,
    },
    {
      id: "DEMO-5",
      title: "购物车支持批量操作",
      version: "1",
      type: 2,
    },
    {
      id: "DEMO-6",
      title: "切换商品分类",
      version: "1",
      type: 3,
    },
    {
      id: "DEMO-7",
      title: "商品搜索功能",
      version: "0",
      type: 2,
    },
    {
      id: "DEMO-8",
      title: "商品详情展示",
      version: "1",
      type: 1,
    },
    {
      id: "DEMO-9",
      title: "商品列表展示",
      version: "1",
      type: 3,
    },
    {
      id: "DEMO-10",
      title: "登录时记住用户名",
      version: "0",
      type: 2,
    },
    // {
    //   id: "DEMO-11",
    //   title: "登录时验证密码",
    //   version: "v1",
    //   importance: "P0",
    //   module: "注册与登录",
    //   icon: "user",
    //   key: "11",
    // },
    // {
    //   id: "DEMO-12",
    //   title: "注册时验证邮箱",
    //   version: "v1",
    //   importance: "P0",
    //   module: "注册与登录",
    //   icon: "user",
    //   key: "12",
    // },
    // {
    //   id: "DEMO-13",
    //   title: "注册时验证手机号",
    //   version: "v1",
    //   importance: "P0",
    //   module: "注册与登录",
    //   icon: "user",
    //   key: "13",
    // },
    // {
    //   id: "DEMO-14",
    //   title: "注册时检验用户名是否重复",
    //   version: "v1",
    //   importance: "P0",
    //   module: "注册与登录",
    //   icon: "user",
    //   key: "14",
    // },
    // {
    //   id: "DEMO-15",
    //   title: "注册时验证密码强度",
    //   version: "v1",
    //   importance: "P0",
    //   module: "注册与登录",
    //   icon: "user",
    //   key: "15",
    // },
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
    Modal.confirm({
      title: (
        <div>
          <div>
            确认删除序列类型{" "}
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
            序列类型删除后不可恢复，同时删除类型下的测试序列
          </div>
        </div>
      ),

      onOk: async () => {
        try {
          const res = await deleteSubset(module.key);
          if (res.code === "0") {
            message.success("模块删除成功！");

            // 如果删除的是当前选中的模块，清除选中状态
            if (selectedModule === module.key) {
              setSelectedModule("");
            }

            // 重新获取树形数据
            await fetchTreeData();
          } else {
            message.error("删除失败：" + (res.message || "未知错误"));
          }
        } catch (error) {
          console.error("删除模块失败:", error);
          message.error("删除模块失败，请重试");
        }
      },
    });
  };

  // 将模块数据转换为Tree组件格式
  const treeData = [
    {
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
              console.log("选择模块: 用户类");
              setSelectedModule("user");
            }}
          >
            <FolderOutlined style={{ color: "#1890ff", fontSize: "16px" }} />
            <span
              style={{ fontSize: "14px", fontWeight: 500, color: "#1890ff" }}
            >
              用户类
            </span>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <PlusOutlined
              style={{
                color: "#ccc",
                fontSize: "16px",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "4px",
                transition: "all 0.2s",
                marginRight: "10px",
              }}
              // onMouseEnter={(e) => {
              //   e.currentTarget.style.backgroundColor = "#f6ffed";
              //   e.currentTarget.style.color = "#389e0d";
              // }}
              // onMouseLeave={(e) => {
              //   e.currentTarget.style.backgroundColor = "transparent";
              //   e.currentTarget.style.color = "#52c41a";
              // }}
              onClick={(e) => {
                e.stopPropagation();
                // 创建新的子集
                const newSubKey = `user-${Date.now()}`;
                const newSubItem = {
                  title: (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "4px 0",
                        marginLeft: "16px",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flex: 1,
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          console.log("选择子模块: 未命名序列子集");
                          setSelectedModule(newSubKey);
                        }}
                      >
                        <FileTextOutlined
                          style={{
                            color: "#722ed1",
                            fontSize: "14px",
                            marginRight: "8px",
                          }}
                        />
                        <span style={{ fontSize: "13px", color: "#333" }}>
                          未命名序列子集
                        </span>
                      </div>
                      <div style={{ marginLeft: "auto" }}>
                        <Popover
                          content={
                            <div>
                              <div
                                style={{
                                  padding: "2px 6px",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  setState({
                                    open: true,
                                    moudleValue: {
                                      name: "未命名序列子集",
                                      key: newSubKey,
                                    },
                                  });
                                  form?.setFieldsValue({
                                    name: "未命名序列子集",
                                  });
                                }}
                              >
                                编辑
                              </div>
                              <div
                                style={{
                                  padding: "2px 6px",
                                  cursor: "pointer",
                                  color: "#ff4d4f",
                                }}
                                onClick={() => {
                                  deleteModule({
                                    name: "未命名序列子集",
                                    key: newSubKey,
                                  });
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
                              fontSize: "14px",
                              color: "#666",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Popover>
                      </div>
                    </div>
                  ),
                  key: newSubKey,
                  isLeaf: true,
                };

                // 更新动态树形数据
                setDynamicTreeData((prev) => {
                  const updated = [...prev];
                  const userIndex = updated.findIndex(
                    (item) => item.key === "user"
                  );
                  if (userIndex !== -1) {
                    updated[userIndex] = {
                      ...updated[userIndex],
                      children: [
                        ...(updated[userIndex].children || []),
                        newSubItem,
                      ],
                    };
                  }
                  return updated;
                });

                message.success("子集创建成功！");
                console.log("创建新的子集: 未命名序列子集");
              }}
            />
            <Popover
              content={
                <div>
                  <div
                    style={{
                      padding: "2px 6px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setState({
                        open: true,
                        moudleValue: { name: "用户类", key: "user" },
                      });
                      form?.setFieldsValue({ name: "用户类" });
                    }}
                  >
                    编辑
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
        </div>
      ),
      key: "user",
      children: [
        {
          title: (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 0",
                marginLeft: "20px",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                  cursor: "pointer",
                }}
                onClick={() => {
                  console.log("选择子模块: 测试序列种类1");
                  setSelectedModule("user-1");
                }}
              >
                <FileTextOutlined
                  style={{
                    color: "#666",
                    fontSize: "14px",
                    marginRight: "8px",
                  }}
                />
                <span style={{ fontSize: "13px", color: "#333" }}>
                  测试序列种类1
                </span>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Popover
                  content={
                    <div>
                      <div
                        style={{
                          padding: "2px 6px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setState({
                            open: true,
                            moudleValue: {
                              name: "测试序列种类1",
                              key: "user-1",
                            },
                          });
                          form?.setFieldsValue({ name: "测试序列种类1" });
                        }}
                      >
                        编辑
                      </div>
                      <div
                        style={{
                          padding: "2px 6px",
                          cursor: "pointer",
                          color: "#ff4d4f",
                        }}
                        onClick={() => {
                          deleteModule({
                            name: "测试序列种类1",
                            key: "user-1",
                          });
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
                      fontSize: "14px",
                      color: "#666",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popover>
              </div>
            </div>
          ),
          key: "user-1",
          isLeaf: true,
        },
        {
          title: (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 0",
                marginLeft: "20px",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                  cursor: "pointer",
                }}
                onClick={() => {
                  console.log("选择子模块: 测试序列种类2");
                  setSelectedModule("user-2");
                }}
              >
                <FileTextOutlined
                  style={{
                    color: "#666",
                    fontSize: "14px",
                    marginRight: "8px",
                  }}
                />
                <span style={{ fontSize: "13px", color: "#333" }}>
                  测试序列种类2
                </span>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Popover
                  content={
                    <div>
                      <div
                        style={{
                          padding: "2px 6px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setState({
                            open: true,
                            moudleValue: {
                              name: "测试序列种类2",
                              key: "user-2",
                            },
                          });
                          form?.setFieldsValue({ name: "测试序列种类2" });
                        }}
                      >
                        编辑
                      </div>
                      <div
                        style={{
                          padding: "2px 6px",
                          cursor: "pointer",
                          color: "#ff4d4f",
                        }}
                        onClick={() => {
                          deleteModule({
                            name: "测试序列种类2",
                            key: "user-2",
                          });
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
                      fontSize: "14px",
                      color: "#666",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popover>
              </div>
            </div>
          ),
          key: "user-2",
          isLeaf: true,
        },
      ],
    },
    {
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
              console.log("选择模块: 系统类");
              setSelectedModule("system");
            }}
          >
            <FolderOutlined style={{ color: "#1890ff", fontSize: "16px" }} />
            <span style={{ fontSize: "14px", fontWeight: 500, color: "#333" }}>
              系统类
            </span>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <PlusOutlined
              style={{
                color: "#ccc",
                fontSize: "16px",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "4px",
                transition: "all 0.2s",
              }}
              onClick={(e) => {
                e.stopPropagation();
                // 创建新的子集
                const newSubKey = `system-${Date.now()}`;
                const newSubItem = {
                  title: (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "4px 0",
                        marginLeft: "16px",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flex: 1,
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          console.log("选择子模块: 未命名序列子集");
                          setSelectedModule(newSubKey);
                        }}
                      >
                        <FileTextOutlined
                          style={{
                            color: "#722ed1",
                            fontSize: "14px",
                            marginRight: "8px",
                          }}
                        />
                        <span style={{ fontSize: "13px", color: "#333" }}>
                          未命名序列子集
                        </span>
                      </div>
                      <div style={{ marginLeft: "auto" }}>
                        <Popover
                          content={
                            <div>
                              <div
                                style={{
                                  padding: "2px 6px",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  setState({
                                    open: true,
                                    moudleValue: {
                                      name: "未命名序列子集",
                                      key: newSubKey,
                                    },
                                  });
                                  form?.setFieldsValue({
                                    name: "未命名序列子集",
                                  });
                                }}
                              >
                                编辑
                              </div>
                              <div
                                style={{
                                  padding: "2px 6px",
                                  cursor: "pointer",
                                  color: "#ff4d4f",
                                }}
                                onClick={() => {
                                  deleteModule({
                                    name: "未命名序列子集",
                                    key: newSubKey,
                                  });
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
                              fontSize: "14px",
                              color: "#666",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Popover>
                      </div>
                    </div>
                  ),
                  key: newSubKey,
                  isLeaf: true,
                };

                // 更新动态树形数据
                setDynamicTreeData((prev) => {
                  const updated = [...prev];
                  const systemIndex = updated.findIndex(
                    (item) => item.key === "system"
                  );
                  if (systemIndex !== -1) {
                    updated[systemIndex] = {
                      ...updated[systemIndex],
                      children: [
                        ...(updated[systemIndex].children || []),
                        newSubItem,
                      ],
                    };
                  }
                  return updated;
                });

                message.success("子集创建成功！");
                console.log("创建新的子集: 未命名序列子集");
              }}
            />
            <Popover
              content={
                <div>
                  <div
                    style={{
                      padding: "2px 6px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setState({
                        open: true,
                        moudleValue: { name: "系统类", key: "system" },
                      });
                      form?.setFieldsValue({ name: "系统类" });
                    }}
                  >
                    编辑
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
        </div>
      ),
      key: "system",
      children: [
        {
          title: (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 0",
                marginLeft: "20px",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                  cursor: "pointer",
                }}
                onClick={() => {
                  console.log("选择子模块: 测试序列种类1");
                  setSelectedModule("system-1");
                }}
              >
                <FileTextOutlined
                  style={{
                    color: "#666",
                    fontSize: "14px",
                    marginRight: "8px",
                  }}
                />
                <span style={{ fontSize: "13px", color: "#333" }}>
                  测试序列种类1
                </span>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Popover
                  content={
                    <div>
                      <div
                        style={{
                          padding: "2px 6px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setState({
                            open: true,
                            moudleValue: {
                              name: "测试序列种类1",
                              key: "system-1",
                            },
                          });
                          form?.setFieldsValue({ name: "测试序列种类1" });
                        }}
                      >
                        编辑
                      </div>
                      <div
                        style={{
                          padding: "2px 6px",
                          cursor: "pointer",
                          color: "#ff4d4f",
                        }}
                        onClick={() => {
                          deleteModule({
                            name: "测试序列种类1",
                            key: "system-1",
                          });
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
                      fontSize: "14px",
                      color: "#666",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popover>
              </div>
            </div>
          ),
          key: "system-1",
          isLeaf: true,
        },
        {
          title: (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 0",
                marginLeft: "20px",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                  cursor: "pointer",
                }}
                onClick={() => {
                  console.log("选择子模块: 测试序列种类2");
                  setSelectedModule("system-2");
                }}
              >
                <FileTextOutlined
                  style={{
                    color: "#666",
                    fontSize: "14px",
                    marginRight: "8px",
                  }}
                />
                <span style={{ fontSize: "13px", color: "#333" }}>
                  测试序列种类2
                </span>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Popover
                  content={
                    <div>
                      <div
                        style={{
                          padding: "2px 6px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setState({
                            open: true,
                            moudleValue: {
                              name: "测试序列种类2",
                              key: "system-2",
                            },
                          });
                          form?.setFieldsValue({ name: "测试序列种类2" });
                        }}
                      >
                        编辑
                      </div>
                      <div
                        style={{
                          padding: "2px 6px",
                          cursor: "pointer",
                          color: "#ff4d4f",
                        }}
                        onClick={() => {
                          deleteModule({
                            name: "测试序列种类2",
                            key: "system-2",
                          });
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
                      fontSize: "14px",
                      color: "#666",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popover>
              </div>
            </div>
          ),
          key: "system-2",
          isLeaf: true,
        },
        {
          title: (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 0",
                marginLeft: "20px",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                  cursor: "pointer",
                }}
                onClick={() => {
                  console.log("选择子模块: 测试序列种类3");
                  setSelectedModule("system-3");
                }}
              >
                <FileTextOutlined
                  style={{
                    color: "#666",
                    fontSize: "14px",
                    marginRight: "8px",
                  }}
                />
                <span style={{ fontSize: "13px", color: "#333" }}>
                  测试序列种类3
                </span>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Popover
                  content={
                    <div>
                      <div
                        style={{
                          padding: "2px 6px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setState({
                            open: true,
                            moudleValue: {
                              name: "测试序列种类3",
                              key: "system-3",
                            },
                          });
                          form?.setFieldsValue({ name: "测试序列种类3" });
                        }}
                      >
                        编辑
                      </div>
                      <div
                        style={{
                          padding: "2px 6px",
                          cursor: "pointer",
                          color: "#ff4d4f",
                        }}
                        onClick={() => {
                          deleteModule({
                            name: "测试序列种类3",
                            key: "system-3",
                          });
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
                      fontSize: "14px",
                      color: "#666",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popover>
              </div>
            </div>
          ),
          key: "system-3",
          isLeaf: true,
        },
      ],
    },
  ];

  useEffect(() => {
    setData(useCases);
  }, []);

  // 获取树形数据
  const fetchTreeData = async () => {
    setTreeLoading(true);
    try {
      const res = await getTreeData();
      if (res.code === "0" && res.data) {
        // 转换后端数据为前端需要的格式
        const formattedData = formatTreeData(res.data);
        setDynamicTreeData(formattedData);
      } else {
        // 如果后端没有数据，使用默认数据
        setDynamicTreeData(treeData);
      }
    } catch (error) {
      console.error("获取树形数据失败:", error);
      // 使用默认数据作为fallback
      setDynamicTreeData(treeData);
    } finally {
      setTreeLoading(false);
    }
  };

  // 格式化树形数据
  const formatTreeData = (data: any[]) => {
    return data.map((item) => ({
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
              gap: "8px",
              flex: 1,
              cursor: "pointer",
            }}
            onClick={() => {
              console.log("选择模块:", item.name);
              setSelectedModule(item.key);
            }}
          >
            <FolderOutlined style={{ color: "#1890ff", fontSize: "16px" }} />
            <span
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: item.key === "user" ? "#1890ff" : "#333",
              }}
            >
              {item.name}
            </span>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <PlusOutlined
              style={{
                color: "#52c41a",
                fontSize: "16px",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "4px",
                transition: "all 0.2s",
                marginRight: "10px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f6ffed";
                e.currentTarget.style.color = "#389e0d";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#52c41a";
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleCreateSubset(item.key, item.name);
              }}
            />
            <Popover
              content={
                <div>
                  <div
                    style={{
                      padding: "2px 6px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setState({
                        open: true,
                        moudleValue: { name: item.name, key: item.key },
                      });
                      form?.setFieldsValue({ name: item.name });
                    }}
                  >
                    编辑
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
        </div>
      ),
      key: item.key,
      children: item.children
        ? item.children.map((child: any) => ({
            title: (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "4px 0",
                  marginLeft: "16px",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flex: 1,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    console.log("选择子模块:", child.name);
                    setSelectedModule(child.key);
                  }}
                >
                  <FileTextOutlined
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      marginRight: "8px",
                    }}
                  />
                  <span style={{ fontSize: "13px", color: "#333" }}>
                    {child.name}
                  </span>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <Popover
                    content={
                      <div>
                        <div
                          style={{
                            padding: "2px 6px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setState({
                              open: true,
                              moudleValue: { name: child.name, key: child.key },
                            });
                            form?.setFieldsValue({ name: child.name });
                          }}
                        >
                          编辑
                        </div>
                        <div
                          style={{
                            padding: "2px 6px",
                            cursor: "pointer",
                            color: "#ff4d4f",
                          }}
                          onClick={() => {
                            deleteModule({ name: child.name, key: child.key });
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
                        fontSize: "14px",
                        color: "#666",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popover>
                </div>
              </div>
            ),
            key: child.key,
            isLeaf: true,
          }))
        : [],
    }));
  };

  // 创建子集
  const handleCreateSubset = async (parentKey: string, parentName: string) => {
    try {
      const newSubsetData = {
        parentKey,
        parentName,
        name: "未命名序列子集",
        key: `${parentKey}-${Date.now()}`,
      };

      const res = await createSubset(newSubsetData);
      if (res.code === "0") {
        message.success("子集创建成功！");
        // 重新获取树形数据
        await fetchTreeData();
      } else {
        message.error("创建失败：" + (res.message || "未知错误"));
      }
    } catch (error) {
      console.error("创建子集失败:", error);
      message.error("创建子集失败，请重试");
    }
  };

  // 初始化动态树形数据
  useEffect(() => {
    fetchTreeData();
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

  const onExpand = (expandedKeys: React.Key[], info: any) => {
    console.log("展开/收起:", expandedKeys, info);
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
      return useCases.filter((useCase) => useCase.type === 0);
    }

    // 根据模块名称筛选用例
    return useCases.filter(
      (useCase) =>
        useCase.type === parseInt(selectedModuleData.key.split("-")[1] || "0")
    );
  };

  const requestData: any = async (...args: any) => {
    try {
      // 根据选中的模块添加筛选条件
      const selectedModuleType = selectedModule
        ? modules.find((m) => m.key === selectedModule)?.key.split("-")[1]
        : undefined;
      const params = {
        ...args[0],
        type: selectedModuleType ? parseInt(selectedModuleType) : undefined,
      };
      console.log("请求参数:", params, "选中模块类型:", selectedModuleType);
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
    <PageContainer>
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
            padding: "5px 20px 20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 185px)", // 设置固定高度，减去页面头部和边距
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {treeLoading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100px",
                  color: "#666",
                }}
              >
                加载中...
              </div>
            ) : (
              <Tree
                treeData={
                  dynamicTreeData.length > 0 ? dynamicTreeData : treeData
                }
                selectedKeys={selectedModule ? [selectedModule] : []}
                expandedKeys={expandedKeys}
                onSelect={onSelect}
                onExpand={onExpand}
                showLine={false}
                showIcon={false}
                blockNode
                switcherIcon={
                  <span style={{ fontSize: "10px", color: "#666" }}>▶</span>
                }
                style={{
                  backgroundColor: "transparent",
                  padding: "8px 0",
                }}
                className="custom-tree"
              />
            )}
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
            {/* <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
                {selectedModule
                  ? `${
                      selectedModule === "user"
                        ? "用户类"
                        : selectedModule === "system"
                        ? "系统类"
                        : selectedModule.startsWith("user-")
                        ? "用户类 > 测试序列种类" + selectedModule.split("-")[1]
                        : selectedModule.startsWith("system-")
                        ? "系统类 > 测试序列种类" + selectedModule.split("-")[1]
                        : "未知分类"
                    }·${getFilteredUseCases().length}`
                  : `全部序列·${useCases.length}`}
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
            </div> */}
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
                    return;
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
                  return;
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
        title="编辑序列名称"
        maskClosable={false}
        open={open}
        onCancel={() => {
          setState({
            open: false,
          });
        }}
        styles={{ body: { minHeight: 100, padding: 20 } }}
        width={"50%"}
        onOk={async () => {
          try {
            const params = form.getFieldsValue();
            const moduleValue = state.moudleValue;

            if (moduleValue && moduleValue.key) {
              const res = await updateSubset({
                id: moduleValue.key,
                name: params.name,
              });

              if (res.code === "0") {
                message.success("模块名称更新成功！");
                setState({ open: false });
                // 重新获取树形数据
                await fetchTreeData();
              } else {
                message.error("更新失败：" + (res.message || "未知错误"));
              }
            } else {
              message.error("模块信息不完整");
            }
          } catch (error) {
            console.error("更新模块失败:", error);
            message.error("更新模块失败，请重试");
          }
        }}
      >
        <Form {...layout} form={form} name="control-hooks">
          <Form.Item name="name" label="模块名称" rules={[{ required: true }]}>
            <Input placeholder="输入模块名称" />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
         .custom-tree .ant-tree-node-content-wrapper {
           padding: 4px 8px !important;
           border-radius: 4px;
           transition: all 0.2s;
         }
         
         .custom-tree .ant-tree-node-content-wrapper:hover {
           background-color: #f5f5f5 !important;
         }
         
         .custom-tree .ant-tree-node-content-wrapper.ant-tree-node-selected {
           background-color: #e6f7ff !important;
         }
         
         .custom-tree .ant-tree-treenode {
           margin: 2px 0;
         }
         
         .custom-tree .ant-tree-treenode:hover {
           background-color: transparent;
         }
         
         .custom-tree .ant-tree-switcher {
           color: #666 !important;
           font-size: 10px !important;
           display: flex !important;
           align-items: center !important;
           justify-content: center !important;
           width: 14px !important;
           margin-right: 4px !important;
           transition: all 0.2s;
         }
         
         .custom-tree .ant-tree-switcher:hover {
           color: #1890ff !important;
         }
         
         .custom-tree .ant-tree-switcher-leaf {
           display: none !important;
         }
         
         .custom-tree .ant-tree-switcher .ant-tree-switcher-icon {
           font-size: 8px !important;
           line-height: 1 !important;
           transform: rotate(0deg);
           transition: transform 0.2s;
         }
         
         .custom-tree .ant-tree-switcher_open .ant-tree-switcher-icon {
           transform: rotate(90deg);
         }
         
         .custom-tree .ant-tree-title {
           display: flex !important;
           align-items: center !important;
         }
         
         .add-subset-btn {
           transition: all 0.2s;
         }
         
                   .add-subset-btn:hover {
            background-color: #f6ffed !important;
            border-color: #52c41a !important;
            color: #52c41a !important;
          }
          
          .tree-subset-icon {
            color: #666 !important;
          }
          
          /* 统一设置所有子集图标的颜色 */
          .custom-tree .ant-tree-node-content-wrapper .anticon-file-text {
            color: #666 !important;
          }
       `}</style>
    </PageContainer>
  );
};

export default TestCaseExample;
