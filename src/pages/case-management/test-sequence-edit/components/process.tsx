import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  EditOutlined,
  FileTextOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import { Card, Tree, Typography, message } from "antd";
import React, { useEffect, useState } from "react";
import "./index.less";

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
        dataType: "Double[]",
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

// 模拟树形结构数据
const mockTreeData = [
  {
    title: "testCommand",
    key: "testCommand",
    icon: <FolderOutlined />,
    children: [
      {
        title: "AC_SOURCE",
        key: "AC_SOURCE",
        icon: <FolderOutlined />,
        children: [
          {
            title: "ReadESR_232_ResponseStringData",
            key: "ReadESR_232_ResponseStringData",
            icon: <FileTextOutlined />,
          },
        ],
      },
      // {
      //   title: "DC_SOURCE",
      //   key: "DC_SOURCE",
      //   // icon: "📁",
      // },
      // {
      //   title: "LOAD",
      //   key: "LOAD",
      //   icon: "📁",
      // },
      // {
      //   title: "Power Analyzer",
      //   key: "Power_Analyzer",
      //   icon: "📁",
      // },
      // {
      //   title: "DSD",
      //   key: "DSD",
      //   icon: "📁",
      // },
      // {
      //   title: "DMM",
      //   key: "DMM",
      //   icon: "📁",
      // },
      // {
      //   title: "PATH",
      //   key: "PATH",
      //   icon: "📁",
      // },
      // {
      //   title: "System",
      //   key: "System",
      //   icon: "📁",
      // },
      // {
      //   title: "Timing/Rules Analyzer",
      //   key: "Timing_Rules_Analyzer",
      //   icon: "📁",
      // },
      // {
      //   title: "Control Unit",
      //   key: "Control_Unit",
      //   icon: "📁",
      // },
      // {
      //   title: "On / Off Controller",
      //   key: "On_Off_Controller",
      //   icon: "📁",
      // },
      // {
      //   title: "Voltage/Freq Tester",
      //   key: "Voltage_Freq_Tester",
      //   icon: "📁",
      // },
      {
        title: "RS232 Device",
        key: "RS232_Device",
        icon: <FolderOutlined />,
        children: [
          {
            title: "ReadESR_Acw",
            key: "ReadESR_Acw",
            icon: <FileTextOutlined />,
          },
          {
            title: "ReadESR_Data",
            key: "ReadESR_Data",
            icon: <FileTextOutlined />,
          },
          {
            title: "ReadESR_Go",
            key: "ReadESR_Go",
            icon: <FileTextOutlined />,
          },
          {
            title: "ReadESR_Col",
            key: "ReadESR_Col",
            icon: <FileTextOutlined />,
          },
          {
            title: "ReadESR_Ir",
            key: "ReadESR_Ir",
            icon: <FileTextOutlined />,
          },
          {
            title: "ReadESR_Irl",
            key: "ReadESR_Irl",
            icon: <FileTextOutlined />,
          },
          {
            title: "ReadESR_StepResult",
            key: "ReadESR_StepResult",
            icon: <FileTextOutlined />,
          },
          {
            title: "ReadESR_TestResult",
            key: "ReadESR_TestResult",
            icon: <FileTextOutlined />,
          },
          {
            title: "ReadESR_TestState",
            key: "ReadESR_TestState",
            icon: <FileTextOutlined />,
          },
          {
            title: "SetESR_Acw",
            key: "SetESR_Acw",
            icon: <FileTextOutlined />,
          },
          {
            title: "SetESR_ACVTestData",
            key: "SetESR_ACVTestData",
            icon: <FileTextOutlined />,
          },
          {
            title: "SetESR_Data",
            key: "SetESR_Data",
            icon: <FileTextOutlined />,
          },
          {
            title: "SetESR_Dec",
            key: "SetESR_Dec",
            icon: <FileTextOutlined />,
          },
        ],
      },
      {
        title: "FSK",
        key: "FSK",
        icon: <FolderOutlined />,
        children: [
          {
            title: "ReadESR_Acw111",
            key: "ReadESR_Acw111",
            icon: <FileTextOutlined />,
          },
        ],
      },
    ],
  },
];

interface ProcessProps {
  data?: any[]; //table数据
}

