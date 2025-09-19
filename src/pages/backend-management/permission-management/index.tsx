import {
  deleteOne,
  getList as getAllRoleList,
  getOne,
  updateOne,
} from "@/services/backend-management/permission-management.service";
import { arrayToObject, isArray } from "@/utils/index";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  List,
  Modal,
  Space,
  message,
} from "antd";
import React, { useEffect } from "react";
import AddRoleModal from "./components/addRoleModal";

// 模拟权限分组数据
const mockPermissions = [
  {
    group: "任务管理",
    desc: "创建、分配和执行测试任务，查看测试进度",
    key: "taskManagement",
    allowed: ["preview", "edit"], // 支持访问+操作
  },
  {
    group: "测试设计",
    desc: "创建、编辑和执行测试用例，管理用例库",
    key: "testDesign",
    allowed: ["preview", "edit"], // 支持访问+操作
  },
  {
    group: "设备管理",
    desc: "管理测试设备，分配设备资源，查看设备状态",
    key: "equipmentManagement",
    allowed: ["preview", "edit"], // 支持访问+操作
  },
  {
    group: "日志管理",
    desc: "查看系统日志，分析系统运行情况",
    key: "logManagement",
    allowed: ["preview"], // 只支持访问
  },
  {
    group: "系统管理",
    desc: "添加设备，添加命令",
    key: "systemManagement",
    allowed: ["preview", "edit"],
  },
  {
    group: "管理后台",
    desc: "系统设置、用户管理、权限配置等核心权限",
    key: "backendManagement",
    allowed: ["preview", "edit"],
  },
];

// 权限项
const permissionItems = [
  { label: "访问", value: "preview" },
  { label: "操作", value: "edit" },
];

