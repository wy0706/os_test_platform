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
import React, { useEffect, useState } from "react";
import AddRoleModal from "./components/addRoleModal";
import { schemasForm } from "./schemas";
// 模拟角色数据
const mockRoles = [
  { id: 1, name: "系统管理员", desc: "拥有所有权限" },
  { id: 2, name: "测试处理", desc: "管理测试相关功能" },
  { id: 3, name: "开发工程师", desc: "开发相关权限" },
  { id: 4, name: "运维工程师", desc: "设备管理权限" },
  { id: 5, name: "质量保证", desc: "测试归档管理权限" },
  { id: 6, name: "访客", desc: "只读权限" },
  // { id: 7, name: "访客", desc: "只读权限" },
  // { id: 8, name: "访客", desc: "只读权限" },
  // { id: 9, name: "访客", desc: "只读权限" },
  // { id: 16, name: "访客", desc: "只读权限" },
];

// 模拟权限分组数据
const mockPermissions = [
  {
    group: "测试任务管理",
    desc: "创建、分配和执行测试任务，查看测试进度",
    key: "testTask",
  },
  {
    group: "测试用例管理",
    desc: "创建、编辑和执行测试用例，管理用例库",
    key: "testCase",
  },
  {
    group: "设备管理",
    desc: "管理测试设备，分配设备资源，查看设备状态",
    key: "device",
  },
  {
    group: "检测工具",
    desc: "使用和管理各种测试工具，分析测试数据",
    key: "tool",
  },
  {
    group: "系统管理",
    desc: "系统设置、用户管理、权限配置等核心权限",
    key: "system",
  },
  {
    group: "CI/CD",
    desc: "持续集成的持续部署流水线管理",
    key: "cicd",
  },
  {
    group: "日志管理",
    desc: "查看系统日志，分析系统运行情况",
    key: "log",
  },
];

// 权限项
const permissionItems = [
  { label: "访问", value: "view" },
  { label: "操作", value: "operate" },
];

const defaultRolePermissions = {
  1: {
    // 系统管理员
    testTask: ["view", "operate"],
    testCase: ["view", "operate"],
    device: ["view", "operate"],
    tool: ["view", "operate"],
    system: ["view", "operate"],
    cicd: ["view", "operate"],
    log: ["view", "operate"],
  },
  2: {
    // 测试处理
    testTask: ["view", "operate"],
    testCase: ["view", "operate"],
    device: ["view"],
    tool: ["view"],
    system: ["view"],
    cicd: [],
    log: ["view"],
  },
  // 其他角色可继续补充...
};

