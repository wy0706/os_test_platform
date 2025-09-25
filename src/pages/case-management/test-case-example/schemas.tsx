export const schemasTitle: any = {
  label: "示例测试库",
  value: "testCaseExample",
};

export const schemasColumns: any = [
  {
    title: "编号",
    dataIndex: "id",
    hideInSearch: true,
  },
  {
    title: "标题",
    dataIndex: "title",
    key: "tc_title",
    ellipsis: true,
  },
  {
    title: "版本",
    dataIndex: "version",
    hideInSearch: true,
  },
  {
    title: "重要程度",
    dataIndex: "importance",
    ellipsis: true,
    hideInSearch: true,
  },
];
export const reportDetail: any = [
  {
    title: "标题",
    key: "title",
    dataIndex: "title",
    ellipsis: true,
  },
  {
    title: "维护人",
    key: "user_id",
    dataIndex: ["owner", "name"],
    // copyable: true,
    ellipsis: true,
  },
  {
    title: "版本号",
    key: "version",
    dataIndex: "version",
    ellipsis: true,
  },
  {
    title: "重要程度",
    key: "importance",
    dataIndex: "importance",
    ellipsis: true,
  },
  {
    title: "所属测试库",
    dataIndex: ["tc_info", "name"],
    ellipsis: true,
  },
  {
    title: "所属模块",
    dataIndex: ["module_info", "name"],
    ellipsis: true,
  },
  {
    title: "关联测试序列",
    key: "tc_seq_name",
    dataIndex: "tc_seq_name",
    ellipsis: true,
    span: 3,
  },
  {
    title: "前置条件",
    key: "precondition",
    dataIndex: "precondition",
    ellipsis: true,
    span: 3,
  },
  {
    title: "步骤描述",
    key: "step_desc",
    dataIndex: "step_desc",
    ellipsis: true,
    span: 3,
  },
  {
    title: "预期结果",
    key: "except_result",
    dataIndex: "except_result",
    ellipsis: true,
    span: 3,
  },
  {
    title: "备注",
    key: "comment",
    dataIndex: "comment",
    ellipsis: true,
    span: 3,
  },
];
