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
import { Access, useAccess } from "@umijs/max";
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
import "./index.less";

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
    allowed: ["preview", "edit"], // 支持访问+操作
  },
  {
    group: "系统管理",
    desc: "设备添加、命令添加、系统设置等基本功能操作",
    key: "systemManagement",
    allowed: ["preview", "edit"], // 支持访问+操作
  },
  {
    group: "管理后台",
    desc: "用户管理、权限配置等核心权限",
    key: "backendManagement",
    allowed: ["preview", "edit"], // 支持访问+操作
  },
];

// 权限项
const permissionItems = [
  { label: "访问", value: "preview" },
  { label: "操作", value: "edit" },
];

const PermissionManagement: React.FC = () => {
  const access = useAccess();
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

      const list = isArray(data?.list) ? data.list : [];
      // 根据旧的选中id判断是否还存在
      setState((prev) => {
        let newSelectedId = prev.selectedRoleId;
        let newRole = prev.currentRole;
        // 如果之前选中的角色不存在于新列表
        if (!list.find((r) => r.id === prev.selectedRoleId)) {
          newSelectedId = list.length > 0 ? list[0].id : null;
          newRole = list.length > 0 ? list[0] : null;
        } else {
          // 还在列表里就保持原来的选中
          newSelectedId = prev.selectedRoleId;
          newRole = list.find((r: any) => r.id === prev.selectedRoleId) || null;
        }

        return {
          ...prev,
          roles: list,
          selectedRoleId: newSelectedId,
          currentRole: newRole,
        };
      });

      // 如果有选中的角色就加载权限
      const selectedId =
        list.find((r: any) => r.id === state.selectedRoleId)?.id ||
        (list.length > 0 ? list[0].id : null);

      if (selectedId) {
        const {
          code,
          data: pressions,
          message: msg,
        } = await getOne(selectedId);

        if (code !== 0) {
          message.error(msg);
          return;
        }
        const obj = arrayToObject(pressions.resource_code || []);
        setState((prev) => ({
          ...prev,
          currentPermissions: obj,
          originalPermissions: obj,
        }));
      } else {
        // 没有角色
        setState((prev) => ({
          ...prev,
          currentPermissions: {},
          originalPermissions: {},
        }));
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

  // 添加角色
  const handleOk = async (value: any) => {
    setState({ isUpdateModalOpen: false });
    await getRoleList({ roleSearchInput });
  };
  const handleEditRole = async (role: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    console.log(role);
    const { code, data, message: msg } = await getOne(role.id);
    if (code !== 0) {
      message.error(msg);
      return;
    }
    setState({
      isUpdate: true,
      isUpdateModalOpen: true,
      updateValue: {
        ...data,
      },
    });
  };
  return (
    <PageContainer>
      <div className="permission-management">
        {/* 左侧角色列表 */}
        <div className="role-list">
          <div className="header">
            <h3>角色列表</h3>
            {access["backendManagement-edit"] && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="small"
                onClick={() =>
                  setState({ isUpdate: false, isUpdateModalOpen: true })
                }
              >
                添加角色
              </Button>
            )}
          </div>
          <div className="search-bar">
            <Input
              placeholder="搜索角色名称"
              allowClear
              value={roleSearchInput}
              onChange={(e) => setState({ roleSearchInput: e.target.value })}
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
          <div className="list-container">
            <Access
              accessible={
                !!(
                  access["backendManagement-edit"] ||
                  access["backendManagement-preview"]
                )
              }
            >
              <List
                itemLayout="horizontal"
                loading={roleLoading}
                dataSource={roles}
                renderItem={(role: any) => (
                  <List.Item
                    key={role.id}
                    className={
                      selectedRoleId === role.id
                        ? "list-item list-item-selected"
                        : "list-item"
                    }
                    onClick={() => handleRoleSelect(role)}
                    actions={
                      access["backendManagement-edit"]
                        ? [
                            <Button
                              icon={<EditOutlined />}
                              size="small"
                              type="link"
                              onClick={(e) => handleEditRole(role, e)}
                              key="edit"
                            />,
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
                            />,
                          ]
                        : undefined
                    }
                  >
                    <List.Item.Meta
                      title={<span>{role.name}</span>}
                      description={role.description}
                    />
                  </List.Item>
                )}
              />
            </Access>
          </div>
        </div>

        {/* 右侧权限配置 */}
        <div className="permissions-panel">
          <div className="panel-header">
            <div className="header-left">
              <span>
                权限配置 -{" "}
                <b style={{ color: "#1890FF" }}>{currentRole?.name || ""}</b>
              </span>
              <span className="header-subtitle">为选中的角色分配功能权限</span>
            </div>
            <span className="header-desc">{currentRole?.desc || ""}</span>
          </div>

          <div className="scroll-content">
            {currentRole ? (
              loadError ? (
                <div className="load-error">权限加载失败，请重试</div>
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
                              disabled={!access["backendManagement-edit"]}
                              onChange={() => {
                                if (!access["backendManagement-edit"]) return;
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
              <div className="no-role">暂无角色，请先添加角色</div>
            )}
          </div>

          {access["backendManagement-edit"] && (
            <div className="bottom-bar">
              <Space>
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
          )}
        </div>
      </div>

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
