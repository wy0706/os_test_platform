import {
  createOneCondition,
  deleteConditon,
  getConditonList,
  moveDownCondition,
  moveUpCondition,
  updateOneCondition,
} from "@/services/case-management/test-sequence-edit.service";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { ActionType, ProTable } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Input, message, Modal, Select, Table } from "antd";
import React, { useEffect, useRef, useState } from "react";
import ConditionModal from "./conditionModal";
import EditTypeModal from "./editTypeModal";
import "./index.less";
import { formatEnum } from "./schemas";

interface ConditionsProps {
  data: any[]; //table数据
  onChange?: (data: any, selectedRowIndex: number) => void;
  selectedRowIndex?: any;
}

const Conditions: React.FC<ConditionsProps> = ({ data, onChange }) => {
  const [state, setState] = useSetState<any>({
    title: "",
    isPrecisionModalOpen: false,
    precisionValue: {}, //当前点击数据类型的整行数据
    isEditModalOpen: false,
    editValue: {},
    isEditTypeModalOpen: false,
    projectOption: [], //数组类型int[]并且CombiList ，把枚举项目转换成数组（符合select的）
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
    editTypeData: {
      0: "EditBox",
      1: "ComboList",
    },
    //  0:Float 1:int 2:bytes 10:Float[] 11:int[] 12:bytearray 43:str
    dataTypeData: {
      0: "Float",
      1: "int",
      2: "bytes",
      10: "Float[]",
      11: "int[]",
      12: "bytearray",
      43: "str",
    },
  });
  const {
    isEditTypeModalOpen,
    isPrecisionModalOpen,
    precisionValue,
    editValue,
    isEditModalOpen,
    projectOption,
    selectedSeqId,
    selectedRowIndex,
    tableData,
    editTypeData,
    dataTypeData,
  } = state;
  const isINtAndCom = (dataType: any, editType: any) => {
    return dataType === 11 && editType === 1;
  };
  const columns: any = [
    {
      title: "序号",
      dataIndex: "condition_id",
      width: 80,
    },
    {
      title: "扩展名",
      dataIndex: "extension_name",
    },
    {
      title: "变量名",
      dataIndex: "variable_name",
    },
    {
      title: "数据类型",
      dataIndex: "data_type",
      render: (text: any, record: any) => {
        return record.data_type === 10 ||
          record.data_type === 11 ||
          record.data_type === 12 ? (
          <a
            onClick={() => {
              setState({
                isPrecisionModalOpen: true,
                precisionValue: { ...record },
              });
              if (isINtAndCom(record.data_type, record.edit_type)) {
                const options = enumToOption(record);
                console.log("optins", options);

                setState({
                  projectOption: options,
                });
              }
              // if (record.data_type === 11 && record.edit_type === 1) {
              //   const options = parseOptionString(record.project);
              //   setState({
              //     projectOption: options,
              //   });
              // }
            }}
          >
            {dataTypeData[record.data_type]}
          </a>
        ) : (
          <span> {dataTypeData[record.data_type]}</span>
        );
      },
    },
    {
      title: "编辑类型",
      dataIndex: "edit_type",
      render: (text: any, record: any) => {
        return record.edit_type === 1 ? (
          <a
            onClick={() => {
              setState({
                isEditTypeModalOpen: true,
                editValue: { ...record },
              });
            }}
          >
            {editTypeData[record.edit_type]}
          </a>
        ) : (
          <span>{editTypeData[record.edit_type]}</span>
        );
      },
    },
    {
      title: "最小值",
      dataIndex: "min_value",
    },
    {
      title: "最大值",
      dataIndex: "max_value",
    },
    {
      title: "默认值",
      dataIndex: "default_value",
    },
    {
      title: "精度",
      dataIndex: "precision",
    },
    {
      title: "枚举项目",
      dataIndex: "enum",
      render: (_: any, record: any) => <span>{formatEnum(record.enum)}</span>,
    },
    {
      title: "数组大小",
      dataIndex: "array_size",
    },
    {
      title: "单位",
      dataIndex: "unit",
    },
    {
      title: "可见",
      dataIndex: "visibility",
      valueType: "select",
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
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      width: 140,
      render: (text: any, record: { id: any }, index: number) => {
        const isFirst = index === 0;
        const isLast = index === tableData.length - 1;

        return [
          <a
            key="editable"
            onClick={() => {
              setState({ isEditModalOpen: true, editValue: record });
            }}
            style={{ marginRight: 10, color: "#1677ff" }}
          >
            <EditOutlined style={{ marginRight: 4 }} />
          </a>,
          <a
            key="up"
            onClick={() => {
              if (!isFirst) {
                moveRow(record, index, "up");
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
            onClick={() => {
              if (!isLast) {
                moveRow(record, index, "down");
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
            onClick={() => {
              deleteRow(record, index);
            }}
            style={{ color: "#ff4d4f" }}
          >
            <DeleteOutlined style={{ marginRight: 4 }} />
          </a>,
        ];
      },
    },
  ];

  const conditionRef = useRef<ActionType>();
  // 数组设置弹框的表格数据
  const [arrayTableData, setArrayTableData] = useState<any[]>([]);

  useEffect(() => {
    // 当打开数组设置弹框时，初始化表格数据
    if (isPrecisionModalOpen && precisionValue) {
      initializeArrayTableData();
    }
  }, [isPrecisionModalOpen, precisionValue]);
  const moveRow = async (
    record: any,
    index: number,
    direction: "up" | "down"
  ) => {
    const APiFn = direction === "up" ? moveUpCondition : moveDownCondition;
    const delta = direction === "up" ? -1 : 1;

    try {
      setState({ busyRow: { type: "move", key: record?.condition_id } });
      const { code, message: msg } = await APiFn({
        condition_id: record.condition_id,
      });
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");

      // 若移动的是当前选中行，预判下一次选中的 seq_id
      if (state.selectedSeqId === record.condition_id) {
        setState({ selectedSeqId: record.condition_id + delta });
      }
      afterMutate();
    } catch (e: any) {
      message.error(e?.message || "操作失败");
    } finally {
      setState({ busyRow: null });
    }
  };

  const deleteRow = async (row: any, index: number) => {
    Modal.confirm({
      title: "确认删除吗？",
      onOk: async () => {
        try {
          setState({ busyRow: { type: "delete", key: row?.condition_id } });
          const { code, message: msg } = await deleteConditon(row.condition_id);
          if (code !== 0) {
            message.error(msg || "操作失败");
            return;
          }
          message.success("删除成功");

          // 如果删除的是选中行，预先调整选中 seq_id：优先选中“下一条”，否则“上一条”
          if (state.selectedSeqId === row.condition_id) {
            const isLast = index === state.tableData.length - 1;
            const nextSeqId = isLast ? row.condition_id - 1 : row.condition_id; // 中间删：下一条补位则 seq_id 不变
            setState({ selectedSeqId: nextSeqId >= 1 ? nextSeqId : null });
          }
          afterMutate();
        } catch (e: any) {
          message.error(e?.message || "操作失败");
        } finally {
          setState({ busyRow: null });
        }
      },
    });
  };
  // 点击行
  const handleRowClick = (record: any, index: number) => {
    setState({
      selectedSeqId: record?.condition_id ?? null,
      selectedRowIndex: index,
      selectedRowData: record,
    });
  };

  // 插入新行（基于当前选中行之后；若无选中则追加到末尾）
  const handleInsertClick = async () => {
    const lastId = state.tableData?.length
      ? Math.max(
          ...state.tableData.map((r: any) => Number(r.condition_id) || 0)
        )
      : 0;
    const targetSeqId = (state.selectedSeqId ?? lastId) + 1;

    try {
      setState({ busyRow: { type: "insert" } });
      const { code, message: msg } = await createOneCondition(targetSeqId);
      if (code !== 0) {
        message.error(msg || "插入失败");
        return;
      }
      message.success(msg || `已在第${targetSeqId}插入`);
      setState({ selectedSeqId: targetSeqId }); // 新插入行作为选中
      afterMutate();
    } catch (e: any) {
      message.error(e?.message || "插入失败");
    } finally {
      setState({ busyRow: null });
    }
  };

  const afterMutate = () => {
    conditionRef.current?.reload?.();
  };

  // 初始化数组表格数据
  const initializeArrayTableData = () => {
    const arraySize = precisionValue.array_size || 1;
    const minValues = parseArrayString(precisionValue.min_value);
    const maxValues = parseArrayString(precisionValue.max_value);
    const defaultValues = parseArrayString(precisionValue.default_value);

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

  const parseArrayString = (arrayString: string) => {
    if (arrayString === undefined || arrayString === null) return [];

    const str = String(arrayString).trim();
    if (!str) return [];

    // 如果是 JSON 数组格式（例如 "[0,0,0,0]"）
    if (str.startsWith("[") && str.endsWith("]")) {
      try {
        const arr = JSON.parse(str);
        if (Array.isArray(arr)) {
          return arr.map((item) => String(item).trim());
        }
      } catch (e) {
        // 解析失败则继续往下走
      }
    }

    // 普通逗号分隔形式
    if (str.includes(",")) {
      return str
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    // 单个值
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
    const arraySize = precisionValue.array_size || 1; //数组

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
          const isbyte =
            precisionValue.data_type === 12 &&
            (record.key === "MinValue" || record.key === "MaxValue");

          // const isDisabled =
          //   (precisionValue.data_type === "bytearray" &&
          //     (record.key === "MinValue" || record.key === "MaxValue")) ||
          //   (precisionValue.data_type === "int[]" &&
          //     precisionValue.edit_type === "ComboList" &&
          //     (record.key === "MinValue" || record.key === "MaxValue"));

          // const useSelect =
          //   precisionValue.data_type === "int[]" &&
          //   precisionValue.edit_type === "ComboList" &&
          //   record.key === "DefaultValue";
          const useSelect =
            isINtAndCom(precisionValue.data_type, precisionValue.edit_type) &&
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
              disabled={isbyte}
              onChange={(e) =>
                handleArrayCellChange(record.key, `col${index}`, e.target.value)
              }
              size="small"
              style={{
                textAlign: "center",
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
          数据类型: {dataTypeData[precisionValue.data_type] || ""} | 数组大小:{" "}
          {arraySize}
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
  const enumToOption = (record: any) => {
    if (record?.enum && Array.isArray(record.enum)) {
      const normalized = record.enum.map((it: any) => {
        if (
          it &&
          typeof it === "object" &&
          !("key" in it) &&
          !("value" in it)
        ) {
          // 形如 { item1: 1 }
          const k = Object.keys(it)[0];
          return { label: k, value: k, key: it[k] };
        }
        return it; // 形如 { key:'item1', value:1 }
      });

      return normalized;
    }
  };
  // 处理数组设置弹框确定按钮
  // 处理数组设置弹框确定按钮
  const handleArrayModalConfirm = async () => {
    try {
      const arraySize = precisionValue.array_size || 1;
      console.log("arrayTableData", arrayTableData);

      const minRow = arrayTableData.find((row) => row.key === "MinValue");
      const maxRow = arrayTableData.find((row) => row.key === "MaxValue");
      const defaultRow = arrayTableData.find(
        (row) => row.key === "DefaultValue"
      );

      if (!minRow || !maxRow || !defaultRow) {
        message.error("数据不完整，请检查数组设置");
        return;
      }

      // 辅助函数：从行中提取数组并自动补0
      const extractArray = (row: any) => {
        return Array.from({ length: arraySize }, (_, i) => {
          const val = row?.[`col${i}`];
          return val === undefined || val === null || val === "" ? "0" : val;
        });
      };

      let minValue, maxValue, defaultValue;

      if (precisionValue.data_type === 12) {
        // 特殊类型，直接使用已有值（字符串或其他格式）
        minValue = precisionValue.min_value || "";
        maxValue = precisionValue.max_value || "";
        // defaultValue = precisionValue.default_value || "";
      }
      // else {
      // 普通数组类型，转为 JSON 字符串数组
      minValue = JSON.stringify(extractArray(minRow));
      maxValue = JSON.stringify(extractArray(maxRow));
      defaultValue = JSON.stringify(extractArray(defaultRow));
      // }
      const params = {
        ...precisionValue,
        min_value: minValue,
        max_value: maxValue,
        default_value: defaultValue,
      };
      console.log("params", params);

      const { code, message: msg } = await updateOneCondition({
        ...params,
      });
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作失败");
      afterMutate();
      setState({
        isPrecisionModalOpen: false,
        projectOption: [],
        precisionValue: {},
      });
    } catch (error) {
      console.error("保存数组设置时出错:", error);
      message.error("保存失败，请重试");
    }
  };

  // const handleArrayModalConfirm = () => {
  //   try {
  //     const arraySize = precisionValue.array_size || 1;
  //     console.log("arrayTableData", arrayTableData);

  //     const minRow = arrayTableData.find((row) => row.key === "MinValue");
  //     const maxRow = arrayTableData.find((row) => row.key === "MaxValue");
  //     const defaultRow = arrayTableData.find(
  //       (row) => row.key === "DefaultValue"
  //     );

  //     console.log("minRow", minRow);
  //     console.log("maxRow", maxRow);
  //     console.log("defaultRow", defaultRow);

  //     if (!minRow || !maxRow || !defaultRow) {
  //       message.error("数据不完整，请检查数组设置");
  //       return;
  //     }
  //     let minValue, maxValue;
  //     if (precisionValue.data_type === 12) {
  //       minValue = precisionValue.min_value || "";
  //       maxValue = precisionValue.max_value || "";
  //     } else {
  //       minValue = Array.from(
  //         { length: arraySize },
  //         (_, i) => minRow?.[`col${i}`] || ""
  //       ).join(", ");
  //       maxValue = Array.from(
  //         { length: arraySize },
  //         (_, i) => maxRow?.[`col${i}`] || ""
  //       ).join(", ");
  //     }

  //     const defaultValue = Array.from(
  //       { length: arraySize },
  //       (_, i) => defaultRow?.[`col${i}`] || ""
  //     ).join(", ");

  //     const params = {
  //       min_value: minValue,
  //       max_value: maxValue,
  //       default_value: defaultValue,
  //       condition_id: precisionValue.condition_id,
  //     };
  //     console.log("params", params);

  //     return;

  //     setState({
  //       isPrecisionModalOpen: false,
  //       projectOption: [],
  //       precisionValue: {},
  //     });
  //     message.success("数组设置保存成功");
  //   } catch (error) {
  //     console.error("保存数组设置时出错:", error);
  //     message.error("保存失败，请重试");
  //   }
  // };

  const requestData: any = async () => {
    const { code, data, message: msg } = await getConditonList();
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
        (r) => String(r?.condition_id) === String(selectedSeqId) // ✅ 用 condition_id 对齐
      );
    }
    if (idx < 0) {
      const fallback = state.selectedRowIndex >= 0 ? state.selectedRowIndex : 0;
      idx = Math.min(Math.max(fallback, 0), ds.length - 1);
    }
    handleRowClick(ds[idx], idx);
  };

  const clearUpdateValue = (type: string) => {
    //type为condition是表示ConditionModal
    // 为editType 表示EditTypeModal
    setState({
      editValue: {},
    });
    switch (type) {
      case "condition":
        setState({ isEditModalOpen: false });
        return;
      case "editType":
        setState({
          isEditTypeModalOpen: false,
        });
        return;
      default:
        return;
    }
  };
  return (
    <div className="conditions-page tabs-page">
      <ProTable
        columns={columns}
        actionRef={conditionRef}
        request={requestData}
        onLoad={handleTableLoad}
        rowKey={(row) => String(row?.condition_id)}
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
        onCancel={() => clearUpdateValue("condition")}
        type="edit"
        updateValue={editValue}
        onOk={(values) => {
          clearUpdateValue("condition");
          afterMutate();
        }}
      />

      <EditTypeModal
        open={isEditTypeModalOpen}
        onCancel={() => clearUpdateValue("editType")}
        onOk={(values: any) => {
          clearUpdateValue("editType");
          afterMutate();
        }}
        updateValue={{
          ...editValue,
          // project: [
          //   // { first: "aa", last: "3" },
          //   // { first: "bb", last: "4" },
          // ],
        }}
      />
    </div>
  );
};

export default Conditions;
