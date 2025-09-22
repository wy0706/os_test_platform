export const schemasTitle: any = {
  label: "登录日志",
  value: "loginLog",
};

export const schemasColumns: any = [
  {
    title: "登录编号",
    dataIndex: "id",
    ellipsis: true,
    hideInSearch: true,
  },
  {
    title: "登录方式",
    dataIndex: "login_type",
    hideInSearch: true,
    ellipsis: true,
  },
  {
    title: "IP地址",
    hideInSearch: true,
    dataIndex: "login_ip",
    ellipsis: true,
  },
  {
    title: "登录人",
    dataIndex: ["user_info", "name"],
    ellipsis: true,
    hideInSearch: true,
  },
  {
    title: "登录人",
    dataIndex: "username",
    hideInTable: true,
  },
  {
    title: "登录结果",
    hideInSearch: true,
    dataIndex: "login_status",
    ellipsis: true,
    valueEnum: {
      SUCCESS: { text: "成功", status: "success" },
      FAILED: { text: "失败", status: "error" },
    },
  },

  {
    title: "登录时间",
    key: "showTime",
    dataIndex: "create_time",
    ellipsis: true,
    sorter: true,
    valueType: "dateTime",
    hideInSearch: true,
  },

  {
    title: "登录时间",
    dataIndex: "create_time",
    valueType: "date",
    hideInTable: true,
  },
];

export const schemasForm: any = {
  layoutType: "Form",
  rowProps: {
    gutter: [16, 16],
  },
  colProps: {
    span: 12,
  },
  grid: true,
  columns: [
    {
      title: "名称",
      dataIndex: "title",
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
      title: "创建时间",
      dataIndex: "createTime",
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
