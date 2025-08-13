import { EditOutlined } from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Input, message, Modal, Table } from "antd";
import React, { useEffect, useState } from "react";
import ResultModal from "./resultModal";
interface ResultPageProps {
  data?: any[]; //table数据
  onChange?: (data: any[]) => void; //table变化
}

const ResultPage: React.FC<ResultPageProps> = ({ data, onChange }) => {
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
        title: "最小值下限",
        dataIndex: "minOffValue",
      },
      {
        title: "最小值上限",
        dataIndex: "minHighValue",
      },
      {
        title: "最小值默认值",
        dataIndex: "minDefaultValue",
      },
      {
        title: "最大值下限",
        dataIndex: "maxOffValue",
      },
      {
        title: "最大值上限",
        dataIndex: "maxHighValue",
      },
      {
        title: "最大值默认值",
        dataIndex: "maxDefaultValue",
      },
      {
        title: "精度",
        dataIndex: "precision",
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
    const minOffValues = parseArrayString(precisionValue.minOffValue);
    const minHighValues = parseArrayString(precisionValue.minHighValue);
    const minDefaultValues = parseArrayString(precisionValue.minDefaultValue);
    const maxOffValues = parseArrayString(precisionValue.maxOffValue);
    const maxHighValues = parseArrayString(precisionValue.maxHighValue);
    const maxDefaultValues = parseArrayString(precisionValue.maxDefaultValue);

    const data = [
      {
        key: "MinOffValue",
        rowName: "最小值下限",
        ...generateArrayColumns(minOffValues, arraySize),
      },
      {
        key: "MinHighValue",
        rowName: "最小值上限",
        ...generateArrayColumns(minHighValues, arraySize),
      },
      {
        key: "MinDefaultValue",
        rowName: "最小值默认值",
        ...generateArrayColumns(minDefaultValues, arraySize),
      },
      {
        key: "MaxOffValue",
        rowName: "最大值下限",
        ...generateArrayColumns(maxOffValues, arraySize),
      },
      {
        key: "MaxHighValue",
        rowName: "最大值上限",
        ...generateArrayColumns(maxHighValues, arraySize),
      },
      {
        key: "MaxDefaultValue",
        rowName: "最大值默认值",
        ...generateArrayColumns(maxDefaultValues, arraySize),
      },
    ];
    setArrayTableData(data);
  };

  const parseArrayString = (arrayString: any) => {
    if (!arrayString) return [];
    // 如果已经是数组，直接返回
    if (Array.isArray(arrayString))
      return arrayString.map((item) => String(item));
    // 如果是字符串，按逗号分割
    if (typeof arrayString === "string") {
      return arrayString.split(",").map((item) => item.trim());
    }
    // 其他类型转为字符串后返回单元素数组
    return [String(arrayString)];
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
          // 当数据类型为 Byte[] 时，除了默认值外其他都不可编辑
          const isDisabled =
            precisionValue.dataType === "Byte[]" &&
            (record.key === "MinOffValue" ||
              record.key === "MinHighValue" ||
              record.key === "MaxOffValue" ||
              record.key === "MaxHighValue");

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

      const minOffRow = arrayTableData.find((row) => row.key === "MinOffValue");
      const minHighRow = arrayTableData.find(
        (row) => row.key === "MinHighValue"
      );
      const minDefaultRow = arrayTableData.find(
        (row) => row.key === "MinDefaultValue"
      );
      const maxOffRow = arrayTableData.find((row) => row.key === "MaxOffValue");
      const maxHighRow = arrayTableData.find(
        (row) => row.key === "MaxHighValue"
      );
      const maxDefaultRow = arrayTableData.find(
        (row) => row.key === "MaxDefaultValue"
      );

      // 检查必需的行数据是否存在
      if (
        !minOffRow ||
        !minHighRow ||
        !minDefaultRow ||
        !maxOffRow ||
        !maxHighRow ||
        !maxDefaultRow
      ) {
        message.error("数据不完整，请检查数组设置");
        return;
      }

      // 对于 Byte[] 类型，最大值和最小值保持原值不变
      let minOffValue,
        minHighValue,
        minDefaultValue,
        maxOffValue,
        maxHighValue,
        maxDefaultValue;
      if (precisionValue.dataType === "Byte[]") {
        // 保持原来的值
        minOffValue = precisionValue.minOffValue || "";
        minHighValue = precisionValue.minHighValue || "";
        maxOffValue = precisionValue.maxOffValue || "";
        maxHighValue = precisionValue.maxHighValue || "";
      } else {
        // 其他类型正常更新
        minOffValue = Array.from(
          { length: arraySize },
          (_, i) => minOffRow?.[`col${i}`] || ""
        ).join(", ");
        minHighValue = Array.from(
          { length: arraySize },
          (_, i) => minHighRow?.[`col${i}`] || ""
        ).join(", ");
        maxOffValue = Array.from(
          { length: arraySize },
          (_, i) => maxOffRow?.[`col${i}`] || ""
        ).join(", ");
        maxHighValue = Array.from(
          { length: arraySize },
          (_, i) => maxHighRow?.[`col${i}`] || ""
        ).join(", ");
      }

      minDefaultValue = Array.from(
        { length: arraySize },
        (_, i) => minDefaultRow?.[`col${i}`] || ""
      ).join(", ");
      maxDefaultValue = Array.from(
        { length: arraySize },
        (_, i) => maxDefaultRow?.[`col${i}`] || ""
      ).join(", ");

      // 更新主表格数据
      const newData = tableData.map((item: any) => {
        if (item.id === precisionValue.id) {
          return {
            ...item,
            minOffValue,
            minHighValue,
            minDefaultValue,
            maxOffValue,
            maxHighValue,
            maxDefaultValue,
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
      <ResultModal
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

export default ResultPage;
