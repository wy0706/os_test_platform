import { getResultList } from "@/services/case-management/test-sequence-edit.service";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { ActionType, ProTable } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Input, message, Modal, Table } from "antd";
import React, { useEffect, useRef, useState } from "react";
import "./index.less";
import ResultModal from "./resultModal";

interface ResultPageProps {
  data: any[]; //table数据
  onChange?: (data: any, selectedRowIndex: number) => void;
  selectedRowIndex?: any;
}

const ResultPage: React.FC<ResultPageProps> = ({ data, onChange }) => {
  const [state, setState] = useSetState<any>({
    isPrecisionModalOpen: false,
    precisionValue: {}, //当前点击数据类型的整行数据
    isEditModalOpen: false,
    editValue: {},
    tableData: [] as any[],
    totalCount: 0,
    selectedSeqId: null as number | null, // ⭐ 主锚（使用 condition_id）
    selectedRowIndex: -1, // 仅用于渲染高亮
    selectedRowData: null as any,
    // 请求中的行
    busyRow: null as null | {
      type: "insert" | "update" | "delete" | "move";
      key?: any;
    },
  });
  const {
    isPrecisionModalOpen,
    precisionValue,
    editValue,
    isEditModalOpen,
    selectedSeqId,
    selectedRowIndex,
    totalCount,
    tableData,
    busyRow,
    selectedRowData,
  } = state;
  const columns: any = [
    {
      title: "序号",
      dataIndex: "result_id",
      // valueType: "index",
      ellipsis: true,
      width: 80,
    },
    {
      title: "扩展名",
      dataIndex: "extension_name",
      // key: "extensionName",
      ellipsis: true,
    },
    {
      title: "变量名",
      ellipsis: true,
      dataIndex: "variable_name",
    },
    {
      title: "数据类型",
      dataIndex: "data_type",
      render: (text: any, record: any, index: any) => {
        return record.dataType == "Float[]" ||
          record.dataType == "int[]" ||
          record.dataType == "bytearray" ? (
          <a
            onClick={() => {
              setState({
                isPrecisionModalOpen: true,
                precisionValue: record,
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
      title: "编辑类型",
      ellipsis: true,
      dataIndex: "edit_type",
    },

    {
      title: "最小值下限",
      ellipsis: true,
      // dataIndex: "minOffValue",
      dataIndex: "min_lmt_Low",
    },
    {
      title: "最小值上限",
      ellipsis: true,
      // dataIndex: "minHighValue",
      dataIndex: "min_lmt_Upp",
    },
    {
      title: "最小值默认值",
      ellipsis: true,
      dataIndex: "min_Def",
      key: "minDefaultValue",
    },
    {
      title: "最大值下限",
      ellipsis: true,
      dataIndex: "max_lmt_Low",
      key: "maxOffValue",
    },
    {
      ellipsis: true,
      title: "最大值上限",
      dataIndex: "max_lmt_Upp",
      key: "maxHighValue",
    },
    {
      title: "最大值默认值",
      ellipsis: true,
      key: "maxDefaultValue",
      dataIndex: "max_Def",
    },
    {
      title: "精度",
      ellipsis: true,
      dataIndex: "precision",
    },

    {
      ellipsis: true,
      title: "数组大小",
      dataIndex: "array_size",
    },
    {
      title: "单位",
      ellipsis: true,
      dataIndex: "unit",
    },
    {
      title: "可见",
      ellipsis: true,
      dataIndex: "visibility",
      valueType: "select",
      key: "visible",
      valueEnum: {
        1: {
          text: "✓",
          status: "Success",
        },
        0: {
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
      width: 140,
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
  const resultRef = useRef<ActionType>();
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

  const handleRowClick = (record: any, index: number) => {
    setState({
      selectedSeqId: record?.condition_id ?? null,
      selectedRowIndex: index,
      selectedRowData: record,
    });
  };

  const afterMutate = () => {
    resultRef.current?.reload?.();
  };
  const handleInsertClick = () => {
    const newRowData = {
      id: Date.now(), // 使用时间戳作为唯一ID
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

  const requestData: any = async () => {
    const { code, data, message: msg } = await getResultList();
    if (code !== 0) {
      message.error(msg || "获取失败");
      setState({ totalCount: 0 });
      return { data: [], total: 0, success: false };
    }
    setState({ totalCount: data?.total_cnt });
    let list = data?.lib_lists || [];
    return {
      data: list,
      total: data?.total_cnt || list?.length,
      success: code === 0,
    };
  };
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
          // 当数据类型为 bytearray 时，除了默认值外其他都不可编辑
          const isDisabled =
            precisionValue.dataType === "bytearray" &&
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
                // backgroundColor: isDisabled ? "#f5f5f5" : "white",
              }}
              // disabled={isDisabled}
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

      // 对于 bytearray 类型，最大值和最小值保持原值不变
      let minOffValue,
        minHighValue,
        minDefaultValue,
        maxOffValue,
        maxHighValue,
        maxDefaultValue;
      if (precisionValue.dataType === "bytearray") {
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
      const newData = data.map((item: any) => {
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

      // 通知父组件更新数据
      onChange?.(newData, selectedRowIndex);

      setState({ isPrecisionModalOpen: false });
      message.success("数组设置保存成功");
    } catch (error) {
      console.error("保存数组设置时出错:", error);
      message.error("保存失败，请重试");
    }
  };
  const handleTableLoad = (ds: any[]) => {
    setState({ tableData: ds, totalCount: ds?.length || 0 });
    if (!ds.length) {
      setState({
        selectedSeqId: null,
        selectedRowIndex: -1,
        selectedRowData: null,
      });
      return;
    }

    let idx = -1;
    if (selectedSeqId != null) {
      idx = ds.findIndex(
        (r) => String(r?.result_id) === String(selectedSeqId) // 用 result_id 对齐
      );
    }
    if (idx < 0) {
      const fallback = state.selectedRowIndex >= 0 ? state.selectedRowIndex : 0;
      idx = Math.min(Math.max(fallback, 0), ds.length - 1);
    }

    console.log("idx", idx);

    handleRowClick(ds[idx], idx);
  };

  return (
    <div className="result-page tabs-page">
      <ProTable
        columns={columns}
        actionRef={resultRef}
        request={requestData}
        onLoad={handleTableLoad}
        rowKey={(row) => String(row?.result_id)}
        search={false}
        pagination={false}
        size="small"
        onRow={(record, index) => ({
          onClick: () => handleRowClick(record, index || 0),
        })}
        rowClassName={(record, index) =>
          selectedRowIndex === index ? "selected-row" : ""
        }
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
          const newData = data.map((item: any) => {
            if (item.id === editValue.id) {
              return { ...item, ...values };
            }
            return item;
          });

          onChange?.(newData, selectedRowIndex);
          setState({ isEditModalOpen: false });
          message.success("保存成功");
        }}
      />
      {/* <Modal title="编辑测试条件" open={isEditModalOpen}></Modal> */}
    </div>
  );
};

export default ResultPage;
