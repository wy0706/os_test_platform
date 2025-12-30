import { getTpfTree } from "@/services/case-management/test-sequence-process.service";
import { FileTextOutlined, FolderOutlined } from "@ant-design/icons";
import { useSetState } from "ahooks";
import { Empty, message, Spin, Tree } from "antd";
import React, { useEffect } from "react";
import { transformToRightTree } from "../schemas";
import "./index.less";

interface ProjectProps {
  selectedKeys: React.Key[];
  onInsertTreeNode: (
    nodeKey: string,
    nodeTitle: string,
    nodeId: string
  ) => void;
  onSelect: (keys: React.Key[], info: any) => void;
  leftTab: any;
}

const TestProject: React.FC<ProjectProps> = ({
  onInsertTreeNode,
  onSelect,
  leftTab,
  selectedKeys,
}) => {
  const [state, setState] = useSetState<any>({
    TreeDatas: [],
    expandedKeys: [] as React.Key[],
    treeLoading: false,
  });

  const { TreeDatas, expandedKeys, treeLoading } = state;

  const handleTreeDoubleClick = (node: any) => {
    if (!node) return;

    if (node.level !== 3) {
      message.warning("请选择测试项目（第3级节点）进行插入");
      return;
    }

    if (node.children && node.children.length > 0) {
      message.warning("请选择测试项目（叶子节点）进行插入");
      return;
    }

    onInsertTreeNode?.(String(node.key), String(node.title), String(node.ids));
  };

  const getAllTreeKeys = (treeData: any[] = []): string[] => {
    const keys: string[] = [];
    const traverse = (nodes: any[]) => {
      nodes.forEach((node) => {
        keys.push(String(node.key));
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(treeData);
    return keys;
  };

  const addIconsToTreeData = (treeData: any[] = []): any[] => {
    if (!Array.isArray(treeData)) return [];
    return treeData.map((node) => {
      const newNode = { ...node };
      if (node.children && node.children.length > 0) {
        newNode.icon = <FolderOutlined />;
        newNode.children = addIconsToTreeData(node.children);
      } else {
        newNode.icon = <FileTextOutlined />;
      }
      return newNode;
    });
  };

  const getTreeData = async (type: string) => {
    try {
      setState({ treeLoading: true });

      const resp = await getTpfTree({ TST: type });
      if (resp?.code === 0) {
        const safeData = Array.isArray(resp.data) ? resp.data : [];
        const newData = transformToRightTree(safeData);

        const dataWithIcons = addIconsToTreeData(newData);
        const allKeys = getAllTreeKeys(dataWithIcons);

        setState({
          TreeDatas: dataWithIcons,
          expandedKeys: allKeys,
        });
      } else {
        setState({
          TreeDatas: [],
          expandedKeys: [],
        });
      }
    } catch (e) {
      setState({
        TreeDatas: [],
        expandedKeys: [],
      });
    } finally {
      setState({ treeLoading: false });
    }
  };

  useEffect(() => {
    setState({
      expandedKeys: [],
      TreeDatas: [],
    });

    if (leftTab) getTreeData(leftTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftTab]);

  const handleSelect = (keys: React.Key[], info: any) => {
    const node = info?.node;
    if (!node) return;

    if (node.level !== 3) {
      onSelect?.([], info);
      return;
    }

    const nextKeys = (keys || []).map((k: any) => String(k));
    onSelect?.(nextKeys, info);
  };

  return (
    <div>
      {treeLoading ? (
        <div style={{ textAlign: "center", padding: "100px" }}>
          <Spin size="large" />
        </div>
      ) : TreeDatas.length === 0 ? (
        <div style={{ textAlign: "center", padding: "100px" }}>
          <Empty />
        </div>
      ) : (
        <Tree
          treeData={TreeDatas}
          expandedKeys={expandedKeys}
          onExpand={(keys) => setState({ expandedKeys: keys })}
          selectedKeys={(selectedKeys || []).map((k: any) => String(k))}
          onSelect={handleSelect}
          onDoubleClick={(_, node: any) => handleTreeDoubleClick(node)}
          showIcon
          className="command-tree"
        />
      )}
    </div>
  );
};

export default TestProject;
