import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, message, Modal } from "antd";
import React, { useEffect, useState } from "react";
import TempModal from "./tempModal";
interface ConditionsProps {
  data?: any[]; //table数据
  onChange?: (data: any[]) => void; //table变化
}

const TemporaryVariables: React.FC<ConditionsProps> = ({ data, onChange }) => {
  const [tableData, setTableData] = useState<any>(data);

  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1); // 初始化为-1，表示未选中
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [state, setState] = useSetState<any>({
    title: "",
    isPrecisionModalOpen: false,
    precisionValue: {}, //当前点击数据类型的整行数据
    isEditModalOpen: false,
    editValue: {},
  });

  // 动态创建列定义，确保操作列能响应tableData变化
  const columns = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
      width: 80,
    },
    {
      title: "扩展名",
      dataIndex: "extensionName",
      ellipsis: true,
      key: "extensionName",
    },
    {
      title: "变量名",
      ellipsis: true,
      dataIndex: "variableName",
    },
    {
      title: "数据类型",
      dataIndex: "dataType",
      ellipsis: true,
      valueType: "select",
    },

    {
      title: "数组大小",
      ellipsis: true,
      dataIndex: "arraySize",
    },
    {
      title: "单位",
      ellipsis: true,
      dataIndex: "unit",
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      width: 130,
      fixed: "right" as const,
      render: (text: any, record: any, index: number, action: any) => {
        // 动态获取当前表格数据长度来判断是否为最后一条
        const currentTableData = tableData || [];
        const isFirst = index === 0;
        const isLast = index === currentTableData.length - 1;

        return [
          <a
            key="editable"
            onClick={() => {
              // action?.startEditable?.(record.id);
              setState({ isEditModalOpen: true, editValue: record });
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

  const { title, editValue, isEditModalOpen } = state;

  // 监听外部数据变化
  useEffect(() => {
    if (data && data.length > 0) {
      setTableData(data);
    }
  }, [data]);

  // 上下移动行
  const moveRow = (index: number, direction: "up" | "down") => {
    setTableData((currentTableData: any[]) => {
      const newData = [...currentTableData];
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      // 边界检查
      if (targetIndex < 0 || targetIndex >= newData.length)
        return currentTableData;

      // 交换位置
      [newData[index], newData[targetIndex]] = [
        newData[targetIndex],
        newData[index],
      ];

      onChange && onChange(newData);

      // 更新选中行索引和数据
      if (selectedRowIndex === index) {
        setSelectedRowIndex(targetIndex);
        setSelectedRowData(newData[targetIndex]);
      } else if (selectedRowIndex === targetIndex) {
        setSelectedRowIndex(index);
        setSelectedRowData(newData[index]);
      }

      return newData;
    });
  };

  // 删除行
  const deleteRow = (index: number) => {
    Modal.confirm({
      title: "确认删除吗 ？",
      onOk: () => {
        // 使用函数式setState来获取最新的tableData
        setTableData((currentTableData: any[]) => {
          console.log("index", index, currentTableData);
          const newData = [...currentTableData];

          // 删除指定索引的行
          newData.splice(index, 1);

          // 重新计算序号
          newData.forEach((item, newIndex) => {
            item.sequence = newIndex + 1;
          });

          onChange && onChange(newData);
          return newData;
        });

        // // 处理选中状态
        // if (newData.length === 0) {
        //   // 如果没有数据了，清空选中状态
        //   setSelectedRowIndex(-1);
        //   setSelectedRowData(null);
        //   setSelectedCommand("");
        // } else {
        //   // 如果删除的是当前选中的行
        //   if (selectedRowIndex === index) {
        //     // 如果删除的是最后一行，选中上一行
        //     if (index === newData.length) {
        //       const newSelectedIndex = index - 1;
        //       setSelectedRowIndex(newSelectedIndex);
        //       setSelectedRowData(newData[newSelectedIndex]);
        //       // 如果当前是命令模式，更新命令选择
        //       if (
        //         selectType === "COMMAND" &&
        //         newData[newSelectedIndex]?.command
        //       ) {
        //         handleCommandClick(newData[newSelectedIndex].command);
        //       }
        //     } else {
        //       // 否则选中当前位置的行
        //       setSelectedRowIndex(index);
        //       setSelectedRowData(newData[index]);
        //       // 如果当前是命令模式，更新命令选择
        //       if (selectType === "COMMAND" && newData[index]?.command) {
        //         handleCommandClick(newData[index].command);
        //       }
        //     }
        //   } else if (selectedRowIndex > index) {
        //     // 如果删除的行在选中行之前，选中行索引需要减1
        //     setSelectedRowIndex(selectedRowIndex - 1);
        //   }
        // }

        message.success("删除成功");
      },
    });
  };
  // 处理表格行选择
  const handleRowClick = (record: any, index: number) => {
    setSelectedRowIndex(index);
    setSelectedRowData(record);
  };

  // 通用插入函数
  const handleInsertClick = () => {
    setTableData((currentTableData: any[]) => {
      // if (currentTableData.length > 299) {
      //   message.warning("表格中的命令数量已达到最大限度，不可插入");
      //   return currentTableData;
      // }

      // 创建新的行数据
      const newRowData = {
        id: Date.now(), // 使用时间戳作为唯一ID
        sequence: currentTableData.length + 1,
        extensionName: "",
        variableName: "",
        dataType: "bytearray",
        arraySize: 1,
        unit: "",
        visible: "success",
      };

      // 在选中行下方插入新行
      const insertIndex =
        selectedRowIndex >= 0 ? selectedRowIndex + 1 : currentTableData.length;
      const newTableData = [...currentTableData];
      newTableData.splice(insertIndex, 0, newRowData);

      // 更新序号
      newTableData.forEach((item, index) => {
        item.sequence = index + 1;
      });
      console.log("newTableData=====", newTableData);

      setSelectedRowIndex(insertIndex);
      setSelectedRowData(newRowData);
      onChange && onChange(newTableData);
      message.success(`已在第${insertIndex + 1}行插入`);

      return newTableData;
    });
  };

  return (
    <div className="conditions-page">
      <ProTable
        columns={columns}
        dataSource={tableData}
        rowKey="id"
        search={false}
        pagination={false}
        options={false}
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

      <TempModal
        open={isEditModalOpen}
        onCancel={() => setState({ isEditModalOpen: false })}
        type="edit"
        updateValue={editValue}
        onOk={(values) => {
          // 更新table数据
          setTableData((currentTableData: any[]) => {
            const newData = currentTableData.map((item: any) => {
              if (item.id === editValue.id) {
                return { ...item, ...values };
              }
              return item;
            });

            onChange && onChange(newData);
            return newData;
          });

          setState({ isEditModalOpen: false });
          message.success("保存成功");
        }}
      />
      {/* <Modal title="编辑测试条件" open={isEditModalOpen}></Modal> */}
    </div>
  );
};

export default TemporaryVariables;
