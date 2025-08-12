import { EditOutlined } from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Input, message, Modal, Table } from "antd";
import React, { useEffect, useState } from "react";
import ConditionModal from "./conditionModal";
interface ConditionsProps {
  data?: any[]; //table数据
  onChange?: (data: any[]) => void; //table变化
}

const Conditions: React.FC<ConditionsProps> = ({ data, onChange }) => {
  const [tableData, setTableData] = useState<any>(data);
  const [state, setState] = useSetState<any>({
    title: "",
    isPrecisionModalOpen: false,
    precisionValue: {}, //当前点击数据类型的整行数据
    isEditModalOpen: false,
    editValue: {},
    columns: [
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
        // editable: () => true,
        valueType: "select",
        valueEnum: {
          Double: { text: "Double" },
          Integer: { text: "Integer" },
          Byte: { text: "Byte" },
          "Double[]": { text: "Double[]" },
          "Integer[]": { text: "Integer[]" },
          "Byte[]": { text: "Byte[]" },
          String: { text: "String" },
          LineInVector: { text: "LineInVector" },
          LoadVector: { text: "LoadVector" },
        },
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
        width: 80,
        fixed: "right",
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
                // action?.startEditable?.(record.id);
                setState({ isEditModalOpen: true, editValue: record });
              }}
              style={{ marginRight: 10, color: "#1677ff" }}
            >
              <EditOutlined style={{ marginRight: 4 }} />
            </a>,
          ];
        },
      },
    ],
  });
  const {
    title,
    columns,
    isPrecisionModalOpen,
    precisionValue,
    editValue,
    isEditModalOpen,
  } = state;

  // 数组设置弹框的表格数据
  const [arrayTableData, setArrayTableData] = useState<any[]>([]);

  useEffect(() => {
    // 当打开数组设置弹框时，初始化表格数据
    if (isPrecisionModalOpen && precisionValue) {
      initializeArrayTableData();
    }
  }, [isPrecisionModalOpen, precisionValue]);

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
        toolBarRender={false}
        size="small"
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
