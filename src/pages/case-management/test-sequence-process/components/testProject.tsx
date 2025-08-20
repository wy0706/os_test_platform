import { FileTextOutlined, FolderOutlined } from "@ant-design/icons";
import { useSetState } from "ahooks";
import { message, Tree } from "antd";
import React, { useEffect } from "react";
import "./index.less";
interface ProjectProps {
  data: any[];
  onInsertTreeNode: (nodeKey: string, nodeTitle: string) => void;
  onSelect: (keys: React.Key[], info: any) => void;
}
const TestProject: React.FC<ProjectProps> = ({
  data,
  onInsertTreeNode,
  onSelect,
}) => {
  const [state, setState] = useSetState<any>({
    TreeDatas: data || [],
    selectedTreeKeys: [],
    selectedCommand: "",
    expandedKeys: [],
  });
  const { TreeDatas, expandedKeys, selectedCommand, selectedTreeKeys } = state;

  // 处理树节点双击事件，在选中行下方插入新行
  const handleTreeDoubleClick = (keys: any[], info: any) => {
    if (keys.length === 0) return;
    const clickedNodeKey = keys[0];
    const clickedNode = info.node;
    // 检查是否为父节点（有子节点），父节点不允许双击插入
    if (clickedNode.children && clickedNode.children.length > 0) {
      // "${clickedNode.title}" 是父级节点，
      message.warning(`请选择测试项目进行插入`);
      return;
    }
    onInsertTreeNode && onInsertTreeNode(clickedNodeKey, clickedNode.title);
    // 调用通用插入函数
    // insertTreeNode(clickedNodeKey, clickedNode.title);
  };

  useEffect(() => {
    const safeData = Array.isArray(data) ? data : [];
    // 为mockTreeData添加图标
    const dataWithIcons = addIconsToTreeData(safeData);
    // 默认展开所有节点
    const allKeys = getAllTreeKeys(dataWithIcons);
    setState({
      TreeDatas: dataWithIcons,
      expandedKeys: allKeys,
    });
  }, [data]);

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
      {" "}
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
    </div>
  );
};

export default TestProject;
