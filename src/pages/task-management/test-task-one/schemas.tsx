export const schemasTitle: any = {
  label: "执行用例",
  value: "testTaskOne",
};

export const schemasColumns: any = [
  {
    title: "编号",
    dataIndex: "title",
    search: false,
    ellipsis: true,
    sorter: true,
  },
  {
    title: "标题",
    dataIndex: "description",
    ellipsis: true,
    sorter: true,
  },
  {
    title: "版本",
    dataIndex: "version",
    search: false,
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
    search: false,
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
    search: false,
    valueType: "dateTime",
    sorter: true,
  },
  {
    title: "关联测试序列",
    dataIndex: "importance33",
    search: false,
    ellipsis: true,
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

export const reportDetail: any = [
  {
    title: "项目名称",
    key: "title",
    dataIndex: "title",
    ellipsis: true,
  },
  {
    title: "样品名称",
    key: "sampleName",
    dataIndex: "sampleName",
    // copyable: true,
    ellipsis: true,
  },
  {
    title: "版本",
    key: "version",
    dataIndex: "version",
    ellipsis: true,
  },
  {
    title: "测试员",
    key: "staff",
    dataIndex: "staff",
    ellipsis: true,
  },
  {
    title: "测试单位",
    key: "unity",
    dataIndex: "unity",
    ellipsis: true,
  },
  {
    title: "测试环境",
    key: "environment",
    dataIndex: "environment",
    ellipsis: true,
  },
  {
    title: "测试日期",
    key: "testDate",
    dataIndex: "testDate",
    ellipsis: true,
  },
  {
    title: "报告日期",
    key: "reportDate",
    dataIndex: "reportDate",
    ellipsis: true,
  },
  {
    title: "测试依据",
    key: "basis",
    dataIndex: "basis",
    ellipsis: true,
    span: 2,
  },
  {
    title: "结论",
    key: "conclusion",
    dataIndex: "conclusion",
    ellipsis: true,
    span: 2,
  },
];
