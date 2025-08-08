export const schemasTitle: any = {
  label: "测试需求",
  value: "testRequirement",
};

export const schemasColumns: any = [
  {
    title: "编号",
    dataIndex: "title",
    search: false,
  },
  {
    title: "标题",
    dataIndex: "createTime",
    // ellipsis: true,
    // sorter: true,
  },
];

export const schemasForm: any = {
  layoutType: "Form",
  colProps: {
    md: 24,
  },
  // grid: true,
  columns: [
    {
      title: "标题",
      dataIndex: "title",
      fieldProps: {
        placeholder: "请输入标题",
      },
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
      title: "描述",
      dataIndex: "createTime",
      valueType: "textarea",
      fieldProps: {
        placeholder: "请输入描述",
        rows: 4,
        // resize: "none",
      },
    },
    {
      title: "关联测试任务",
      dataIndex: "createTime2",
      valueType: "select",
      fieldProps: {
        mode: "multiple",
        options: [
          { label: "任务一", value: "testadmin" },
          { label: "任务二", value: "developer" },
          { label: "任务三", value: "tester" },
        ],
        placeholder: "请关联测试任务",
      },
    },
  ],
};

export const schemasDescriptions: any = [
  {
    title: "标题",
    key: "title",
    dataIndex: "title",
    // copyable: true,
    // ellipsis: true,
  },
  {
    title: "描述",
    key: "createTime",
    dataIndex: "createTime",
    // copyable: true,
    ellipsis: true,
  },
  {
    title: "关联测试任务",
    key: "createTime2",
    dataIndex: "createTime",
    // copyable: true,
    ellipsis: true,
  },
];