const PermissionManagement: React.FC = () => {
  const [roles, setRoles] = useState(mockRoles);
  const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>(
    roles[0]?.id
  );
  const [rolePermissions, setRolePermissions] = useState<any>(
    defaultRolePermissions
  );
  const [addRoleModalOpen, setAddRoleModalOpen] = useState(false);
  const [roleSearch, setRoleSearch] = useState(""); // 实际过滤关键字
  const [roleSearchInput, setRoleSearchInput] = useState(""); // 输入框内容
  const [permSearch, setPermSearch] = useState(""); // 实际过滤关键字
  const [permSearchInput, setPermSearchInput] = useState(""); // 输入框内容

  const [state, setState] = useSetState<any>({
    isUpdate: false,
    isUpdateModalOpen: false,
    updateValue: {},
    formSchema: schemasForm,
  });
  const { isUpdate, isUpdateModalOpen, updateValue, formSchema } = state;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // 角色切换
  const handleRoleSelect = (id: number) => {
    setSelectedRoleId(id);
  };

  // 权限勾选
  const handlePermissionChange = (permKey: string, checkedValues: string[]) => {
    setRolePermissions((prev: any) => ({
      ...prev,
      [selectedRoleId]: {
        ...prev[selectedRoleId],
        [permKey]: checkedValues,
      },
    }));
  };

  // 添加角色
  // const handleAddRole = () => {
  //   if (!newRoleName) {
  //     message.warning("请输入角色名称");
  //     return;
  //   }

  //   const newId = Math.max(...roles.map((r) => r.id)) + 1;
  //   setRoles([...roles, { id: newId, name: newRoleName, desc: newRoleDesc }]);
  //   setRolePermissions({
  //     ...rolePermissions,
  //     [newId]: {},
  //   });
  //   setAddRoleModalOpen(false);
  //   setNewRoleName("");
  //   setNewRoleDesc("");
  //   message.success("添加成功");
  // };

  // 编辑角色
  const handleEditRole = (role: any) => {
    setState({
      isUpdate: true,
      isUpdateModalOpen: true,
      updateValue: role,
    });
  };
  // const handleEditRoleOk = () => {
  //   setRoles(
  //     roles.map((r) =>
  //       r.id === editRoleId
  //         ? { ...r, name: editRoleName, desc: editRoleDesc }
  //         : r
  //     )
  //   );
  //   setEditRoleId(null);
  //   setEditRoleName("");
  //   setEditRoleDesc("");
  //   message.success("修改成功");
  // };

  // 删除角色
  const handleDeleteRole = (role: any) => {
    Modal.confirm({
      title: "是否确认删除该角色？",
      onOk: () => {
        setRoles((prev) => {
          const newRoles = prev.filter((r) => r.id !== role.id);
          // 如果当前选中被删，自动选中第一个
          if (selectedRoleId === role.id && newRoles.length > 0) {
            setSelectedRoleId(newRoles[0].id);
          } else if (newRoles.length === 0) {
            setSelectedRoleId(undefined);
          }
          return newRoles;
        });
        message.success("删除成功");
      },
    });
  };

  // 保存权限
  const handleSave = () => {
    message.success("权限已保存（模拟）");
  };

  // 取消
  const handleCancel = () => {
    message.info("已取消更改");
  };

  const currentRole = roles.find((r) => r.id === selectedRoleId);
  const currentPermissions = selectedRoleId
    ? rolePermissions[selectedRoleId] || {}
    : {};

  // 计算右侧内容高度，适配窗口高度
  const rightPanelMinHeight = "calc(100vh - 120px)"; // 适当留出头部和边距

  // 角色搜索过滤
  const filteredRoles = roles.filter((role) => role.name.includes(roleSearch));
  // 权限分组搜索过滤
  const filteredPermissions = mockPermissions.filter(
    (perm) =>
      perm.group.includes(permSearch) ||
      (perm.desc && perm.desc.includes(permSearch))
  );

  const handleOk = (value: any) => {
    console.log("1=====", value);
    setState({ isUpdateModalOpen: false });
    if (!isUpdate) {
      const newId = Math.max(...roles.map((r) => r.id)) + 1;
      setRoles([...roles, { id: newId, name: value.name, desc: value.desc }]);
      setRolePermissions({
        ...rolePermissions,
        [newId]: {},
      });
      setAddRoleModalOpen(false);
      message.success("添加成功");
    } else {
      setRoles(
        roles.map((r) =>
          r.id === value.id ? { ...r, name: value.name, desc: value.desc } : r
        )
      );
      message.success("修改成功");
    }
  };

  const handleSuccess = () => {
    setState({ isUpdateModalOpen: false });
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
            height: "calc(100vh - 200px)", // 设置固定高度，与左侧保持一致
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
              // onClick={() => setAddRoleModalOpen(true)}
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
              onChange={(e) => setRoleSearchInput(e.target.value)}
              // size="small"
              onPressEnter={() => setRoleSearch(roleSearchInput)}
            />
            <Button
              icon={<SearchOutlined />}
              // size="small"
              type="primary"
              onClick={() => setRoleSearch(roleSearchInput)}
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
              dataSource={filteredRoles}
              renderItem={(role) => (
                <List.Item
                  style={{
                    background:
                      selectedRoleId === role.id ? "#e6f7ff" : undefined,
                    cursor: "pointer",
                    paddingLeft: 16,
                  }}
                  onClick={() => handleRoleSelect(role.id)}
                  actions={[
                    <Button
                      icon={<EditOutlined />}
                      size="small"
                      type="link"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditRole(role);
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
                    description={role.desc}
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
            height: "calc(100vh - 200px)", // 设置固定高度，与左侧保持一致
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

          {/* 权限分组搜索框 */}
          {/* <div
                style={{
                  padding: 24,
                  paddingBottom: 0,
                  display: "flex",
                  gap: 8,
                }}
              >
                <Input
                  placeholder="搜索权限分组或描述"
                  allowClear
                  value={permSearchInput}
                  onChange={(e) => setPermSearchInput(e.target.value)}
                  size="small"
                  style={{ width: 300 }}
                  onPressEnter={() => setPermSearch(permSearchInput)}
                />
                <Button
                  icon={<SearchOutlined />}
                  size="small"
                  type="primary"
                  onClick={() => setPermSearch(permSearchInput)}
                >
                  搜索
                </Button>
              </div> */}
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
              <Form layout="vertical">
                {filteredPermissions.map((perm) => (
                  <Card
                    key={perm.key}
                    type="inner"
                    title={perm.group}
                    style={{ marginBottom: 16 }}
                    extra={<span style={{ color: "#888" }}>{perm.desc}</span>}
                  >
                    <Checkbox.Group
                      options={permissionItems}
                      value={currentPermissions[perm.key] || []}
                      onChange={(checked) =>
                        handlePermissionChange(perm.key, checked as string[])
                      }
                    />
                  </Card>
                ))}
              </Form>
            ) : (
              <div
                style={{
                  color: "#888",
                  textAlign: "center",
                  marginTop: 60,
                }}
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
              <Button onClick={handleCancel} disabled={!currentRole}>
                取消
              </Button>
              <Button
                type="primary"
                onClick={handleSave}
                disabled={!currentRole}
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
        onSuccess={handleSuccess}
        onCancel={() => setState({ isUpdateModalOpen: false })}
        formSchema={formSchema}
      />
    </PageContainer>
  );
};

export default PermissionManagement;
