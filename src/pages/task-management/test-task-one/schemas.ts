export const schemasTitle: any = {
  label: "测试任务",
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
