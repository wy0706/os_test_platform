import { Progress } from "antd";
export const schemasTitle: any = {
  label: "测试任务",
  value: "testTask",
};

export const statusEnum: any = {
  all: { text: "已完成", status: "Success" },
  close: { text: "关闭", status: "Default" },
  running: { text: "运行中", status: "Processing" },
  online: { text: "已上线", status: "Success" },
  error: { text: "异常", status: "Error" },
};

export const schemasColumns: any = [
  {
    title: "任务名称",
    dataIndex: "title",
    ellipsis: true,
    sorter: true,
  },
  {
    title: "状态",
    dataIndex: "status",
    // ellipsis: true,
    // sorter: true,
    // valueType: "select",
    initialValue: "all",
    // filters: true,
    // onFilter: true,
    valueEnum: statusEnum,
  },
  {
    title: "结果分布",
    dataIndex: "title2",
    hideInSearch: true,
    render: (text: any, record: any) => {
      return <Progress percent={record.title2} size="small"></Progress>;
    },
  },
  {
    title: "负责人",
    dataIndex: "title3",
    ellipsis: true,
  },
  {
    title: "描述",
    dataIndex: "title4",
    ellipsis: true,
    hideInSearch: true,
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    ellipsis: true,
    sorter: true,
    hideInSearch: true,
    valueType: "dateTime",
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
      title: "任务名称",
      dataIndex: "title",
      formItemProps: {
        rules: [
          {
            required: true,
            message: "此项为必填项",
          },
        ],
      },
      fieldProps: {
        placeholder: "请输入任务名称",
        maxLength: 100,
      },
    },
    {
      title: "描述",
      dataIndex: "title2",
      valueType: "textarea",
      fieldProps: {
        placeholder: "请输入任务名称",
        rows: 2,
        maxLength: 200,
      },
    },
    {
      title: "负责人", //负责人默认是当前登录用户
      dataIndex: "title3",
      valueType: "select",
      formItemProps: {
        rules: [
          {
            required: true,
            message: "此项为必选项",
          },
        ],
      },
      fieldProps: {
        placeholder: "请选择负责人",
      },
    },
    {
      title: "关联测试序列集",
      dataIndex: "testSequenceIds",
      valueType: "custom",
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
