export const schemasTitle: any = {
  label: "登录日志",
  value: "loginLog",
};

export const schemasColumns: any = [
  {
    title: "类型",
    dataIndex: "title",
    ellipsis: true,
  },
  {
    title: "登录方式",
    dataIndex: "title1",
    ellipsis: true,
  },
  {
    title: "IP地址",
    dataIndex: "title2",
    ellipsis: true,
  },
  {
    title: "设备",
    dataIndex: "title3",
    ellipsis: true,
  },

  {
    title: "操作时间",
    dataIndex: "createTime",
    ellipsis: true,
    sorter: true,
    valuesType: "dateTime",
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
