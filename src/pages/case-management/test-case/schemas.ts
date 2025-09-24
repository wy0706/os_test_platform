export const schemasTitle: any = {
  label: "测试用例库",
  value: "testCase",
};

export const schemasColumns: any = [
  {
    title: "名称",
    dataIndex: "name",
    key: "lib_name",
    ellipsis: true,
  },

  {
    title: "标识",
    dataIndex: "label",
    ellipsis: true,
    key: "lib_label",
  },
  {
    title: "更新时间",
    dataIndex: "update_time",
    ellipsis: true,
    sorter: true,
    hideInSearch: true,
  },

  {
    title: "更新时间",
    dataIndex: "update_time",
    key: "update_time",
    hideInTable: true,
    valueType: "date",
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
