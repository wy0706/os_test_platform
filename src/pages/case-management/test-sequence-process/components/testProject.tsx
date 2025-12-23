import { getTpfTree } from "@/services/case-management/test-sequence-process.service";
import { FileTextOutlined, FolderOutlined } from "@ant-design/icons";
import { useSetState } from "ahooks";
import { Empty, message, Spin, Tree } from "antd";
import React, { useEffect } from "react";
import { transformToRightTree } from "../schemas";
import "./index.less";
interface ProjectProps {
  data: any[];
  onInsertTreeNode: (nodeKey: string, nodeTitle: string) => void;
  onSelect: (keys: React.Key[], info: any) => void;
  leftTab: any;
}
const TestProject: React.FC<ProjectProps> = ({
  data,
  onInsertTreeNode,
  onSelect,
  leftTab,
}) => {
  const [state, setState] = useSetState<any>({
    TreeDatas: [],
    selectedTreeKeys: [],
    selectedCommand: "",
    expandedKeys: [],
    treeLoading: false,
  });
  const {
    TreeDatas,
    expandedKeys,
    selectedCommand,
    selectedTreeKeys,
    treeLoading,
  } = state;

  const handleTreeDoubleClick = (keys: any[], info: any) => {
    if (!keys || keys.length === 0) return;
    const clickedNodeKey = keys[0];
    const clickedNode = info?.node;

    //只有 level=3 才允许插入
    if (clickedNode?.level !== 3) {
      message.warning("请选择测试项目进行插入");
      return;
    }

    //  必须是叶子节点（防止后端数据异常）
    if (clickedNode?.children && clickedNode.children.length > 0) {
      message.warning("请选择测试项目进行插入");
      return;
    }
    onInsertTreeNode?.(clickedNodeKey, clickedNode.title);
  };

  const getTreeData = async (type: string) => {
    try {
      setState({ treeLoading: true });
      const { code, data } = await getTpfTree({ TST: type });
      if (code === 0) {
        const safeData = Array.isArray(data) ? data : [];
        let newData = transformToRightTree(safeData);
        // 为mockTreeData添加图标
        const dataWithIcons = addIconsToTreeData(newData);
        console.log("dataWithIcons", dataWithIcons);

        // 默认展开所有节点
        const allKeys = getAllTreeKeys(dataWithIcons);
        setState({
          TreeDatas: dataWithIcons,
          expandedKeys: allKeys,
        });
      } else {
        setState({
          TreeDatas: [],
        });
      }
    } catch (e) {
      setState({
        TreeDatas: [],
      });
    } finally {
      setState({ treeLoading: false });
    }
  };
  useEffect(() => {
    setState({
      selectedTreeKeys: [],
      selectedCommand: "",
      expandedKeys: [],
      TreeDatas: [],
    });
    if (leftTab) {
      getTreeData(leftTab);
    }
  }, [leftTab]);
  // 获取所有树节点的keys用于默认展开
  const getAllTreeKeys = (treeData: any[] = []): string[] => {
    const keys: string[] = [];
    const traverse = (nodes: any[]) => {
      nodes.forEach((node) => {
        keys.push(node.key);
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(treeData);
    return keys;
  };
  // 动态为树形数据添加图标的函数
  const addIconsToTreeData = (treeData: any[] = []): any[] => {
    if (!Array.isArray(treeData)) return [];
    return treeData.map((node) => {
      const newNode = { ...node };
      // 根据是否有children来决定图标类型
      if (node.children && node.children.length > 0) {
        // 有子节点的是文件夹图标
        newNode.icon = <FolderOutlined />;
        // 递归处理子节点
        newNode.children = addIconsToTreeData(node.children);
      } else {
        // 没有子节点的是文档图标
        newNode.icon = <FileTextOutlined />;
      }

      return newNode;
    });
  };
  const handleSelect = (keys: React.Key[], info: any) => {
    const node = info.node;

    if (node.children && node.children.length > 0) {
      // 父节点
      // message.warning("请选择项目名称");
      return;
    }
    // 子节点才执行选中逻辑
    setState({
      selectedTreeKeys: keys as string[],
      selectedCommand: keys[0] as string,
    });
    onSelect && onSelect(keys, info);
  };
  return (
    <div>
      {treeLoading ? (
        <div style={{ textAlign: "center", padding: "100px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {TreeDatas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "100px" }}>
              <Empty />
            </div>
          ) : (
            <Tree
              treeData={TreeDatas}
              expandedKeys={expandedKeys}
              onExpand={(keys) => {
                setState({ expandedKeys: keys as string[] });
              }}
              selectedKeys={selectedTreeKeys}
              onSelect={handleSelect}
              onDoubleClick={(e, node) => {
                handleTreeDoubleClick([node.key], { node });
              }}
              showIcon={true}
              className="command-tree"
            />
          )}
        </>
      )}
    </div>
  );
};

export default TestProject;