const Process: React.FC<ProcessProps> = ({ data }) => {
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1); // 初始化为-1，表示未选中
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [tableData, setTableData] = useState<any[]>(data); // 表格数据状态管理，支持接口数据
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedTreeKeys, setSelectedTreeKeys] = useState<string[]>([]);
  const [selectedCommand, setSelectedCommand] = useState<string>(""); // 当前选中的命令

  const [selectType, setType] = useState("COMMAND"); //默认展示测试命令 COMMAND | INPUT |OUT

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
    setType("COMMAND");
    setSelectedCommand(command); // 设置当前选中的命令
    const commandPath = findCommandInTree(command, mockTreeData);
    if (commandPath) {
      // 设置选中的节点
      setSelectedTreeKeys([command]);

      // 确保展开到该命令的路径
      const newExpandedKeys = [
        ...new Set([...expandedKeys, ...commandPath.slice(0, -1)]),
      ];
      setExpandedKeys(newExpandedKeys);
    }
  };

  // 上下移动行
  const moveRow = (index: number, direction: "up" | "down") => {
    const newData = [...tableData];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    // 边界检查
    if (targetIndex < 0 || targetIndex >= newData.length) return;

    // 交换位置
    [newData[index], newData[targetIndex]] = [
      newData[targetIndex],
      newData[index],
    ];

    setTableData(newData);

    // 更新选中行索引和数据
    if (selectedRowIndex === index) {
      setSelectedRowIndex(targetIndex);
      setSelectedRowData(newData[targetIndex]);
    } else if (selectedRowIndex === targetIndex) {
      setSelectedRowIndex(index);
      setSelectedRowData(newData[index]);
    }
  };

  // 初始化时设置默认展开全部
  useEffect(() => {
    // 默认展开所有节点
    const allKeys = getAllTreeKeys(mockTreeData);
    setExpandedKeys(allKeys);
  }, []);

  // 监听tableData变化，设置默认选中第一行
  useEffect(() => {
    // 如果有数据且当前没有选中任何行，则默认选中第一行
    if (tableData.length > 0 && selectedRowIndex === -1) {
      const firstRow = tableData[0];
      setSelectedRowIndex(0);
      setSelectedRowData(firstRow);

      // 触发第一行的测试命令点击事件
      if (firstRow?.command) {
        handleCommandClick(firstRow.command);
      }
    }
  }, [tableData, selectedRowIndex]);

  // 监听外部数据变化
  useEffect(() => {
    if (data && data.length > 0) {
      setTableData(data);
      // 重置选中状态，让后续的useEffect处理默认选中
      setSelectedRowIndex(-1);
      setSelectedRowData(null);
      setSelectedCommand("");
    }
  }, [data]);

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
    },
    {
      title: "测试命令",
      dataIndex: "command",
      key: "command",
      editable: false,
      ellipsis: true,
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
      render: (text: any, record: any, index: number) => {
        return (
          <div
            style={{ cursor: "pointer", color: "#1677ff" }}
            onClick={(e) => {
              e.stopPropagation();
              handleColumnClickWithRowSelect(record, index, "INPUT");
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
      render: (text: any, record: any, index: number) => {
        return (
          <div
            style={{ cursor: "pointer", color: "#1677ff" }}
            onClick={(e) => {
              e.stopPropagation();
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
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      width: 100,
      render: (
        text: any,
        record: { id: any },
        index: number,
        action: { startEditable: (arg0: any) => void }
      ) => {
        const isFirst = index === 0;
        const isLast = index === tableData.length - 1;

        return [
          <a
            key="editable"
            onClick={() => {
              action?.startEditable?.(record.id);
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
        ];
      },
    },
  ];

  // 处理表格行选择
  const handleRowClick = (record: any, index: number) => {
    setSelectedRowIndex(index);
    setSelectedRowData(record);

    // 如果当前在COMMAND模式，同时更新命令树选中状态
    if (selectType === "COMMAND" && record.command) {
      const commandPath = findCommandInTree(record.command, mockTreeData);
      if (commandPath) {
        setSelectedTreeKeys([record.command]);
        const newExpandedKeys = [
          ...new Set([...expandedKeys, ...commandPath.slice(0, -1)]),
        ];
        setExpandedKeys(newExpandedKeys);
      }
    }
  };

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
      setType(mode);
    }
  };

  // 处理树节点双击事件，在选中行下方插入新行
  const handleTreeDoubleClick = (keys: any[], info: any) => {
    if (keys.length === 0) return;

    const clickedNodeKey = keys[0];
    const clickedNode = info.node;

    // 检查是否为父节点（有子节点），父节点不允许双击插入
    if (clickedNode.children && clickedNode.children.length > 0) {
      // "${clickedNode.title}" 是父级节点，
      message.warning(`请选择具体的测试命令进行插入`);
      return;
    }

    // 创建新的行数据
    const newRowData = {
      id: Date.now(), // 使用时间戳作为唯一ID
      sequence: tableData.length + 1,
      command: clickedNodeKey,
      inputParams: "输入参数: 待配置",
      outputParams: "输出参数: 待配置",
      description: `新增测试步骤: ${clickedNode.title}`,
    };

    // 在选中行下方插入新行
    const insertIndex =
      selectedRowIndex >= 0 ? selectedRowIndex + 1 : tableData.length;
    const newTableData = [...tableData];
    newTableData.splice(insertIndex, 0, newRowData);

    // 更新序号
    newTableData.forEach((item, index) => {
      item.sequence = index + 1;
    });

    setTableData(newTableData);

    // 选中新插入的行
    setSelectedRowIndex(insertIndex);
    setSelectedRowData(newRowData);

    // 如果当前是命令模式，更新命令选择
    if (selectType === "COMMAND") {
      handleCommandClick(clickedNodeKey);
    }

    message.success(
      `已在第${insertIndex + 1}行插入新的测试步骤: ${clickedNode.title}`
    );
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
          columns={columns}
          dataSource={tableData}
          rowKey="id"
          search={false}
          pagination={false}
          toolBarRender={false}
          size="small"
          editable={{
            type: "single",
            actionRender: (row, config, defaultDoms) => {
              return [defaultDoms.save, defaultDoms.cancel];
            },
            onSave: async (rowKey, data, row) => {
              // 更新table数据
              const newData = tableData.map((item) => {
                if (item.id === rowKey) {
                  return { ...item, ...data };
                }
                return item;
              });
              setTableData(newData);

              // 如果修改的是当前选中的行，同时更新选中的数据
              if (selectedRowData?.id === rowKey) {
                setSelectedRowData({ ...selectedRowData, ...data });
              }

              message.success("保存成功");
              return true;
            },
            onCancel: async (rowKey, record, originRow) => {
              message.info("已取消编辑");
              return true;
            },
          }}
          onRow={(record, index) => ({
            onClick: () => handleRowClick(record, index || 0),
            className: selectedRowIndex === index ? "selected-row" : "",
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

        {selectType === "COMMAND" ? (
          <div>
            <Card size="small" className="tree-card">
              <Tree
                treeData={mockTreeData}
                expandedKeys={expandedKeys}
                onExpand={(keys) => setExpandedKeys(keys as string[])}
                selectedKeys={selectedTreeKeys}
                onSelect={(keys) => {
                  setSelectedTreeKeys(keys as string[]);
                  if (keys.length > 0) {
                    setSelectedCommand(keys[0] as string);
                  }
                }}
                onDoubleClick={(e, node) => {
                  handleTreeDoubleClick([node.key], { node });
                }}
                showIcon={true}
                className="command-tree"
              />
            </Card>
          </div>
        ) : selectType === "INPUT" ? (
          <Card title="输入参数" size="small" className="param-detail-card">
            <div className="param-detail-content">
              <Text strong>当前输入参数: </Text>
              <Text code>{selectedRowData?.inputParams}</Text>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  这里可以显示输入参数的详细配置和说明
                </Text>
              </div>
            </div>
          </Card>
        ) : selectType === "OUT" ? (
          <Card title="输出参数" size="small" className="param-detail-card">
            <div className="param-detail-content">
              <Text strong>当前输出参数: </Text>
              <Text code>{selectedRowData?.outputParams}</Text>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  这里可以显示输出参数的详细配置和说明
                </Text>
              </div>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default Process;
