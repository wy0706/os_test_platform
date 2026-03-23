export const schemasTable: any = [
  {
    title: "序号",
    dataIndex: "index",
    valueType: "index",
    width: 100,
  },
  {
    title: "产品序列号",
    dataIndex: "title",
    ellipsis: true,
    hideInSearch: true,
  },
  {
    title: "测试结果",
    dataIndex: "status",
    search: false,
    ellipsis: true,
    valueEnum: {
      1: { text: "PASS", status: "Success", disabled: true },
      2: { text: "FAIL", status: "Error", disabled: true },
    },
    hideInSearch: true,
  },
  {
    title: "报告",
    dataIndex: "detail",
    valueEnum: {
      1: { text: "√", status: "Success", disabled: true },
      2: { text: "✗", status: "Error", disabled: true },
    },
    search: false,
    ellipsis: true,
    hideInSearch: true,
  },

  {
    title: "序列文件",
    dataIndex: "title3",
    valueType: "select",
    hideInTable: true,
    fieldProps: {
      options: [
        { label: "序列文件1", value: "序列文件1" },
        { label: "序列文件2", value: "序列文件2" },
        { label: "序列文件3", value: "序列文件3" },
      ],
      placeholder: "请选择序列文件",
      showSearch: true,
    },
  },
  {
    title: "报告模版",
    dataIndex: "title4",
    valueType: "select",
    hideInTable: true,
    initialValue: "默认模版",
    fieldProps: {
      options: [{ label: "默认模版", value: "默认模版" }],
      placeholder: "请选择报告模版",
      showSearch: true,
    },
  },
  {
    title: "数据库开始结束时间",
    dataIndex: "title5",
    ellipsis: true,
    valueType: "dateRange",
    hideInTable: true,
  },
  {
    title: "报告状态",
    dataIndex: "title6",
    hideInTable: true,
    valueType: "radio",
    initialValue: "all",
    valueEnum: {
      all: { text: "全部", status: "Default" },
      running: { text: "合格", status: "Processing" },
      online: { text: "不合格", status: "Success" },
      error: { text: "精确", status: "Error" },
    },
  },
];
export const reportDetail: any = [
  {
    title: "程序名称",
    key: "title",
    dataIndex: "title",
    ellipsis: true,
  },
  {
    title: "产品名称",
    key: "sampleName",
    dataIndex: "sampleName",
    // copyable: true,
    ellipsis: true,
  },
  {
    title: "测试时间",
    key: "version",
    dataIndex: "version",
    ellipsis: true,
  },
  {
    title: "模型名称",
    key: "staff",
    dataIndex: "staff",
    ellipsis: true,
  },
  {
    title: "测试用时",
    key: "unity",
    dataIndex: "unity",
    ellipsis: true,
  },
  {
    title: "LOT Numb",
    key: "environment",
    dataIndex: "environment",
    ellipsis: true,
  },
  {
    title: "测试环境",
    key: "testDate",
    dataIndex: "testDate",
    ellipsis: true,
  },
  {
    title: "Order Nu",
    key: "reportDate",
    dataIndex: "reportDate",
    ellipsis: true,
  },

  {
    title: "检验员",
    key: "basis1",
    dataIndex: "basis1",
    ellipsis: true,
  },
  {
    title: "测试者",
    key: "basis",
    dataIndex: "basis",
    ellipsis: true,
  },
  {
    title: "测试结果",
    key: "basis1",
    dataIndex: "basis11",
    ellipsis: true,
    span: 2,
  },
];
