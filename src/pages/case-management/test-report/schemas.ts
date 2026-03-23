export const schemasTitle: any = {
  label: "测试报告",
  value: "testReport",
};

export const schemasColumns: any = [
  {
    title: "序号",
    dataIndex: "index",
    valueType: "index",
    width: 100,
  },
  {
    title: "报告名称",
    dataIndex: "title",
    ellipsis: true,
  },

  {
    title: "生成日期",
    dataIndex: "createTime",
    hideInSearch: true,
    ellipsis: true,
    sorter: true,
  },
  {
    title: "状态",
    hideInSearch: true,
    dataIndex: "status",
    ellipsis: true,
    valueEnum: {
      1: { text: "完成", status: "Success", disabled: true },
      2: { text: "进行中", status: "Processing", disabled: true },
      3: { text: "失败", status: "Error", disabled: true },
    },
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
