const routes = {
  path: "/task-management",
  name: "任务管理",
  icon: "table",
  access: "taskManagement",
  routes: [
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
      path: "/task-management/test-execution",
      name: "测试执行",
      access: ["testExecution-preview", "testExecution-edit"],
      component: "./task-management/test-execution",
    },
    {
      path: "/task-management/test-execution-result",
      name: "测试执行结果",
      access: ["testExecutionResult-preview", "testExecutionResult-edit"],
      component: "./task-management/test-execution-result",
    },
    {
      path: "/task-management/test-report",
      name: "测试报告",
      access: ["testReport-preview", "testReport-edit"],
      component: "./task-management/test-report",
    },
  ],
};
