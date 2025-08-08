/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: "/user",
    layout: false,
    routes: [
      {
        name: "login",
        path: "/user/login",
        component: "./user/login",
      },
    ],
  },

  {
    path: "/welcome",
    name: "工作台",
    icon: "dashboard",
    component: "./Welcome",
  },
  {
    path: "/task-management",
    name: "任务管理",
    icon: "Schedule",
    access: "taskManagement",
    routes: [
      {
        path: "/task-management",
        redirect: "/task-management/test-requirement",
      },
      {
        path: "/task-management/test-requirement",
        name: "测试需求",
        access: ["testRequirement-preview", "testRequirement-edit"],
        component: "./task-management/test-requirement",
      },
      {
        path: "/task-management/test-task",
        name: "测试任务",
        access: ["testTask-preview", "testTask-edit"],
        component: "./task-management/test-task",
      },
      {
        path: "/task-management/test-task-one/:id",
        name: "详细任务",
        // access: ["testTaskOne-preview", "testTaskOne-edit"],
        component: "./task-management/test-task-one",
        hideInMenu: true,
        hideInBreadcrumb: true,
      },
      // {
      //   path: "/task-management/test-execution",
      //   name: "测试执行",
      //   access: ["testExecution-preview", "testExecution-edit"],
      //   component: "./task-management/test-execution",
      // },
      // {
      //   path: "/task-management/test-execution-result",
      //   name: "测试执行结果",
      //   access: ["testExecutionResult-preview", "testExecutionResult-edit"],
      //   component: "./task-management/test-execution-result",
      // },
      // {
      //   path: "/task-management/test-report",
      //   name: "测试报告",
      //   access: ["testReport-preview", "testReport-edit"],
      //   component: "./task-management/test-report",
      // },
    ],
  },
  {
    path: "/case-management",
    name: "测试设计",
    icon: "fileSearch",
    access: "caseManagement",
    routes: [
      {
        path: "/case-management",
        redirect: "/case-management/test-case",
      },
      {
        path: "/case-management/test-case",
        name: "测试用例",
        access: ["testCase-preview", "testCase-edit"],
        component: "./case-management/test-case",
      },
      {
        path: "/case-management/test-sequence",
        name: "序列编辑",
        access: ["testSequence-preview", "testSequence-edit"],
        component: "./case-management/test-sequence",
      },
      {
        path: "/case-management/test-sequence-integration",
        name: "序列集成",
        access: [
          "testSequenceIntegration-preview",
          "testSequenceIntegration-edit",
        ],
        component: "./case-management/test-sequence-integration",
      },
      {
        path: "/case-management/case-library",
        name: "用例执行",
        access: ["caseLibrary-preview", "caseLibrary-edit"],
        component: "./case-management/case-library",
      },

      {
        path: "/case-management/test-case-example/:id",
        name: "示例测试库",
        access: ["testCaseExample-preview", "testCaseExample-edit"],
        component: "./case-management/test-case-example",
        hideInMenu: true,
        hideInBreadcrumb: true,
        hideFooter: true,
      },
    ],
  },
  {
    path: "/equipment-management",
    name: "设备管理",
    icon: "database",
    access: "equipmentManagement",
    routes: [
      {
        path: "/equipment-management",
        redirect: "/equipment-management/equipment-library",
      },
      {
        path: "/equipment-management/equipment-library",
        name: "设备配置文件",
        access: ["equipmentLibrary-preview", "equipmentLibrary-edit"],
        component: "./equipment-management/equipment-library",
      },
      // {
      //   path: "/equipment-management/peripheral-import",
      //   name: "外设导入",
      //   access: ["peripheralImport-preview", "peripheralImport-edit"],
      //   component: "./equipment-management/peripheral-import",
      //   hideFooter: true,
      // },
      {
        path: "/equipment-management/equipment-library-edit/:id",
        name: "外设导入",
        access: ["equipmentLibraryEdit-preview", "equipmentLibraryEdit-edit"],
        component: "./equipment-management/equipment-library-edit",
        hideInMenu: true,
        hideInBreadcrumb: true,
        hideFooter: true,
      },
    ],
  },
  // {
  //   path: "/tool-management",
  //   name: "检测工具",
  //   icon: "tool",
  //   access: "toolManagement",
  //   routes: [
  //     {
  //       path: "/tool-management/ide-tool",
  //       name: "集成开发环境",
  //       access: ["ideTool-preview", "ideTool-edit"],
  //       component: "./tool-management/ide-tool",
  //     },

  //     {
  //       path: "/tool-management/deploy-tool",
  //       name: "部署工具",
  //       access: ["deployTool-preview", "deployTool-edit"],
  //       component: "./tool-management/deploy-tool",
  //     },
  //   ],
  // },
  {
    path: "/system-management",
    name: "系统管理",
    icon: "setting",
    access: "systemManagement",
    routes: [
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
  },
  {
    path: "/",
    redirect: "/welcome",
  },
  {
    path: "/backend-management",
    name: "后台管理",
    component: "./backend-management",
    access: "backendManagement",
    hideInMenu: true,
    routes: [
      {
        path: "/backend-management",
        redirect: "/backend-management/user-management",
      },
      {
        path: "/backend-management/user-management",
        name: "用户管理",
        access: ["userManagement-preview", "userManagement-edit"],
        component: "./backend-management/user-management",
        hideInMenu: true,
        hideInBreadcrumb: true,
      },
      {
        path: "/backend-management/permission-management",
        name: "权限管理",
        access: ["permissionManagement-preview", "permissionManagement-edit"],
        hideInMenu: true,
        component: "./backend-management/permission-management",
        hideInBreadcrumb: true,
      },
    ],
  },

  {
    path: "/account/center",
    name: "账号设置",
    component: "./account/center",
    hideInMenu: true,
  },
  {
    path: "*",
    layout: false,
    component: "./404",
  },
];
