// src/pages/system-management/backend-management/index.tsx
import {
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { history, Outlet, useLocation } from "@umijs/max";
import { Tabs } from "antd";
import React from "react";

const tabList = [
  {
    key: "/backend-management/user-management",
    label: (
      <span>
        <UserOutlined style={{ marginRight: 4 }} /> 用户管理
      </span>
    ),
  },
  {
    key: "/backend-management/role-management",
    label: (
      <span>
        <TeamOutlined style={{ marginRight: 4 }} /> 角色管理
      </span>
    ),
  },
  {
    key: "/backend-management/permission-management",
    label: (
      <span>
        <SafetyCertificateOutlined style={{ marginRight: 4 }} /> 权限管理
      </span>
    ),
  },
];

const BackendManagement: React.FC = () => {
  const location = useLocation();
  // activeKey 匹配 /backend-management 前缀
  const activeKey =
    tabList.find((tab) => location.pathname.startsWith(tab.key))?.key ||
    tabList[0].key;
  console.log("cart", activeKey);

  return (
    <div>
      <Tabs
        activeKey={activeKey}
        onChange={(key) => history.push(key)}
        items={tabList}
        style={{ marginBottom: 16, paddingLeft: 32 }}
      />
      <Outlet />
    </div>
  );
};

export default BackendManagement;
