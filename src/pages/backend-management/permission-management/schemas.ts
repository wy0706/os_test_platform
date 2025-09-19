export const schemasTitle: any = {
  label: "权限管理",
  value: "permissionManagement",
};

export const schemasColumns: any = [
  {
    title: "名称",
    dataIndex: "title",
    ellipsis: true,
    sorter: true,
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    ellipsis: true,
    sorter: true,
  },
];

export const schemasForm: any = {
  layoutType: "Form",
  rowProps: {
    gutter: [16, 16],
  },
  colProps: {
    span: 24,
  },
  grid: true,

  columns: [
    {
      title: "角色名称",
      dataIndex: "role_name",
      formItemProps: {
        rules: [
          {
            required: true,
            message: "请输入角色名称",
          },
        ],
      },
    },
    {
      title: "角色描述",
      dataIndex: "role_description",
      formItemProps: {
        rules: [
          {
            required: true,
            message: "请输入角色描述",
          },
        ],
      },
    },
  ],
};
