export const schemasTitle: any = {
  label: "设备配置文件",
  value: "equipmentLibrary",
};

export const schemasColumns: any = [
  {
    title: "名称",
    dataIndex: "file_name",
    ellipsis: true,
  },
  {
    title: "创建时间",
    dataIndex: "edit_time",
    ellipsis: true,
    sorter: true,
    valueType: "dateTime",
    hideInSearch: true,
  },
  {
    title: "创建时间",
    dataIndex: "edit_time",
    key: "edit_time",
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
