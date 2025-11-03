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

export const testInfoDescriptions: any = [
  {
    title: "测试程序",
    dataIndex: "testprogram",
    ellipsis: true,
    copyable: true,
  },
  {
    title: "编程人员",
    dataIndex: "user",
    ellipsis: true,
  },
  {
    title: "编程日期",
    dataIndex: "editdate",
    ellipsis: true,
  },
  {
    title: "编程时间",
    dataIndex: "edittime",
    ellipsis: true,
  },
  {
    title: "设备配置",
    dataIndex: "configname",
    ellipsis: true,
  },
  {
    title: "报表格式",
    dataIndex: "rptformat",
    ellipsis: true,
  },

  {
    title: "产品类型",
    dataIndex: "mode",
    ellipsis: true,
  },
  {
    title: "产品序列号",
    dataIndex: "SN",
    ellipsis: true,
  },
  {
    title: "测试开始时间",
    dataIndex: "TestStartTime",
    ellipsis: true,
  },
];
/**
 * 将后端返回的数据格式化为 Antd Table 树形结构
 * @param list 原始数据数组
 * @returns 格式化后的树形数据
 */
export function formatTableTreeData(list: any[] = []) {
  if (!Array.isArray(list) || list.length === 0) return [];

  return list.map((item) => {
    const { id, Rownumber, Sequence_name, active, iteminfo = [] } = item || {};

    return {
      key: id ?? Math.random(), // 防止 id 为空时报错
      id,
      rownumber: Rownumber,
      sequence_name: Sequence_name || "-",
      active: String(active ?? "-"),
      breakpoint: false,
      // 子节点映射
      children:
        Array.isArray(iteminfo) && iteminfo.length > 0
          ? iteminfo.map((info, idx) => ({
              key: `${id || "row"}-${idx}`,
              command: info?.command ?? "-",
              InPara: info?.InPara ?? "-",
              OutPara: info?.OutPara ?? "-",
              Qualified: info?.Qualified ?? "_",
              breakpoint: false,
              isLeaf: true,
            }))
          : undefined, // 空数组就不生成 children
    };
  });
}
