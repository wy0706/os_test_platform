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
  // formItemLayout: {
  //   labelCol: { span: 4 },
  //   wrapperCol: { span: 20 },
  // },
  columns: [
    {
      title: "角色名称",
      dataIndex: "name",
      formItemProps: {
        rules: [
          {
            required: true,
            message: "此项为必填项",
          },
        ],
      },
    },
    {
      title: "角色描述",
      dataIndex: "desc",
      formItemProps: {
        rules: [
          {
            required: true,
            message: "此项为必填项",
          },
        ],
      },
    },
  ],
};

export const schemasDescriptions: any = [
  {
    title: "名称",
    key: "title",
    dataIndex: "title",
    copyable: true,
    ellipsis: true,
  },
  {
    title: "创建时间",
    key: "createTime",
    dataIndex: "createTime",
    copyable: true,
    ellipsis: true,
  },
];
