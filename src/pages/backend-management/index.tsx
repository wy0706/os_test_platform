import { SafetyCertificateOutlined, UserOutlined } from "@ant-design/icons";
import { history, Outlet, useLocation } from "@umijs/max";
import { Tabs } from "antd";
import React from "react";
import "./index.less";
const backendSubRoutes = [
  {
    path: "/backend-management/user-management",
    access: ["userManagement-preview", "userManagement-edit"],
  },
  {
    path: "/backend-management/role-management",
    access: ["roleManagement-preview", "roleManagement-edit"],
  },
  {
    path: "/backend-management/permission-management",
    access: ["permissionManagement-preview", "permissionManagement-edit"],
  },
];
// useEffect(() => {
//   const userAccess = getUserAccess(); // 获取当前用户权限
//   const firstAllowed = backendSubRoutes.find((route) =>
//     route.access.some((a) => userAccess.includes(a))
//   );
//   if (firstAllowed) {
//     history.replace(firstAllowed.path);
//   } else {
//     // 没有任何权限，跳转到403或其他页面
//     history.replace("/403");
//   }
// }, []);
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

  return (
    <div>
      <Tabs
        activeKey={activeKey}
        onChange={(key) => history.push(key)}
        items={tabList}
        style={{ paddingLeft: 32 }}
      />
      <Outlet />
    </div>
  );
};

export default BackendManagement;
