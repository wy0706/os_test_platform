export const schemasTitle: any = {
  label: "测试日志",
  value: "testLog",
};

export const schemasColumns: any = [
  {
    title: "日志名称",
    dataIndex: "title",
    ellipsis: true,

    render: (value: any, record: any) => {
      return (
        <span>
          {record?.title}
          {record?.code}
        </span>
      );
    },
  },
  {
    title: "生成日期",
    dataIndex: "createTime",
    ellipsis: true,
    sorter: true,
    hideInSearch: true,
  },
  {
    title: "生成日期",
    dataIndex: "createTime",
    key: "createTime",
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
