export const schemasTitle: any = {
  label: "用例执行",
  value: "caseRun",
};

export const schemasColumns: any = [
  {
    title: "项目名称",
    dataIndex: "title",
    ellipsis: true,
  },
  {
    title: "项目名称/项目说明",
    dataIndex: "describe",
    ellipsis: true,
  },
  {
    title: "命令参数",
    dataIndex: "schemas",
    ellipsis: true,
  },
  {
    title: "是否合格",
    dataIndex: "qualified",
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

export const testInfoDescriptions: any = [
  {
    title: "测试程序",
    key: "title",
    dataIndex: "title",
    ellipsis: true,
    copyable: true,
  },
  {
    title: "编程人员",
    key: "name",
    dataIndex: "name",
    ellipsis: true,
  },
  {
    title: "编程日期",
    key: "programDate",
    dataIndex: "programDate",
    ellipsis: true,
  },
  {
    title: "编程时间",
    key: "programTime",
    dataIndex: "programTime",

    ellipsis: true,
  },
  {
    title: "设备配置",
    key: "configure",
    dataIndex: "configure",
    ellipsis: true,
  },
  {
    title: "报表格式",
    key: "format",
    dataIndex: "format",
    ellipsis: true,
  },
  {
    title: "产品类型",
    key: "testType",
    dataIndex: "testType",
    ellipsis: true,
  },
  {
    title: "产品输出种类",
    key: "type",
    dataIndex: "type",
    ellipsis: true,
  },
  {
    title: "产品序列号",
    key: "order",
    dataIndex: "order",
    ellipsis: true,
  },
  {
    title: "测试开始时间",
    key: "startTime",
    dataIndex: "startTime",
    ellipsis: true,
  },
];
