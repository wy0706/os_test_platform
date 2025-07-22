const routes = {
  path: "/equipment-management",
  name: "设备管理",
  icon: "table",
  access: "equipmentManagement",
  routes: [
    {
      path: "/equipment-management/equipment-library",
      name: "设备库",
      access: ["equipmentLibrary-preview", "equipmentLibrary-edit"],
      component: "./equipment-management/equipment-library",
    },
  ],
};
