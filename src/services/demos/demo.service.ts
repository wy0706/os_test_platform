import {
  ApiResponse,
  TestItem,
  TestItemQuery,
  TreeNode,
  TreeNodeCreateRequest,
  TreeNodeUpdateRequest,
} from "@/pages/demos/demo/schemas";

// 模拟数据
const mockTreeData: TreeNode[] = [
  {
    id: "1",
    name: "用户类",
    type: "folder",
    children: [
      { id: "1-1", name: "测试序列种类1", type: "item", parentId: "1" },
      { id: "1-2", name: "测试序列种类2", type: "item", parentId: "1" },
    ],
  },
  {
    id: "2",
    name: "系统类",
    type: "folder",
    children: [
      { id: "2-1", name: "测试序列种类1", type: "item", parentId: "2" },
      { id: "2-2", name: "测试序列种类2", type: "item", parentId: "2" },
      { id: "2-3", name: "测试序列种类3", type: "item", parentId: "2" },
    ],
  },
];

const mockTestData: TestItem[] = [
  {
    id: "1",
    name: "订单成功提交",
    type: "Pre测试",
    status: "success",
    categoryId: "1-1",
  },
  {
    id: "2",
    name: "购物车支持修改商品数量",
    type: "UUT测试",
    status: "success",
    categoryId: "1-1",
  },
  {
    id: "3",
    name: "购物车支持删除商品",
    type: "UUT测试",
    status: "success",
    categoryId: "1-1",
  },
  {
    id: "4",
    name: "购物车支持清空",
    type: "Post测试",
    status: "error",
    categoryId: "1-1",
  },
  {
    id: "5",
    name: "购物车支持批量操作",
    type: "UUT测试",
    status: "success",
    categoryId: "1-1",
  },
  {
    id: "6",
    name: "切换商品分类",
    type: "Post测试",
    status: "success",
    categoryId: "2-1",
  },
  {
    id: "7",
    name: "商品搜索功能",
    type: "UUT测试",
    status: "error",
    categoryId: "2-1",
  },
  {
    id: "8",
    name: "商品详情展示",
    type: "Pre测试",
    status: "success",
    categoryId: "2-1",
  },
  {
    id: "9",
    name: "商品列表展示",
    type: "Post测试",
    status: "success",
    categoryId: "2-1",
  },
  {
    id: "10",
    name: "登录时记住用户名",
    type: "UUT测试",
    status: "error",
    categoryId: "2-2",
  },
];

// 模拟网络延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 递归查找节点
const findNodeById = (nodes: TreeNode[], id: string): TreeNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

// 递归更新树数据
const updateTreeData = (
  nodes: TreeNode[],
  targetId: string,
  updates: Partial<TreeNode>
): TreeNode[] => {
  return nodes.map((node) => {
    if (node.id === targetId) {
      return { ...node, ...updates };
    }
    if (node.children) {
      return {
        ...node,
        children: updateTreeData(node.children, targetId, updates),
      };
    }
    return node;
  });
};

// 递归添加子节点
const addChildNode = (
  nodes: TreeNode[],
  parentId: string,
  newNode: TreeNode
): TreeNode[] => {
  return nodes.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...(node.children || []), newNode],
      };
    }
    if (node.children) {
      return {
        ...node,
        children: addChildNode(node.children, parentId, newNode),
      };
    }
    return node;
  });
};

// 递归删除节点
const deleteNode = (nodes: TreeNode[], targetId: string): TreeNode[] => {
  return nodes.filter((node) => {
    if (node.id === targetId) return false;
    if (node.children) {
      node.children = deleteNode(node.children, targetId);
    }
    return true;
  });
};

// 存储当前数据（模拟数据库）
let currentTreeData = [...mockTreeData];
let currentTestData = [...mockTestData];

// API 服务
export class DemoService {
  // 获取树结构数据
  static async getTreeData(): Promise<ApiResponse<TreeNode[]>> {
    await delay(300);
    return {
      code: 200,
      message: "获取成功",
      data: JSON.parse(JSON.stringify(currentTreeData)),
    };
  }

