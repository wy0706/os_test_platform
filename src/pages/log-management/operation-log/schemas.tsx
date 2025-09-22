export const schemasTitle: any = {
  label: "操作日志",
  value: "operationLog",
};

export const schemasColumns: any = [
  {
    title: "日志编号",
    dataIndex: "id",
    ellipsis: true,
    hideInSearch: true,
  },
  {
    title: "操作模块",
    dataIndex: "module_name",
    hideInSearch: true,
    ellipsis: true,
  },
  {
    title: "操作模块ID",
    dataIndex: "instance_id",
    hideInSearch: true,
    ellipsis: true,
  },
  {
    title: "操作类型",
    dataIndex: "opt_type",
    hideInSearch: true,
    ellipsis: true,
  },
  {
    title: "操作人",
    ellipsis: true,
    dataIndex: ["user_info", "name"],
  },
  {
    title: "操作日期",
    key: "showTime",
    dataIndex: "create_time",
    ellipsis: true,
    sorter: true,
    valueType: "dateTime",
    hideInSearch: true,
  },

  {
    title: "操作日期",
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
