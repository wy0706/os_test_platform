const routes = {
  path: "/system-management",
  name: "系统管理",
  icon: "table",
  access: "systemManagement",
  routes: [
    {
      path: "/system-management/user-management",
      name: "用户管理",
      access: ["userManagement-preview", "userManagement-edit"],
      component: "./system-management/user-management",
    },
    {
      path: "/system-management/role-management",
      name: "角色管理",
      access: ["roleManagement-preview", "roleManagement-edit"],
      component: "./system-management/role-management",
    },
    {
      path: "/system-management/permission-management",
      name: "权限管理",
      access: ["permissionManagement-preview", "permissionManagement-edit"],
      component: "./system-management/permission-management",
    },
    {
      path: "/system-management/login-log",
      name: "登录日志",
      access: ["loginLog-preview", "loginLog-edit"],
      component: "./system-management/login-log",
    },
    {
      path: "/system-management/operation-log",
      name: "操作日志",
      access: ["operationLog-preview", "operationLog-edit"],
      component: "./system-management/operation-log",
    },
  ],
};
