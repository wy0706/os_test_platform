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
