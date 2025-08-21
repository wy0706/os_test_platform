export const dynamicRouteParentMap: Record<string, string> = {
  // 测试设计
  "/case-management/test-sequence-edit": "/case-management/test-sequence", //序列编辑
  "/case-management/test-sequence-process":
    "/case-management/test-sequence-integration", //序列集成
  "/case-management/test-case-example": "/case-management/test-case", //测试用例
  "/case-management/case-run": "/case-management/case-library", //序列执行

  // 设备管理
  "/equipment-management/equipment-library-edit":
    "/equipment-management/equipment-library", //设备配置文件

  // 测试任务
  "/task-management/test-task-one": "/task-management/test-task",
};