  // 创建树节点
  static async createTreeNode(
    request: TreeNodeCreateRequest
  ): Promise<ApiResponse<TreeNode>> {
    await delay(500);

    const newId = request.parentId
      ? `${request.parentId}-${Date.now()}`
      : `${Date.now()}`;
    const newNode: TreeNode = {
      id: newId,
      name: request.name,
      type: request.type,
      parentId: request.parentId,
      children: request.type === "folder" ? [] : undefined,
    };

    if (request.parentId) {
      currentTreeData = addChildNode(
        currentTreeData,
        request.parentId,
        newNode
      );
    } else {
      currentTreeData.push(newNode);
    }

    return {
      code: 200,
      message: "创建成功",
      data: newNode,
    };
  }

  // 更新树节点
  static async updateTreeNode(
    request: TreeNodeUpdateRequest
  ): Promise<ApiResponse<TreeNode>> {
    await delay(300);

    const node = findNodeById(currentTreeData, request.id);
    if (!node) {
      return {
        code: 404,
        message: "节点不存在",
        data: null,
      };
    }

    currentTreeData = updateTreeData(currentTreeData, request.id, {
      name: request.name,
    });
    const updatedNode = findNodeById(currentTreeData, request.id);

    return {
      code: 200,
      message: "更新成功",
      data: updatedNode!,
    };
  }

  // 删除树节点
  static async deleteTreeNode(id: string): Promise<ApiResponse<void>> {
    await delay(300);

    const node = findNodeById(currentTreeData, id);
    if (!node) {
      return {
        code: 404,
        message: "节点不存在",
        data: undefined,
      };
    }

    currentTreeData = deleteNode(currentTreeData, id);

    // 同时删除相关的测试数据
    currentTestData = currentTestData.filter((item) => item.categoryId !== id);

    return {
      code: 200,
      message: "删除成功",
      data: undefined,
    };
  }

  // 获取测试数据
  static async getTestData(
    query: TestItemQuery = {}
  ): Promise<ApiResponse<{ list: TestItem[]; total: number }>> {
    await delay(400);

    let filtered = [...currentTestData];

    // 根据分类过滤
    if (query.categoryId) {
      filtered = filtered.filter(
        (item) => item.categoryId === query.categoryId
      );
    }

    // 根据搜索文本过滤
    if (query.searchText) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(query.searchText!.toLowerCase())
      );
    }

    // 根据类型过滤
    if (query.type) {
      filtered = filtered.filter((item) => item.type === query.type);
    }

    // 分页
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const list = filtered.slice(start, end);

    return {
      code: 200,
      message: "获取成功",
      data: {
        list,
        total: filtered.length,
      },
    };
  }

  // 创建测试数据
  static async createTestItem(
    item: Omit<TestItem, "id">
  ): Promise<ApiResponse<TestItem>> {
    await delay(300);

    const newItem: TestItem = {
      ...item,
      id: `test-${Date.now()}`,
    };

    currentTestData.push(newItem);

    return {
      code: 200,
      message: "创建成功",
      data: newItem,
    };
  }

  // 更新测试数据
  static async updateTestItem(item: TestItem): Promise<ApiResponse<TestItem>> {
    await delay(300);

    const index = currentTestData.findIndex((data) => data.id === item.id);
    if (index === -1) {
      return {
        code: 404,
        message: "测试项不存在",
        data: null,
      };
    }

    currentTestData[index] = item;

    return {
      code: 200,
      message: "更新成功",
      data: item,
    };
  }

  // 删除测试数据
  static async deleteTestItem(id: string): Promise<ApiResponse<void>> {
    await delay(300);

    const index = currentTestData.findIndex((item) => item.id === id);
    if (index === -1) {
      return {
        code: 404,
        message: "测试项不存在",
        data: undefined,
      };
    }

    currentTestData.splice(index, 1);

    return {
      code: 200,
      message: "删除成功",
      data: undefined,
    };
  }
}
