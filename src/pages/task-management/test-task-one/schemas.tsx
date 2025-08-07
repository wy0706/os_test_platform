export const schemasTitle: any = {
  label: "执行用例",
  value: "testTaskOne",
};

export const schemasColumns: any = [
  {
    title: "编号",
    dataIndex: "title",
    ellipsis: true,
    sorter: true,
  },

  {
    title: "名称",
    dataIndex: "description",
    ellipsis: true,
    sorter: true,
  },
  {
    title: "版本",
    dataIndex: "version",
  },
  {
    title: "重要程度",
    dataIndex: "importance",
    ellipsis: true,
    sorter: true,
  },
  {
    title: "执行结果",
    dataIndex: "importance2",
    ellipsis: true,
    valueEnum: {
      pass: {
        text: "PASS",
        status: "Success",
      },
      fail: {
        text: "Error",
        status: "Success",
      },
      null: {
        text: "未测",
        status: "Default",
      },
    },
    // 执行结果：未测、PASS/FAIL
    // sorter: true,
  },
  {
    title: "执行时间",
    dataIndex: "importance3",
    ellipsis: true,
    valueType: "dateTime",
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