const PermissionManagement: React.FC = () => {
  const [state, setState] = useSetState<any>({
    isUpdate: false,
    isUpdateModalOpen: false,
    updateValue: {},
    roles: [],
    roleLoading: false,
    selectedRoleId: null,
    currentRole: null,
    roleSearchInput: null,
    currentPermissions: {}, //当前用户的权限
    originalPermissions: {},
    loadError: false,
    saving: false,
  });
  const {
    isUpdate,
    isUpdateModalOpen,
    updateValue,
    roles,
    selectedRoleId,
    currentRole,
    roleLoading,
    roleSearchInput,
    currentPermissions,
    loadError,
    saving,
  } = state;

  useEffect(() => {
    const fetchRoles = async () => {
      await getRoleList({ roleSearchInput });
    };
    fetchRoles();
  }, []);

  // 获取角色列表
  const getRoleList = async (params: any) => {
    setState({
      roleLoading: true,
    });
    try {
      const {
        code,
        data,
        message: msg,
      } = await getAllRoleList({
        role_name: params.roleSearchInput,
        page_index: 1,
        page_size: 999,
      });

      if (code !== 0) {
        message.error(msg);
        return;
      }
      setState({
        roles: isArray(data?.list) ? data.list : [],
        selectedRoleId:
          isArray(data?.list) && data.list.length > 0 ? data.list[0].id : null,
        currentRole:
          isArray(data?.list) && data?.list.length > 0 ? data.list[0] : null,
      });
      if (isArray(data?.list) && data.list.length > 0) {
        const {
          code,
          data: pressions,
          message: msg,
        } = await getOne(data.list[0].id);
        if (code !== 0) {
          message.error(msg);
          return;
        }
        let obj = arrayToObject(pressions.resource_code);
        setState({
          currentPermissions: obj,
          originalPermissions: obj, // 备份一份原始,取消的时候用
        });
      }
    } finally {
      setState({
        roleLoading: false,
      });
    }
  };

  // 角色切换并加载权限
  const handleRoleSelect = async (role: any) => {
    setState((prev) => ({
      ...prev,
      selectedRoleId: role.id,
      currentRole: { ...role },
      currentPermissions: {},
      originalPermissions: {},
      loadError: false,
    }));

    try {
      const { code, data: pressions, message: msg } = await getOne(role.id);

      if (code !== 0) {
        message.error(msg || "加载权限失败");
        setState((prev) => ({
          ...prev,
          currentPermissions: {},
          originalPermissions: {},
          loadError: true,
        }));
        return;
      }

      // 即使 resource_code 是 [] 也正常渲染
      const obj = arrayToObject(pressions?.resource_code || []);
      setState((prev) => ({
        ...prev,
        currentPermissions: obj,
        originalPermissions: obj,
        loadError: false,
      }));
    } catch (error) {
      setState({
        currentPermissions: {},
        originalPermissions: {},
        loadError: true,
      });
    }
  };

  // 删除角色
  const handleDeleteRole = (role: any) => {
    Modal.confirm({
      title: "是否确认删除该角色？",
      onOk: async () => {
        const { code, message: msg } = await deleteOne(role.id);
        if (code === 0) {
          message.success("删除成功");
          getRoleList({ roleSearchInput });
        } else {
          message.error(msg);
        }
      },
    });
  };

  const handleSave = async () => {
    setState({ saving: true }); // 开始保存，禁用按钮
    try {
      const { code, message: msg } = await updateOne({
        role_id: selectedRoleId,
        ...currentPermissions,
      });
      if (code === 0) {
        message.success(msg || "保存成功");
        // 更新originalPermissions为最新保存值
        setState((prev) => ({
          ...prev,
          originalPermissions: { ...prev.currentPermissions },
        }));
      } else {
        message.error(msg || "保存失败，已恢复原权限");
        setState((prev) => ({
          ...prev,
          currentPermissions: { ...prev.originalPermissions },
        }));
      }
    } catch (error) {
      // message.error("请求异常，已恢复原权限");
      setState((prev) => ({
        ...prev,
        currentPermissions: { ...prev.originalPermissions },
      }));
    } finally {
      setState({ saving: false });
    }
  };

  // 取消
  const handleCancel = () => {
    setState((prev) => ({
      ...prev,
      currentPermissions: { ...prev.originalPermissions },
    }));
    message.info("已取消更改");
  };
  // 添加角色
  const handleOk = async (value: any) => {
    setState({ isUpdateModalOpen: false });
    await getRoleList({ roleSearchInput });
  };

  return (
    <PageContainer>
      <div
        style={{
          display: "flex",
          backgroundColor: "#f5f5f5",
          gap: "16px",
        }}
      >
        {/* 左侧角色列表 */}
        <div
          style={{
            width: 500,
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            maxHeight: "calc(100vh - 200px)",
            // height: "calc(100vh - 200px)", // 设置固定高度，与左侧保持一致
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
            <h3>角色列表</h3>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              onClick={() => {
                setState({
                  isUpdate: false,
                  isUpdateModalOpen: true,
                });
              }}
            >
              添加角色
            </Button>
          </div>
          <div style={{ padding: 12, display: "flex", gap: 8 }}>
            <Input
              placeholder="搜索角色名称"
              allowClear
              value={roleSearchInput}
              onChange={(e) => {
                setState({
                  roleSearchInput: e.target.value,
                });
              }}
              // size="small"
              onPressEnter={() => {
                setState({
                  roles: [],
                  selectedRoleId: null,
                  currentRole: null,
                });

                getRoleList({ roleSearchInput });
              }}
            />
            <Button
              icon={<SearchOutlined />}
              // size="small"
              type="primary"
              onClick={() => {
                setState({
                  roles: [],
                  selectedRoleId: null,
                  currentRole: null,
                });
                getRoleList({ roleSearchInput });
              }}
            >
              搜索
            </Button>
          </div>
          <div
            style={{
              maxHeight: "58vh",
              overflow: "auto",
              minHeight: 0,
              paddingRight: 20,
            }}
          >
            <List
              itemLayout="horizontal"
              loading={roleLoading} // ✅ loading 状态
              dataSource={roles}
              renderItem={(role: any) => (
                <List.Item
                  style={{
                    background:
                      selectedRoleId === role.id ? "#e6f7ff" : undefined,
                    cursor: "pointer",
                    paddingLeft: 16,
                  }}
                  onClick={() => handleRoleSelect(role)}
                  actions={[
                    <Button
                      icon={<EditOutlined />}
                      size="small"
                      type="link"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(role);

                        setState({
                          isUpdate: true,
                          isUpdateModalOpen: true,
                          updateValue: {
                            ...role,
                          },
                        });
                      }}
                      key="edit"
                    ></Button>,
                    <Button
                      size="small"
                      type="link"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role);
                      }}
                      key="del"
                    ></Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={<span>{role.name}</span>}
                    description={role.description}
                  />
                </List.Item>
              )}
            />
          </div>
        </div>

        {/* 右侧权限配置 */}

        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            maxHeight: "calc(100vh - 200px)",
            // height: "calc(100vh - 200px)", // 设置固定高度，与左侧保持一致
          }}
        >
          <div
            style={{
              display: "flex",
              // flexDirection: "column",
              paddingTop: 5,
              paddingBottom: 10,
              boxSizing: "border-box",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              {" "}
              <span>
                权限配置 -{" "}
                <b style={{ color: "#1890FF" }}>{currentRole?.name || ""}</b>
              </span>
              <span style={{ color: "#888", fontSize: 10 }}>
                为选中的角色分配功能权限
              </span>
            </div>
            <span style={{ color: "#888" }}>{currentRole?.desc || ""}</span>
          </div>

          {/* 滚动内容区 */}
          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: 24,
              paddingTop: 12,
              minHeight: 0,
            }}
          >
            {currentRole ? (
              loadError ? (
                <div
                  style={{ color: "#888", textAlign: "center", marginTop: 60 }}
                >
                  权限加载失败，请重试
                </div>
              ) : (
                <Form layout="vertical">
                  {mockPermissions.map((perm) => {
                    const options = permissionItems.filter((item) =>
                      perm.allowed.includes(item.value)
                    );
                    return (
                      <Card
                        key={perm.key}
                        type="inner"
                        title={perm.group}
                        style={{ marginBottom: 16 }}
                        extra={
                          <span style={{ color: "#888" }}>{perm.desc}</span>
                        }
                      >
                        <div>
                          {options.map((opt) => (
                            <Checkbox
                              key={opt.value}
                              checked={
                                currentPermissions?.[perm.key] === opt.value
                              }
                              onChange={() => {
                                setState((prev) => {
                                  const curr =
                                    prev.currentPermissions?.[perm.key];
                                  const nextValue =
                                    curr === opt.value ? null : opt.value;
                                  return {
                                    ...prev,
                                    currentPermissions: {
                                      ...prev.currentPermissions,
                                      [perm.key]: nextValue,
                                    },
                                  };
                                });
                              }}
                              style={{ marginRight: 16 }}
                            >
                              {opt.label}
                            </Checkbox>
                          ))}
                        </div>
                      </Card>
                    );
                  })}
                </Form>
              )
            ) : (
              <div
                style={{ color: "#888", textAlign: "center", marginTop: 60 }}
              >
                暂无角色，请先添加角色
              </div>
            )}
          </div>
          {/* 固定底部按钮区 */}
          <div
            style={{
              borderTop: "1px solid #f0f0f0",
              background: "#fff",
              padding: "16px 24px",
              textAlign: "right",
              position: "sticky",
              bottom: 0,
              zIndex: 10,
              borderRadius: 10,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            }}
          >
            <Space>
              {/* <Button onClick={handleCancel} disabled={!currentRole}>
                取消
              </Button> */}
              <Button
                type="primary"
                onClick={handleSave}
                loading={saving}
                disabled={!currentRole || loadError || saving}
              >
                保存更改
              </Button>
            </Space>
          </div>
          {/* </Card> */}
        </div>
      </div>

      {/* 添加角色弹窗 */}
      <AddRoleModal
        onOk={handleOk}
        open={isUpdateModalOpen}
        isUpdate={isUpdate}
        updateValue={updateValue}
        onCancel={() => setState({ isUpdateModalOpen: false })}
      />
    </PageContainer>
  );
};

export default PermissionManagement;
