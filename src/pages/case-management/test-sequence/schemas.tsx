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
  {
    title: "名称",
    dataIndex: "sequence_name",
    ellipsis: true,
  },
  {
    title: "类型",
    dataIndex: "TST",
    ellipsis: true,
    valueType: "select",
    fieldProps: {
      options: [
        { label: "Pre", value: "Pre" },
        { label: "UUT", value: "UUT" },
        { label: "Post", value: "Post" },
      ],
    },
  },
  {
    title: "关联测试用例",
    dataIndex: "tc_title",
    ellipsis: true,
    render: (_: any, record: any) => {
      const list = record.tc_title;
      if (Array.isArray(list) && list.length > 0) {
        return list.map((item) => item.title).join("、");
      }
      return null;
    },
  },
  {
    title: "是否发布",
    dataIndex: "is_published",
    width: 100,
    valueType: "select",
    valueEnum: {
      True: {
        text: "✓",
        status: "Success",
      },
      False: {
        text: "✗",
        status: "Error",
      },
    },
  },
];
export type TreeNode =
  | {
      id: string;
      name: string;
      type: "folder";
      children: TreeNode[];
      rawKey?: string | number; // ← 保留后端 key
      expanded?: boolean;
    }
  | {
      id: string;
      name: string;
      type: "item";
      parentId: string;
      rawKey?: string | number; // ← 保留后端 key
      expanded?: boolean;
    };

type SourceNode = {
  title?: string;
  key?: string | number;
  level?: number;
  children?: Array<{ title?: string; key?: string | number; level?: number }>;
};

function toStrId(v: string | number | undefined, fallback: string): string {
  return v == null ? fallback : String(v);
}

/**
 * 将后端返回的树数据转换为 mockTreeData 结构（名称原样保留，且把后端 key 存到 rawKey）
 */
export function transformToMockTreeData(
  data: SourceNode[] | null | undefined
): TreeNode[] {
  const src = Array.isArray(data) ? data : [];
  if (src.length === 0) return [];

  return src.map((folder, folderIdx) => {
    const folderId = toStrId(folder?.key, String(folderIdx + 1));
    const folderName = folder?.title || `分组${folderIdx + 1}`;

    const childrenArr = Array.isArray(folder?.children) ? folder.children! : [];
    const children: TreeNode[] = childrenArr.map((child, childIdx) => {
      const subIdSuffix =
        child?.key != null ? String(child.key) : String(childIdx + 1);
      const childId = `${folderId}-${subIdSuffix}`;
      const childName = child?.title || `子项${childIdx + 1}`;

      return {
        id: childId,
        name: childName,
        type: "item",
        parentId: folderId,
        rawKey: child?.key, // ← 放入新数据
      };
    });

    return {
      id: folderId,
      name: folderName,
      type: "folder",
      children,
      rawKey: folder?.key, // ← 放入新数据
    };
  });
}
