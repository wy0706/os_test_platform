import {
  CheckCircleOutlined,
  DeleteOutlined,
  FileAddOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  PageContainer,
  ProTable,
  type ProColumns,
} from "@ant-design/pro-components";
import { history, useParams } from "@umijs/max";
// import {useParams}
import { useSetState } from "ahooks";
import {
  Button,
  Card,
  Dropdown,
  Menu,
  Modal,
  Space,
  Tree,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
import AddTypeModal from "./components/addTypeModal";
import "./index.less";

import AddModelModal from "./components/addModelModal";
interface DeviceConfig {
  deviceType: string;
  deviceModel: string;
  interface: string;
  parameterConfig: string;
  isValid: boolean | string | number;
  id: number;
}

interface ChannelConfig {
  deviceModel: string;
  channelNumber: string;
  assignedSequenceNumber: string;
  id: number;
}

interface TreeNode {
  title: string;
  key: string;
  children?: TreeNode[];
  level?: number;
}

const PeripheralImport: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [deviceConfigData, setDeviceConfigData] = useState<DeviceConfig[]>([]);
  const [channelConfigData, setChannelConfigData] = useState<ChannelConfig[]>(
    []
  );

  const [state, setState] = useSetState<any>({
    isTypeModalOpen: false,
    isModelModalOpen: false,
    oneModelNode: null, //右键种类添加型号的当前种类节点
  });
  const params = useParams();
  const { isTypeModalOpen, isModelModalOpen, oneModelNode } = state;
  useEffect(() => {
    if (params.id && params.id !== "add") {
      const data = [
        {
          title: "Instrument",
          key: "instrument",
          level: 1,
          children: [
            {
              title: "AC SOURCE",
              key: "ac-source",
              level: 2,
              children: [
                {
                  title: "Chroma 61600 Series",
                  key: "chroma-61600",
                  level: 3,
                },
              ],
            },
            {
              title: "CAN",
              key: "can",
              level: 2,
            },
          ],
        },
      ];
      setTreeData(data);
      // 设置默认展开所有节点
      setExpandedKeys(getAllKeys(data));
    } else {
      const data = [
        {
          title: "Instrument",
          key: "instrument",
          level: 1,
        },
      ];
      setTreeData(data);
      // 设置默认展开根节点
      setExpandedKeys(["instrument"]);
    }
  }, []);
  // 树结构数据
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  // 展开的节点keys
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  // 设备配置表格列定义
  const deviceConfigColumns: ProColumns<DeviceConfig>[] = [
    {
      title: "设备种类",
      dataIndex: "deviceType",
      key: "deviceType",
      width: 120,
    },
    {
      title: "设备型号",
      dataIndex: "deviceModel",
      key: "deviceModel",
      width: 150,
    },
    {
      title: "接口",
      dataIndex: "interface",
      key: "interface",
      width: 100,
    },
    {
      title: "参数配置",
      dataIndex: "parameterConfig",
      key: "parameterConfig",
      width: 120,
    },
    {
      title: "是否有效",
      dataIndex: "isValid",
      key: "isValid",
      width: 100,
      render: (_, record) => (record.isValid ? "✓" : "✗"),
    },
  ];

  // 通道配置表格列定义
  const channelConfigColumns: ProColumns<ChannelConfig>[] = [
    {
      title: "设备型号",
      dataIndex: "deviceModel",

      width: 150,
    },
    {
      title: "通道号",
      dataIndex: "channelNumber",
      width: 100,
    },
    {
      title: "指定序号",
      dataIndex: "assignedSequenceNumber",
      width: 120,
    },
  ];
  // 树节点选择处理
  const onSelect = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length > 0) {
      setSelectedDevice(selectedKeys[0] as string);
    }
    // 选中请求table数据
    const data1 = [
      {
        deviceModel: "RS2328",
        channelNumber: "1",
        assignedSequenceNumber: "1",
        id: 1,
      },
    ];
    const data2 = [
      {
        deviceType: "CAN",
        deviceModel: "VECTOR",
        interface: "CAN",
        parameterConfig: "81,22,1",
        isValid: 1,
        id: 1,
      },
      {
        deviceType: "RS232 Device",
        deviceModel: "RS2328",
        interface: "RS232",
        parameterConfig: "1,115200,1",
        isValid: 0,
        id: 2,
      },
    ];
    setDeviceConfigData(data2);
    setChannelConfigData(data1);
  };

  // 树节点展开/收起处理
  const onExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys);
  };

  // 根据节点层级获取右键菜单
  const getContextMenu = (node: TreeNode) => {
    const level = node.level || 1;
    switch (level) {
      case 1: // Instrument 级别
        return (
          <Menu
            items={[
              {
                key: "addType",
                icon: <PlusOutlined />,
                label: "添加种类",
                onClick: () => {
                  setState({ isTypeModalOpen: true });
                },
              },
              {
                key: "deleteAll",
                icon: <DeleteOutlined />,
                label: "删除全部",
                onClick: () => handleDeleteAll(),
              },
            ]}
          />
        );
      case 2: // AC SOURCE 级别
        return (
          <Menu
            items={[
              {
                key: "addModel",
                icon: <PlusOutlined />,
                label: "添加型号",
                onClick: () => handleAddModel(node),
              },
              {
                key: "deleteType",
                icon: <DeleteOutlined />,
                label: "删除种类",
                onClick: () => handleDeleteType(node),
              },
            ]}
          />
        );
      case 3: // Chroma 61600 Series 级别
        return (
          <Menu
            items={[
              {
                key: "deleteModel",
                icon: <DeleteOutlined />,
                label: "删除型号",
                onClick: () => handleDeleteModel(node),
              },
            ]}
          />
        );
      default:
        return null;
    }
  };

  // 递归查找节点
  const findNode = (nodes: TreeNode[], key: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.key === key) {
        return node;
      }
      if (node.children) {
        const found = findNode(node.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  // 递归删除节点
  const deleteNode = (nodes: TreeNode[], key: string): TreeNode[] => {
    return nodes.filter((node) => {
      if (node.key === key) {
        return false;
      }
      if (node.children) {
        node.children = deleteNode(node.children, key);
      }
      return true;
    });
  };

  // 递归获取所有节点的key
  const getAllKeys = (nodes: TreeNode[]): React.Key[] => {
    const keys: React.Key[] = [];
    const traverse = (nodeList: TreeNode[]) => {
      nodeList.forEach((node) => {
        keys.push(node.key);
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(nodes);
    return keys;
  };

  // 递归添加节点
  const addNode = (
    nodes: TreeNode[],
    parentKey: string,
    newNode: TreeNode
  ): TreeNode[] => {
    return nodes.map((node) => {
      if (node.key === parentKey) {
        return {
          ...node,
          children: [...(node.children || []), newNode],
        };
      }
      if (node.children) {
        return {
          ...node,
          children: addNode(node.children, parentKey, newNode),
        };
      }
      return node;
    });
  };

  // 操作按钮处理
  const handleAdd = () => {
    // 检查 Instrument 下是否有 children
    const instrumentNode = treeData.find((node) => node.key === "instrument");
    const hasChildren =
      instrumentNode?.children && instrumentNode.children.length > 0;

    if (hasChildren) {
      // 如果有子节点，提示是否需要保存
      Modal.confirm({
        title: "当前文件有未保存的内容，是否需要保存？",
        onOk: () => {
          // 保存后清空数据，显示默认界面
          setTreeData([
            {
              title: "Instrument",
              key: "instrument",
              level: 1,
              children: [],
            },
          ]);
          setDeviceConfigData([]);
          setChannelConfigData([]);
          setSelectedDevice("");
          // 重置展开状态，只展开根节点
          setExpandedKeys(["instrument"]);
          message.success("已保存并创建新文件");
        },
        onCancel: () => {
          // 不保存，不做任何操作
        },
      });
      return;
    } else {
      // 如果没有子节点，直接创建新文件
      setTreeData([
        {
          title: "Instrument",
          key: "instrument",
          level: 1,
          children: [],
        },
      ]);
      setDeviceConfigData([]);
      setChannelConfigData([]);
      setSelectedDevice("");
      // 重置展开状态，只展开根节点
      setExpandedKeys(["instrument"]);
      message.success("已创建新文件");
    }
  };

  const handleImport = () => {
    // message.info("导入功能");
  };

  const handleExport = () => {
    // message.info("导出功能");
  };

  // 添加种类
  const handleAddTypeSuccess = (values: any) => {
    console.log(values);
    const newNode: TreeNode = {
      title: values.name,
      key: `type-${Date.now()}`,
      level: 2,
    };
    setTreeData((prevData) => {
      const newData = addNode(prevData, "instrument", newNode);
      // 更新展开的节点，确保新添加的节点和其父节点都展开
      setExpandedKeys((prevKeys) => [...prevKeys, newNode.key, "instrument"]);
      return newData;
    });
    message.success("设备种类添加成功");
    setState({
      isTypeModalOpen: false,
    });
  };

  const handleDeleteAll = () => {
    Modal.confirm({
      title: (
        <div>
          <div>
            确定要删除{" "}
            <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
              所有设备种类
            </span>{" "}
            吗？
          </div>
        </div>
      ),
      onOk: () => {
        setTreeData((prevData) =>
          prevData.map((node) => ({
            ...node,
            children: [],
          }))
        );
        // 删除所有子节点后，只保留根节点展开
        setExpandedKeys(["instrument"]);
        message.success("已删除所有设备种类");
      },
    });
  };
  const handleGoBack = () => {
    // 检查 Instrument 下是否有 children
    const instrumentNode = treeData.find((node) => node.key === "instrument");
    const hasChildren =
      instrumentNode?.children && instrumentNode.children.length > 0;

    if (hasChildren) {
      // 如果有子节点，提示是否需要保存
      Modal.confirm({
        title: "当前文件有未保存的内容，是否需要保存？",
        // content: "当前文件有未保存的内容，是否需要保存？",
        // okText: "保存",
        // cancelText: "不保存",
        onOk: () => {
          // 保存后清空数据，显示默认界面
          setTreeData([
            {
              title: "Instrument",
              key: "instrument",
              level: 1,
              children: [],
            },
          ]);
          setDeviceConfigData([]);
          setChannelConfigData([]);
          setSelectedDevice("");
          // 重置展开状态，只展开根节点
          setExpandedKeys(["instrument"]);
          message.success("已保存文件");
          history.back();
        },
        onCancel: () => {
          history.back();
        },
      });
      return;
    } else {
      // 如果没有子节点，直接创建新文件
      history.back();
    }
  };
  // 添加型号
  const handleAddModel = (parentNode: TreeNode) => {
    setState({
      oneModelNode: parentNode,
      isModelModalOpen: true,
    });
  };
  // 添加型号成功
  const handleAddModelSuccess = (values: any) => {
    const newNode: TreeNode = {
      title: values.name.label,
      key: `model-${Date.now()}`,
      level: 3,
    };
    setTreeData((prevData) => {
      const newData = addNode(prevData, oneModelNode.key, newNode);
      // 更新展开的节点，确保新添加的节点和其父节点都展开
      setExpandedKeys((prevKeys) => [
        ...prevKeys,
        newNode.key,
        oneModelNode.key,
        "instrument",
      ]);
      return newData;
    });
    message.success("设备型号添加成功");
    setState({
      isModelModalOpen: false,
      oneModelNode: null,
    });
  };

  const handleDeleteType = (node: TreeNode) => {
    Modal.confirm({
      title: (
        <div>
          <div>
            确定要删除设备种类{" "}
            <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
              {node.title}
            </span>{" "}
            吗？
          </div>
        </div>
      ),
      onOk: () => {
        setTreeData((prevData) => deleteNode(prevData, node.key));
        // 删除节点后，从展开列表中移除该节点
        setExpandedKeys((prevKeys) =>
          prevKeys.filter((key) => key !== node.key)
        );
        message.success("设备种类删除成功");
      },
    });
  };

  const handleDeleteModel = (node: TreeNode) => {
    Modal.confirm({
      title: (
        <div>
          <div>
            确定要删除设备型号{" "}
            <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
              {node.title}
            </span>{" "}
            吗？
          </div>
        </div>
      ),
      onOk: () => {
        setTreeData((prevData) => deleteNode(prevData, node.key));
        // 删除节点后，从展开列表中移除该节点
        setExpandedKeys((prevKeys) =>
          prevKeys.filter((key) => key !== node.key)
        );
        message.success("设备型号删除成功");
      },
    });
  };

  return (
    <PageContainer
      header={{
        ghost: true,
        extra: [
          <Button key="1" onClick={handleGoBack}>
            返回
          </Button>,
        ],
      }}
    >
      <div className="peripheral-import-page">
        {/* 操作栏 */}
        <Card className="operation-bar">
          <Space className="operation-buttons">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建
            </Button>
            <Button icon={<FolderOpenOutlined />} onClick={handleImport}>
              打开
            </Button>
            <Button icon={<SaveOutlined />} onClick={handleExport}>
              保存
            </Button>
            <Button icon={<FileAddOutlined />} onClick={handleExport}>
              另存为
            </Button>
            <Button icon={<CheckCircleOutlined />} onClick={handleExport}>
              自检
            </Button>
          </Space>
        </Card>

        {/* 主要内容区域 */}
        <div className="main-content">
          {/* 左侧树结构 */}
          <Card title="Instrument" className="tree-panel">
            <Tree
              treeData={treeData}
              onSelect={onSelect}
              expandedKeys={expandedKeys}
              onExpand={onExpand}
              titleRender={(node) => {
                const menu = getContextMenu(node);
                return (
                  <Dropdown
                    overlay={menu || <Menu />}
                    trigger={["contextMenu"]}
                  >
                    <span style={{ display: "inline-block", width: "100%" }}>
                      {node.title}
                    </span>
                  </Dropdown>
                );
              }}
            />
          </Card>

          {/* 右侧表格区域 */}
          <div className="table-panel">
            {/* 设备配置表格 */}
            <Card className="table-card">
              <ProTable<DeviceConfig>
                columns={deviceConfigColumns}
                dataSource={deviceConfigData}
                pagination={false}
                search={false}
                options={false}
                size="small"
              />
            </Card>

            {/* 通道配置表格 */}
            <Card className="table-card">
              <ProTable<ChannelConfig>
                columns={channelConfigColumns}
                dataSource={channelConfigData}
                pagination={false}
                search={false}
                options={false}
                size="small"
              />
            </Card>
          </div>
        </div>
      </div>

      {/* 添加种类 */}
      <AddTypeModal
        open={isTypeModalOpen}
        onCancel={() => {
          setState({ isTypeModalOpen: false });
        }}
        onOk={handleAddTypeSuccess}
      />
      {/* 添加型号 */}
      <AddModelModal
        open={isModelModalOpen}
        onCancel={() => {
          setState({ isModelModalOpen: false });
        }}
        onOk={handleAddModelSuccess}
      />
    </PageContainer>
  );
};

export default PeripheralImport;
