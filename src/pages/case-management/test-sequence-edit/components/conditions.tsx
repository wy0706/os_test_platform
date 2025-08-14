import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Input, message, Modal, Table } from "antd";
import React, { useEffect, useState } from "react";
import ConditionModal from "./conditionModal";
import "./index.less";
interface ConditionsProps {
  data?: any[]; //table数据
  onChange?: (data: any[]) => void; //table变化
}

const Conditions: React.FC<ConditionsProps> = ({ data, onChange }) => {
  const [tableData, setTableData] = useState<any>(data);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1); // 初始化为-1，表示未选中
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  // 监听外部数据变化
  useEffect(() => {
    if (data && data.length > 0) {
      setTableData(data);
    }
  }, [data]);

  const [state, setState] = useSetState<any>({
    title: "",
    isPrecisionModalOpen: false,
    precisionValue: {}, //当前点击数据类型的整行数据
    isEditModalOpen: false,
    editValue: {},
  });
  const {
    title,

    isPrecisionModalOpen,
    precisionValue,
    editValue,
    isEditModalOpen,
  } = state;
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
      key: "extensionName",
    },
    {
      title: "变量名",
      dataIndex: "variableName",
    },
    {
      title: "数据类型",
      dataIndex: "dataType",
      // valueEnum: {
      //   Double: { text: "Double" },
      //   Integer: { text: "Integer" },
      //   Byte: { text: "Byte" },
      //   "Double[]": { text: "Double[]" },
      //   "Integer[]": { text: "Integer[]" },
      //   "Byte[]": { text: "Byte[]" },
      //   String: { text: "String" },
      //   LineInVector: { text: "LineInVector" },
      //   LoadVector: { text: "LoadVector" },
      // },
      render: (text: any, record: any, index: any) => {
        console.log(text, record, index);
        return record.dataType === "Double[]" ||
          record.dataType === "Integer[]" ||
          record.dataType === "Byte[]" ? (
          <a
            onClick={() => {
              setState({
                isPrecisionModalOpen: true,
                precisionValue: record,
              });
            }}
          >
            {" "}
            {text}
          </a>
        ) : (
          text
        );
      },
    },
    {
      title: "编辑类型",
      dataIndex: "editType",
    },
    {
      title: "最小值",
      dataIndex: "minValue",
    },
    {
      title: "最大值",
      dataIndex: "maxValue",
    },
    {
      title: "默认值",
      dataIndex: "defaultValue",
    },
    {
      title: "精度",
      dataIndex: "precision",

      // render: (text: any, record: any) => {
      //   // 只有当数据类型为 Double、Double[] 或 LoadVector 时才显示精度
      //   const shouldShow =
      //     record.dataType === "Double" ||
      //     record.dataType === "Double[]" ||
      //     record.dataType === "LoadVector";
      //   return shouldShow ? text : "-";
      // },
    },
    {
      title: "枚举项目",
      dataIndex: "project",
    },
    {
      title: "数组大小",
      dataIndex: "arraySize",
    },
    {
      title: "单位",
      dataIndex: "unit",
    },
    {
      title: "可见",
      dataIndex: "visible",
      valueType: "select",
      key: "visible",
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
      // editable: () => true,
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
  // 数组设置弹框的表格数据
  const [arrayTableData, setArrayTableData] = useState<any[]>([]);

  useEffect(() => {
    // 当打开数组设置弹框时，初始化表格数据
    if (isPrecisionModalOpen && precisionValue) {
      initializeArrayTableData();
    }
  }, [isPrecisionModalOpen, precisionValue]);
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
        dataType: "Byte[]",
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
  // 初始化数组表格数据
  const initializeArrayTableData = () => {
    const arraySize = precisionValue.arraySize || 1;
    const minValues = parseArrayString(precisionValue.minValue);
    const maxValues = parseArrayString(precisionValue.maxValue);
    const defaultValues = parseArrayString(precisionValue.defaultValue);

    const data = [
      {
        key: "MinValue",
        rowName: "最小值",
        ...generateArrayColumns(minValues, arraySize),
      },
      {
        key: "MaxValue",
        rowName: "最大值",
        ...generateArrayColumns(maxValues, arraySize),
      },
      {
        key: "DefaultValue",
        rowName: "默认值",
        ...generateArrayColumns(defaultValues, arraySize),
      },
    ];
    setArrayTableData(data);
  };

  // 解析数组字符串，如 "0, 0, 0, 0, ff, ff, ff, ff" 或 "1, 1"
  const parseArrayString = (arrayString: string) => {
    if (!arrayString) return [];
    return arrayString.split(",").map((item) => item.trim());
  };

  // 生成数组列的数据对象
  const generateArrayColumns = (values: string[], arraySize: number) => {
    const columns: any = {};
    for (let i = 0; i < arraySize; i++) {
      columns[`col${i}`] = values[i] || "";
    }
    return columns;
  };

  // 渲染数组设置表格
  const renderArraySettingTable = () => {
    if (!precisionValue) return null;

    const arraySize = precisionValue.arraySize || 1;

    // 动态生成表格列
    const columns = [
      {
        title: "",
        dataIndex: "rowName",
        key: "rowName",
        width: 100,
        render: (text: string) => <strong>{text}</strong>,
      },
      ...Array.from({ length: arraySize }, (_, index) => ({
        title: `${index + 1}`,
        dataIndex: `col${index}`,
        key: `col${index}`,
        width: 80,
        render: (text: string, record: any) => {
          // 当数据类型为 Byte[] 时，最大值和最小值不可编辑
          const isDisabled =
            precisionValue.dataType === "Byte[]" &&
            (record.key === "MinValue" || record.key === "MaxValue");

          return (
            <Input
              value={text}
              onChange={(e) =>
                handleArrayCellChange(record.key, `col${index}`, e.target.value)
              }
              size="small"
              style={{
                textAlign: "center",
                backgroundColor: isDisabled ? "#f5f5f5" : "white",
              }}
              disabled={isDisabled}
            />
          );
        },
      })),
    ];

    return (
      <div>
        <div className="array-info">
          数据类型: {precisionValue.dataType} | 数组大小: {arraySize}
        </div>
        <Table
          columns={columns}
          dataSource={arrayTableData}
          pagination={false}
          size="small"
          bordered
          rowKey="key"
          className="array-table"
        />
      </div>
    );
  };

  // 处理数组表格单元格值变化
  const handleArrayCellChange = (
    rowKey: string,
    colKey: string,
    value: string
  ) => {
    setArrayTableData((prevData) =>
      prevData.map((row) =>
        row.key === rowKey ? { ...row, [colKey]: value } : row
      )
    );
  };

  // 处理数组设置弹框确定按钮
  const handleArrayModalConfirm = () => {
    try {
      // 将表格数据转换回字符串格式
      const arraySize = precisionValue.arraySize || 1;

      const minRow = arrayTableData.find((row) => row.key === "MinValue");
      const maxRow = arrayTableData.find((row) => row.key === "MaxValue");
      const defaultRow = arrayTableData.find(
        (row) => row.key === "DefaultValue"
      );

      // 检查必需的行数据是否存在
      if (!minRow || !maxRow || !defaultRow) {
        message.error("数据不完整，请检查数组设置");
        return;
      }

      // 对于 Byte[] 类型，最大值和最小值保持原值不变
      let minValue, maxValue;
      if (precisionValue.dataType === "Byte[]") {
        // 保持原来的最大值和最小值
        minValue = precisionValue.minValue || "";
        maxValue = precisionValue.maxValue || "";
      } else {
        // 其他类型正常更新
        minValue = Array.from(
          { length: arraySize },
          (_, i) => minRow?.[`col${i}`] || ""
        ).join(", ");
        maxValue = Array.from(
          { length: arraySize },
          (_, i) => maxRow?.[`col${i}`] || ""
        ).join(", ");
      }

      const defaultValue = Array.from(
        { length: arraySize },
        (_, i) => defaultRow?.[`col${i}`] || ""
      ).join(", ");

      // 更新主表格数据
      const newData = tableData.map((item: any) => {
        if (item.id === precisionValue.id) {
          return {
            ...item,
            minValue,
            maxValue,
            defaultValue,
          };
        }
        return item;
      });

      setTableData(newData);
      onChange && onChange(newData);
      setState({ isPrecisionModalOpen: false });
      message.success("数组设置保存成功");
    } catch (error) {
      console.error("保存数组设置时出错:", error);
      message.error("保存失败，请重试");
    }
  };

  return (
    <div className="conditions-page">
      <ProTable
        columns={columns}
        dataSource={tableData}
        rowKey="id"
        search={false}
        pagination={false}
        size="small"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={handleInsertClick}
          >
            插入
          </Button>,
        ]}
        options={false}
        onRow={(record, index) => ({
          onClick: () => handleRowClick(record, index || 0),
        })}
        rowClassName={(record, index) =>
          selectedRowIndex === index ? "selected-row" : ""
        }
      />

      {/* 数组设置弹框 */}
      <Modal
        title="数组设置"
        open={isPrecisionModalOpen}
        onCancel={() => setState({ isPrecisionModalOpen: false })}
        width={800}
        className="array-setting-modal"
        footer={[
          <Button
            key="cancel"
            onClick={() => setState({ isPrecisionModalOpen: false })}
          >
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              // 确定按钮的处理逻辑
              handleArrayModalConfirm();
            }}
          >
            确定
          </Button>,
        ]}
      >
        {renderArraySettingTable()}
      </Modal>
      <ConditionModal
        open={isEditModalOpen}
        onCancel={() => setState({ isEditModalOpen: false })}
        type="edit"
        updateValue={editValue}
        onOk={(values) => {
          // 更新table数据
          const newData = tableData.map((item: any) => {
            if (item.id === editValue.id) {
              return { ...item, ...values };
            }
            return item;
          });

          setTableData(newData);
          onChange && onChange(newData);
          setState({ isEditModalOpen: false });
          message.success("保存成功");
        }}
      />
      {/* <Modal title="编辑测试条件" open={isEditModalOpen}></Modal> */}
    </div>
  );
};

export default Conditions;
