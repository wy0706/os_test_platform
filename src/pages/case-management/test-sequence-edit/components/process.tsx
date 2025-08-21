import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  FolderOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Card, Modal, Tree, Typography, message } from "antd";
import React, { useEffect } from "react";
import { mockTreeData } from "../schemas";
import "./index.less";
import ParamForm from "./paramForm";
import ProcessModal from "./processModal";
const { Title, Text } = Typography;
// 模拟参数解释数据
const mockParamExplanation = {
  1: {
    title: "输入参数: 1个参数",
    params: [
      {
        name: "Parameter: sendcom_0",
        type: "字符串终止符",
        dataType: "string",
        description: "设置232字符串终止符参数",
      },
    ],
    outputParams: "输出参数: 1个参数",
  },
  2: {
    title: "输入参数: 2个参数",
    params: [
      {
        name: "Parameter: Port_Index",
        type: "端口索引",
        dataType: "integer",
        description: "串口端口号",
      },
      {
        name: "Parameter: sendcom",
        type: "发送命令",
        dataType: "string",
        description: "发送的字符串格式",
      },
    ],
    outputParams: "输出参数: 1个参数",
  },
  3: {
    title: "输入参数: 2个参数",
    params: [
      {
        name: "Parameter: Port_Index",
        type: "端口索引",
        dataType: "integer",
        description: "串口端口号 (值: 1)",
      },
      {
        name: "Parameter: Timeout",
        type: "超时时间",
        dataType: "integer",
        description: "响应超时时间 (值: 10000)",
      },
    ],
    outputParams: "输出参数: 1个参数",
  },
  4: {
    title: "输入参数: 2个参数",
    params: [
      {
        name: "Parameter: ESR_Acw_Index",
        type: "绝缘阻抗类别",
        dataType: "integer",
        description: "ESR ACW索引参数",
      },
      {
        name: "Parameter: ESR_Test_Items",
        type: "安规测试项目",
        dataType: "Float[]",
        description: "测试项目数组",
      },
    ],
    outputParams: "输出参数: 1个参数",
  },
  5: {
    title: "输入参数: 2个参数",
    params: [
      {
        name: "Parameter: Index",
        type: "数据索引",
        dataType: "integer",
        description: "数据读取起始索引",
      },
      {
        name: "Parameter: Count",
        type: "数据数量",
        dataType: "integer",
        description: "读取数据的数量",
      },
    ],
    outputParams: "输出参数: 1个参数",
  },
};
const mockFormData = [
  {
    id: "1",
    name: "stepCon2", //名称
    unit: "", //单位
    dataType: "字符串终止符 (string)",
    type: "",
    conditionType: 1, //输入参数还是输出参数 1，表示输入 2表示输出
    description: "设置232字符串终止符参数",
  },

  {
    id: "3",
    name: "sendString",
    unit: "",
    dataType: "结果参数 (integer)",
    type: "",
    conditionType: 1,
    description: "设置232字符串终止符参数",
  },
  {
    id: "2",
    name: "0",
    unit: "",
    conditionType: 2,
    description: "设置232字符串终止符参数",
    dataType: "结果参数 (integer)",
    type: "",
  },
];
interface ProcessProps {
  data: any[]; //table数据
  onChange?: (data: any, selectedRowIndex: number) => void;
  selectedRowIndex?: any;
}

