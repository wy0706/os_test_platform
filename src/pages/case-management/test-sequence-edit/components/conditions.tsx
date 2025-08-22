import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Input, message, Modal, Select, Table } from "antd";
import React, { useEffect, useState } from "react";
import ConditionModal from "./conditionModal";
import EditTypeModal from "./editTypeModal";
import "./index.less";
import { parseOptionString } from "./schemas";
interface ConditionsProps {
  data: any[]; //table数据
  onChange?: (data: any, selectedRowIndex: number) => void;
  selectedRowIndex?: any;
}

const Conditions: React.FC<ConditionsProps> = ({
  data,
  onChange,
  selectedRowIndex,
}) => {
  const [state, setState] = useSetState<any>({
    title: "",
    isPrecisionModalOpen: false,
    precisionValue: {}, //当前点击数据类型的整行数据
    isEditModalOpen: false,
    editValue: {},
    isEditTypeModalOpen: false,
    projectOption: [], //数组类型int[]并且CombiList ，把枚举项目转换成数组（符合select的）
  });
  const {
    isEditTypeModalOpen,
    isPrecisionModalOpen,
    precisionValue,
    editValue,
    isEditModalOpen,
    projectOption,
  } = state;
  const columns: any = [
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
        return record.dataType === "Float[]" ||
          record.dataType === "int[]" ||
          record.dataType === "bytearray" ? (
          <a
            onClick={() => {
              console.log("record", record);
              setState({
                isPrecisionModalOpen: true,
                precisionValue: record,
              });

              if (
                record.dataType === "int[]" &&
                record.editType === "ComboList"
              ) {
                const options = parseOptionString(record.project);
                setState({
                  projectOption: options,
                });
                // record.optionStr = "aa=1,bb=3,ff=5"
              }
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
      render: (text: any, record: any, index: any) => {
        return record.editType === "ComboList" ? (
          <a
            onClick={() => {
              setState({
                isEditTypeModalOpen: true,
              });
            }}
          >
            {text}
          </a>
        ) : (
          text
        );
      },
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
      //   // 只有当数据类型为 Float、Float[] 或 LoadVector 时才显示精度
      //   const shouldShow =
      //     record.dataType === "Float" ||
      //     record.dataType === "Float[]" ||
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
        const currentTableData = data || [];
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

  const moveRow = (index: number, direction: "up" | "down") => {
    const newData = [...data];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newData.length) return;

    [newData[index], newData[targetIndex]] = [
      newData[targetIndex],
      newData[index],
    ];

    newData.forEach((item, i) => {
      item.sequence = i + 1;
    });
    // 更新选中行
    let newSelected = selectedRowIndex;
    if (selectedRowIndex === index) {
      newSelected = targetIndex;
    } else if (selectedRowIndex === targetIndex) {
      newSelected = index;
    }

    onChange?.(newData, newSelected);
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
        } else if (selectedRowIndex >= newData.length) {
          newSelected = newData.length - 1;
        }

        onChange?.(newData, newSelected);
      },
    });
  };

  // 点击行
  const handleRowClick = (_record: any, index: number) => {
    onChange?.(data, index);
  };
  // 插入新行
  const handleInsertClick = () => {
    const newRowData = {
      id: Date.now(),
      extensionName: "",
      variableName: "",
      dataType: "",
      arraySize: 1,
      unit: "",
      visible: "success",
    };

    const insertIndex =
      selectedRowIndex >= 0 ? selectedRowIndex + 1 : data.length;
    const newTableData = [...data];
    newTableData.splice(insertIndex, 0, newRowData);

    // 更新序号
    newTableData.forEach((item, index) => {
      item.sequence = index + 1;
    });

    message.success(
      data.length === 0 ? "已插入第一行" : `已在第${insertIndex + 1}行插入`
    );

    onChange?.(newTableData, insertIndex);
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

  // 解析数组字符串，如 "0, 0, 0, 0, ff, ff, ff, ff" 或 "1, 1" 或者 1 或者"1"
  const parseArrayString = (arrayString: string) => {
    if (arrayString === undefined || arrayString === null) return [];
    // 统一转为字符串
    const str = String(arrayString).trim();
    if (!str) return [];
    // 如果包含逗号，按逗号切分
    if (str.includes(",")) {
      return str
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    // 如果没有逗号，直接返回单个元素数组
    return [str];
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
    const arraySize = precisionValue.arraySize || 1; //数组

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
        width: 120,
        render: (text: string, record: any) => {
          // 规则：不可编辑条件
          const isDisabled =
            // bytearray 的 Min / Max 不可编辑
            (precisionValue.dataType === "bytearray" &&
              (record.key === "MinValue" || record.key === "MaxValue")) ||
            // int[] + ComboList 的 Min / Max 不可编辑
            (precisionValue.dataType === "int[]" &&
              precisionValue.editType === "ComboList" &&
              (record.key === "MinValue" || record.key === "MaxValue"));

          // int[] + ComboList 的 DefaultValue → 用 Select
          const useSelect =
            precisionValue.dataType === "int[]" &&
            precisionValue.editType === "ComboList" &&
            record.key === "DefaultValue";

          if (useSelect) {
            return (
              <Select
                value={text}
                onChange={(value) =>
                  handleArrayCellChange(record.key, `col${index}`, value)
                }
                size="small"
                style={{ width: "100%" }}
                options={projectOption}
              />
            );
          }

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
      // ...Array.from({ length: arraySize }, (_, index) => ({
      //   title: `${index + 1}`,
      //   dataIndex: `col${index}`,
      //   key: `col${index}`,
      //   width: 80,
      //   render: (text: string, record: any) => {
      //     // 当数据类型为 bytearray 时，最大值和最小值不可编辑
      //     const isDisabled =
      //       precisionValue.dataType === "bytearray" &&
      //       (record.key === "MinValue" || record.key === "MaxValue");

      //     return (
      //       <Input
      //         value={text}
      //         onChange={(e) =>
      //           handleArrayCellChange(record.key, `col${index}`, e.target.value)
      //         }
      //         size="small"
      //         style={{
      //           textAlign: "center",
      //           backgroundColor: isDisabled ? "#f5f5f5" : "white",
      //         }}
      //         disabled={isDisabled}
      //       />
      //     );
      //   },
      // })),
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
      // 对于 bytearray 类型，最大值和最小值保持原值不变
      let minValue, maxValue;
      if (precisionValue.dataType === "bytearray") {
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
      const newData = data.map((item: any) => {
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

      // 通知父组件更新数据
      onChange?.(newData, selectedRowIndex);
      setState({ isPrecisionModalOpen: false, projectOption: [] });
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
        dataSource={data}
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
        rowClassName={(_, index) =>
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
            onClick={() =>
              setState({ isPrecisionModalOpen: false, projectOption: [] })
            }
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
          const newData = data.map((item: any) =>
            item.id === editValue.id ? { ...item, ...values } : item
          );
          // 通知父组件更新数据
          onChange?.(newData, selectedRowIndex);

          // 关闭弹框
          setState({ isEditModalOpen: false });

          message.success("保存成功");
        }}
      />
      <EditTypeModal
        open={isEditTypeModalOpen}
        onCancel={() => {
          setState({
            isEditTypeModalOpen: false,
          });
        }}
        onOk={(values: any) => {
          console.log("values", values);
          setState({
            isEditTypeModalOpen: false,
          });
        }}
        // 模拟后端返回的默认数据
        updateValue={{
          project: [
            { first: "aa", last: "3" },
            { first: "bb", last: "4" },
          ],
        }}
      />
      {/* <Modal title="编辑测试条件" open={isEditModalOpen}></Modal> */}
    </div>
  );
};

export default Conditions;
