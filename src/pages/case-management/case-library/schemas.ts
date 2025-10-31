export const schemasTitle: any = {
  label: "用例执行",
  value: "caseLibrary",
};

export const schemasColumns: any = [
  {
    title: "文件名",
    dataIndex: "execution_file",
    ellipsis: true,
    // sorter: true,
  },
  {
    title: "是否发布",
    dataIndex: "is_published",
    ellipsis: true,
    valueType: "select",
    valueEnum: {
      1: {
        text: "✓",
        status: "Success",
      },
      0: {
        text: "✗",
        status: "Error",
      },
    },
  },
  {
    title: "创建时间",
    dataIndex: "time",
    ellipsis: true,
    sorter: true,
    hideInSearch: true,
  },
];