// 动态为树形数据添加图标的函数
const addIconsToTreeData = (treeData: any[]): any[] => {
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

const Process: React.FC<ProcessProps> = ({
  data,
  selectedRowIndex,
  onChange,
}) => {
  const [state, setState] = useSetState<any>({
    isProcessModalOpen: false,
    isparamShow: false,
    updateValue: {},
    selectedTreeKeys: [], //选中的树节点
    selectedCommand: "", //当前选中的命令
    processedTreeData: [],
    expandedKeys: [],
    selectedRowData: [],
    selectType: "COMMAND", //默认展示测试命令 COMMAND | INPUT |OUT
    paramType: "", // 参数表单数据
  });
  const {
    isProcessModalOpen,
    updateValue,
    isparamShow,
    selectedTreeKeys,
    selectedCommand,
    processedTreeData,
    expandedKeys,
    selectedRowData,
    selectType,
    paramType,
  } = state;
  // const [selectType, setType] = useState("COMMAND");
  // const [paramType, setParamType] = useState<any>("");
  // 获取所有树节点的keys用于默认展开
  const getAllTreeKeys = (treeData: any[]): string[] => {
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

  // 在树形结构中查找命令并获取其路径
  const findCommandInTree = (
    command: string,
    treeData: any[],
    path: string[] = []
  ): string[] | null => {
    for (const node of treeData) {
      const currentPath = [...path, node.key];

      // 如果当前节点的title匹配命令
      if (node.title === command || node.key === command) {
        return currentPath;
      }

      // 如果有子节点，递归查找
      if (node.children && node.children.length > 0) {
        const result = findCommandInTree(command, node.children, currentPath);
        if (result) {
          return result;
        }
      }
    }
    return null;
  };

  // 处理点击测试命令
  const handleCommandClick = (command: string) => {
    setState({
      isparamShow: false,
      selectedCommand: command,
      selectType: "COMMAND",
    });

    if (processedTreeData.length > 0) {
      const commandPath = findCommandInTree(command, processedTreeData);
      if (commandPath) {
        // 设置选中的节点

        setState({
          selectedTreeKeys: [command],
        });
        // 确保展开到该命令的路径
        const newExpandedKeys = [
          ...new Set([...expandedKeys, ...commandPath.slice(0, -1)]),
        ];

        setState({
          expandedKeys: newExpandedKeys,
        });
      }
    }
  };

  const syncTreeWithCommand2 = (command?: string) => {
    console.log("conmmand", command);

    if (!command) {
      setState({
        selectedTreeKeys: [],
        selectedCommand: "",
      });
      return;
    }
    const commandPath = findCommandInTree(command, processedTreeData);
    if (commandPath) {
      console.log("1111", command);

      setState({
        selectedTreeKeys: [command],
        expandedKeys: [
          ...new Set([...expandedKeys, ...commandPath.slice(0, -1)]),
        ],
        selectedCommand: command,
      });
    }
  };

  const syncTreeWithCommand = (command?: string) => {
    if (!command) {
      setState({
        selectedTreeKeys: [],
        selectedCommand: "",
      });
      return;
    }

    // 如果树还没初始化好，先存起来，等树 ready 再处理
    if (!processedTreeData || processedTreeData.length === 0) {
      setState({
        selectedCommand: command,
        selectedTreeKeys: [command],
      });
      return;
    }

    const commandPath = findCommandInTree(command, processedTreeData);
    if (commandPath) {
      setState({
        selectedTreeKeys: [command],
        expandedKeys: [
          ...new Set([...expandedKeys, ...commandPath.slice(0, -1)]),
        ],
        selectedCommand: command,
      });
    }
  };
  const moveRow = (index: number, direction: "up" | "down") => {
    const newData = [...data];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newData.length) return;

    [newData[index], newData[targetIndex]] = [
      newData[targetIndex],
      newData[index],
    ];
    newData.forEach((item, i) => (item.sequence = i + 1));

    let newSelected = selectedRowIndex;
    if (selectedRowIndex === index) {
      newSelected = targetIndex;
    } else if (selectedRowIndex === targetIndex) {
      newSelected = index;
    }

    onChange?.(newData, newSelected);
    if (newSelected >= 0) {
      syncTreeWithCommand(newData[newSelected].command);
    }
  };
  // 删除行
  const deleteRow = (index: number) => {
    Modal.confirm({
      title: "确认删除吗？",
      onOk: () => {
        const newData = [...data];
        newData.splice(index, 1);
        newData.forEach((item, newIndex) => {
          item.sequence = newIndex + 1;
        });

        message.success("删除成功");

        // 删除后更新选中行索引
        let newSelected = selectedRowIndex;
        if (newData.length === 0) {
          newSelected = -1;
          setState({ selectedTreeKeys: [], selectedCommand: "" });
        } else if (selectedRowIndex >= newData.length) {
          newSelected = newData.length - 1;
          syncTreeWithCommand(newData[newSelected].command);
        } else {
          syncTreeWithCommand(newData[newSelected].command);
        }

        onChange?.(newData, newSelected);
      },
    });
  };
  useEffect(() => {
    if (
      selectedRowIndex !== undefined &&
      selectedRowIndex >= 0 &&
      data.length > 0
    ) {
      const currentCommand = data[selectedRowIndex]?.command;
      if (currentCommand) {
        syncTreeWithCommand(currentCommand);
      }
    } else {
      setState({
        selectedTreeKeys: [],
        selectedCommand: "",
      });
    }
  }, [data, selectedRowIndex, processedTreeData]);
  // 初始化时处理树形数据并设置默认展开全部
  useEffect(() => {
    // 为mockTreeData添加图标
    const dataWithIcons = addIconsToTreeData(mockTreeData);

    // 默认展开所有节点
    const allKeys = getAllTreeKeys(dataWithIcons);

    setState({
      processedTreeData: dataWithIcons,
      expandedKeys: allKeys,
    });
  }, []);

  // 表格列定义
  const columns: any[] = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
      width: 80,
    },
    {
      title: "激活",
      dataIndex: "status",
      width: 100,
      key: "status",
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
      editable: () => true,
    },
    {
      title: "标签",
      dataIndex: "tag",
      ellipsis: true,
      editable: () => true,
      width: 100,
    },
    {
      title: "测试命令",
      dataIndex: "command",
      key: "command",
      editable: false,
      ellipsis: true,
      width: 150,
      render: (text: any, record: any, index: number) => {
        return (
          <div
            style={{ cursor: "pointer", color: "#1677ff" }}
            onClick={(e) => {
              e.stopPropagation();
              handleColumnClickWithRowSelect(record, index, "COMMAND");
            }}
          >
            {record.command}
          </div>
        );
      },
    },
    {
      title: "输入参数",
      dataIndex: "inputParams",
      key: "inputParams",
      editable: false,
      ellipsis: true,
      width: 150,
      render: (text: any, record: any, index: number) => {
        return (
          <div
            style={{ cursor: "pointer", color: "#1677ff" }}
            onClick={(e) => {
              e.stopPropagation();
              handleColumnClickWithRowSelect(record, index, "INPUT");

              setState({
                paramType: "INPUT",
              });
            }}
          >
            {record.inputParams}
          </div>
        );
      },
    },
    {
      title: "输出参数",
      dataIndex: "outputParams",
      ellipsis: true,
      editable: false,
      width: 150,
      render: (text: any, record: any, index: number) => {
        return (
          <div
            style={{ cursor: "pointer", color: "#1677ff" }}
            onClick={(e) => {
              e.stopPropagation();
              setState({
                paramType: "OUT",
              });
              handleColumnClickWithRowSelect(record, index, "OUT");
            }}
          >
            {record.outputParams}
          </div>
        );
      },
    },
    {
      title: "注释",
      dataIndex: "description",
      editable: () => true,
      ellipsis: true,
      width: 150,
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      width: 130,
      fixed: "right",
      render: (
        text: any,
        record: { id: any },
        index: number,
        action: { startEditable: (arg0: any) => void }
      ) => {
        const isFirst = index === 0;
        const isLast = index === data.length - 1;

        return [
          <a
            key="editable"
            onClick={() => {
              // action?.startEditable?.(record.id);
              setState({ isProcessModalOpen: true, updateValue: record });
            }}
            style={{ marginRight: 10, color: "#1677ff" }}
          >
            <EditOutlined style={{ marginRight: 4 }} />
          </a>,
          <a
            key="up"
            onClick={(e) => {
              e.stopPropagation();
              if (!isFirst) {
                moveRow(index, "up");
              }
            }}
            style={{
              marginRight: 10,
              cursor: isFirst ? "not-allowed" : "pointer",
              opacity: isFirst ? 0.5 : 1,
              color: isFirst ? "#ccc" : "#1677ff",
            }}
          >
            <ArrowUpOutlined style={{ marginRight: 4 }} />
          </a>,
          <a
            key="down"
            onClick={(e) => {
              e.stopPropagation();
              if (!isLast) {
                moveRow(index, "down");
              }
            }}
            style={{
              marginRight: 10,
              cursor: isLast ? "not-allowed" : "pointer",
              opacity: isLast ? 0.5 : 1,
              color: isLast ? "#ccc" : "#1677ff",
            }}
          >
            <ArrowDownOutlined style={{ marginRight: 4 }} />
          </a>,
          <a
            key="delete"
            onClick={(e) => {
              e.stopPropagation();
              deleteRow(index);
            }}
            style={{ color: "#ff4d4f" }}
          >
            <DeleteOutlined style={{ marginRight: 4 }} />
          </a>,
        ];
      },
    },
  ];

  // 处理点击特定列时的行选择和模式切换
  const handleColumnClickWithRowSelect = (
    record: any,
    index: number,
    mode: string
  ) => {
    // 先选中当前行
    handleRowClick(record, index);

    // 再切换模式
    if (mode === "COMMAND") {
      handleCommandClick(record.command);
    } else {
      setState({ isparamShow: true, selectType: mode });
    }
  };
  // 处理表格行数据
  const handleRowClick = (record: any, index: number) => {
    // 通知父组件更新选中行
    onChange?.(data, index);

    // 如果当前在 COMMAND 模式，同时更新命令树选中状态
    if (selectType === "COMMAND" && record.command) {
      syncTreeWithCommand(record.command);
    }
  };

  // 通用插入函数，供双击和按钮点击使用
  const insertTreeNode = (nodeKey: string, nodeTitle: string) => {
    if (data.length > 299) {
      message.warning("表格中的命令数量已达到最大限度，不可插入");
      return;
    }

    // 创建新的行数据
    const newRowData = {
      id: Date.now(), // 使用时间戳作为唯一ID
      command: nodeKey,
      inputParams: "输入参数: 待配置",
      outputParams: "输出参数: 待配置",
      description: `新增测试步骤: ${nodeTitle}`,
    };

    // 在选中行下方插入新行
    const insertIndex =
      selectedRowIndex >= 0 ? selectedRowIndex + 1 : data.length;
    const newTableData = [...data];
    newTableData.splice(insertIndex, 0, newRowData);

    // 更新序号
    newTableData.forEach((item, index) => {
      item.sequence = index + 1;
    });
    // 通知父组件更新数据 & 当前选中行
    onChange?.(newTableData, insertIndex);
    setState({ selectedRowData: newRowData });
    syncTreeWithCommand(nodeKey);
    // // 本地只维护右侧树和 param 的状态
    // setSelectedRowData(newRowData);

    // // 如果当前是命令模式，更新命令选择
    // if (selectType === "COMMAND") {
    //   handleCommandClick(nodeKey);
    // }

    message.success(`已在第${insertIndex + 1}行插入: ${nodeTitle}`);
  };
  const handleInsertClick = () => {
    if (selectedTreeKeys.length === 0) {
      message.warning("请先选择要插入的测试命令");
      return;
    }

    const selectedNodeKey = selectedTreeKeys[0];

    const findNodeInTree = (treeData: any[], key: string): any => {
      for (const node of treeData) {
        if (node.key === key) return node;
        if (node.children?.length > 0) {
          const found = findNodeInTree(node.children, key);
          if (found) return found;
        }
      }
      return null;
    };

    const selectedNode = findNodeInTree(processedTreeData, selectedNodeKey);

    if (!selectedNode) {
      message.warning("未找到选中的测试命令");
      return;
    }

    if (selectedNode.children?.length > 0) {
      message.warning(`请选择具体的测试命令进行插入`);
      return;
    }

    // 调用通用插入函数
    insertTreeNode(selectedNodeKey, selectedNode.title);
  };

  // 处理树节点双击事件，在选中行下方插入新行
  const handleTreeDoubleClick = (keys: any[], info: any) => {
    console.log("双击", keys);

    if (keys.length === 0) return;
    const clickedNodeKey = keys[0];
    const clickedNode = info.node;

    // 检查是否为父节点（有子节点），父节点不允许双击插入
    if (clickedNode.children && clickedNode.children.length > 0) {
      // "${clickedNode.title}" 是父级节点，
      message.warning(`请选择具体的测试命令进行插入`);
      return;
    }

    // 调用通用插入函数
    insertTreeNode(clickedNodeKey, clickedNode.title);
  };

  // 根据选中的命令获取参数解释
  const getCommandParamExplanation = (command: string) => {
    // 根据命令名称映射到对应的参数解释
    const commandToIdMap: Record<string, number> = {
      ReadESR_Acw: 1,
      ReadESR_Irl: 2,
      ReadESR_232_ResponseStringData: 3,
      ReadESR_Data: 4,
      SetESR_Acw: 5,
    };

    const id = commandToIdMap[command] as keyof typeof mockParamExplanation;
    return mockParamExplanation[id] || mockParamExplanation[1];
  };

  // 获取当前选中命令的参数解释
  const getCurrentParamExplanation = () => {
    if (selectedCommand) {
      return getCommandParamExplanation(selectedCommand);
    }
    // 如果没有选中命令，使用表格选中行的命令
    if (selectedRowData?.id) {
      const id = selectedRowData.id as keyof typeof mockParamExplanation;
      return mockParamExplanation[id] || mockParamExplanation[1];
    }
    // 默认返回第一个参数解释
    return mockParamExplanation[1];
  };

  return (
    <div className="process-page">
      {/* 左侧表格区域 */}
      <div className="process-left">
        <ProTable
          scroll={{ x: 1020 }}
          columns={columns}
          dataSource={data}
          rowKey="id"
          search={false}
          options={false}
          pagination={false}
          toolBarRender={() => [
            <Button
              key="button"
              icon={<PlusOutlined />}
              onClick={handleInsertClick}
            >
              插入
            </Button>,
          ]}
          size="small"
          onRow={(record, index) => ({
            onClick: () => handleRowClick(record, index || 0),
          })}
          rowClassName={(record, index) =>
            selectedRowIndex === index ? "selected-row" : ""
          }
        />
      </div>

      {/* 右侧区域 */}

      <div className="process-right">
        {/* 参数解释区域 */}
        <Card size="small" className="param-explanation-card">
          <div className="param-content">
            {/* 输入参数 */}
            {getCurrentParamExplanation().params.length > 0 && (
              <div className="param-section">
                <div className="param-section-title">
                  <Text strong>{getCurrentParamExplanation().title}</Text>
                </div>
                {getCurrentParamExplanation().params.map(
                  (param: any, index: number) => (
                    <div key={index} className="param-line">
                      <Text className="param-name">{param.name}</Text>
                      <Text type="secondary" className="param-type">
                        {param.type} ({param.dataType})
                      </Text>
                      <Text className="param-desc">{param.description}</Text>
                    </div>
                  )
                )}
              </div>
            )}

            {/* 输出参数 */}
            {getCurrentParamExplanation().outputParams && (
              <div className="param-section">
                <div className="param-section-title">
                  <Text strong>
                    {getCurrentParamExplanation().outputParams}
                  </Text>
                </div>
                <div className="param-line">
                  <Text className="param-name">
                    Parameter: {selectedCommand || selectedRowData?.command}_I
                  </Text>
                  <Text type="secondary" className="param-type">
                    结果参数 (integer)
                  </Text>
                  <Text className="param-desc">命令执行结果返回值</Text>
                </div>
              </div>
            )}
          </div>
        </Card>
        {/* 树形结构区域 */}
        <Card size="small" className="tree-card">
          <Tree
            treeData={processedTreeData}
            expandedKeys={expandedKeys}
            onExpand={(keys) => setState({ expandedKeys: keys as string[] })}
            selectedKeys={selectedTreeKeys}
            onSelect={(keys) =>
              setState({
                selectedTreeKeys: keys as string[],
                selectedCommand: keys[0] || "",
              })
            }
            onDoubleClick={(e, node) => {
              handleTreeDoubleClick([node.key], { node });
            }}
            showIcon={true}
            className="command-tree"
          />
        </Card>
        :
      </div>
      <ParamForm
        type={paramType}
        open={isparamShow}
        initialData={mockFormData}
        onCancel={() => setState({ isparamShow: false })}
        onOk={() => setState({ isparamShow: false })}
      />
      <ProcessModal
        open={isProcessModalOpen}
        updateValue={updateValue}
        onCancel={() => setState({ isProcessModalOpen: false })}
        onOk={(value) => {
          const newData = data.map((item) =>
            item.id === updateValue.id ? { ...item, ...value } : item
          );
          onChange?.(newData, selectedRowIndex);
          if (selectedRowData?.id === updateValue.id) {
            setState({ selectedRowData: { ...selectedRowData, ...value } });
          }
          setState({ isProcessModalOpen: false });
          message.success("保存成功");
        }}
      />
    </div>
  );
};

export default Process;
