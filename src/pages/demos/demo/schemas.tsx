export interface TreeNode {
  id: string;
  name: string;
  type: "folder" | "item";
  parentId?: string;
  children?: TreeNode[];
}

export interface TestItem {
  id: string;
  name: string;
  type: string;
  status: "success" | "error";
  categoryId: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface TreeNodeCreateRequest {
  name: string;
  type: "folder" | "item";
  parentId?: string;
}

export interface TreeNodeUpdateRequest {
  id: string;
  name: string;
}

export interface TestItemQuery {
  categoryId?: string;
  searchText?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}
export const schemasTitle: any = {
  label: "示例测试库",
  value: "testCaseExample",
};
export const schemasColumns: any = [
  // {
  //   title: "编号",
  //   dataIndex: "index",
  //   search: false,
  //   key: "index",
  //   // sorter: true,
  // },
  {
    title: "名称",
    dataIndex: "name",
    // sorter: true,
    ellipsis: true,
  },
  {
    title: "类型",
    dataIndex: "type",
    ellipsis: true,
    // sorter: true,
    valueType: "select",
    fieldProps: {
      options: [
        { label: "Pre测试", value: 1 },
        { label: "UUT测试", value: 2 },
        { label: "Post测试", value: 3 },
      ],
    },
  },
  {
    title: "是否发布",
    dataIndex: "status",
    key: "status",
    width: 100,
    sorter: true,
    // search: false,
    valueType: "select",
    valueEnum: {
      success: {
        text: "✓",
        status: "Success",
      },
      error: {
        text: "✗",
        status: "Error",
      },
    },

    fieldProps: {
      options: [
        { label: "是", value: "success" },
        { label: "否", value: "error" },
      ],
    },
    // render: (_, record) => (
    //   <span className={`status-badge ${record.status}`}>
    //     {record.status === "success" ? "✓" : "✗"}
    //   </span>
    // ),
  },
];
