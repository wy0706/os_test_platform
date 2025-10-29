import {
  createOneResult,
  deleteResult,
  getResultList,
  moveDownResult,
  moveUpResult,
  updateOneResult,
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
import { Button, Input, message, Modal, Table } from "antd";
import React, { useEffect, useRef, useState } from "react";
import "./index.less";
import ResultModal from "./resultModal";
import {
  dataTypeData,
  editTypeData,
  generateArrayColumns,
  parseArrayString,
  valueIsExist,
} from "./schemas";

interface ResultPageProps {
  onChange?: (data: any, selectedRowIndex: number) => void;
  selectedRowIndex?: any;
}

const ResultPage: React.FC<ResultPageProps> = ({ onChange }) => {
  const [state, setState] = useSetState<any>({
    isPrecisionResultOpen: false,
    precisionValue: null, //当前点击数据类型的整行数据
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
    precisionResultLoading: false,
    pendingFocusIndex: null as number | null, // 刷新后优先用它来选中
  });
  const {
    isPrecisionResultOpen,
    precisionValue,
    editValue,
    isEditModalOpen,
    selectedSeqId,
    selectedRowIndex,
    totalCount,
    tableData,
    busyRow,
    selectedRowData,
    precisionResultLoading,
  } = state;
  const isBusy = !!state.busyRow;
  const isInserting = state.busyRow?.type === "insert";
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
      render: (text: any, record: any) => {
        return record.data_type === 10 ||
          record.data_type === 11 ||
          record.data_type === 12 ? (
          <a
            onClick={() => {
              setState({
                isPrecisionResultOpen: true,
                precisionValue: record,
              });
            }}
          >
            {(valueIsExist(record.data_type) &&
              dataTypeData[record.data_type]) ||
              "-"}
          </a>
        ) : (
          <span>
            {(valueIsExist(record.data_type) &&
              dataTypeData[record.data_type]) ||
              "-"}
          </span>
        );
      },
    },
    {
      title: "编辑类型",
      ellipsis: true,
      dataIndex: "edit_type",
      render: (text: any, record: any) => {
        return (
          <span>
            {(valueIsExist(record.edit_type) &&
              editTypeData[record.edit_type]) ||
              "-"}
          </span>
        );
      },
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
        const isFirst = index === 0;
        const isLast = index === tableData.length - 1;
        return [
          <a
            key="editable"
            onClick={(e) => {
              e.stopPropagation();
              ensureSelected(record, index);
              setState({
                isEditModalOpen: true,
                editValue: record,
                pendingFocusIndex: index,
              });
            }}
            style={{ marginRight: 10, color: "#1677ff" }}
          >
            <EditOutlined style={{ marginRight: 4 }} />
          </a>,
          <a
            key="up"
            onClick={(e) => {
              e.stopPropagation();
              if (!isFirst && !isBusy) {
                ensureSelected(record, index);
                setState({ pendingFocusIndex: index - 1 }); // 目标行新位置
                moveRow(record, index, "up");
              }
            }}
            style={{
              marginRight: 10,
              cursor: isFirst || isBusy ? "not-allowed" : "pointer",
              opacity: isFirst || isBusy ? 0.5 : 1,
              color: isFirst || isBusy ? "#ccc" : "#1677ff",
            }}
          >
            <ArrowUpOutlined style={{ marginRight: 4 }} />
          </a>,
          <a
            key="down"
            onClick={(e) => {
              e.stopPropagation();
              if (!isLast && !isBusy) {
                ensureSelected(record, index);
                setState({ pendingFocusIndex: index + 1 });
                moveRow(record, index, "down");
              }
            }}
            style={{
              marginRight: 10,
              cursor: isLast || isBusy ? "not-allowed" : "pointer",
              opacity: isLast || isBusy ? 0.5 : 1,
              color: isLast || isBusy ? "#ccc" : "#1677ff",
            }}
          >
            <ArrowDownOutlined style={{ marginRight: 4 }} />
          </a>,
          <a
            key="delete"
            onClick={(e) => {
              e.stopPropagation();

              if (!isBusy) {
                ensureSelected(record, index);
                const target = isLast ? index - 1 : index;
                setState({ pendingFocusIndex: target >= 0 ? target : null });
                deleteRow(record, index);
              }
            }}
            style={{ color: "#ff4d4f" }}
          >
            <DeleteOutlined style={{ marginRight: 4 }} />
          </a>,
        ];
      },
    },
  ];
  const ensureSelected = (record: any, index: number) => {
    setState({
      selectedSeqId: record?.result_id ?? null,
      selectedRowIndex: index,
      selectedRowData: record,
    });
  };
  // 数组设置弹框的表格数据
  const [arrayTableData, setArrayTableData] = useState<any[]>([]);
  const resultRef = useRef<ActionType>();
  useEffect(() => {
    // 当打开数组设置弹框时，初始化表格数据
    if (isPrecisionResultOpen && precisionValue) {
      initializeArrayTableData();
    }
  }, [isPrecisionResultOpen, precisionValue]);

  const moveRow = async (
    record: any,
    index: number,
    direction: "up" | "down"
  ) => {
    const APiFn = direction === "up" ? moveUpResult : moveDownResult;
    const delta = direction === "up" ? -1 : 1;

    try {
      setState({ busyRow: { type: "move", key: record?.result_id } });
      const { code, message: msg } = await APiFn({
        result_id: record.result_id,
      });
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");

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
          setState({ busyRow: { type: "delete", key: row?.result_id } });
          const { code, message: msg } = await deleteResult(row.result_id);
          if (code !== 0) {
            message.error(msg || "操作失败");
            return;
          }
          message.success("删除成功");

          // 如果删除的是选中行，预先调整选中 seq_id：优先选中“下一条”，否则“上一条”
          if (state.selectedSeqId === row.result_id) {
            const isLast = index === state.tableData.length - 1;
            const nextSeqId = isLast ? row.result_id - 1 : row.result_id; // 中间删：下一条补位则 seq_id 不变
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

  const handleRowClick = (record: any, index: number) => {
    setState({
      selectedSeqId: record?.result_id ?? null,
      selectedRowIndex: index,
      selectedRowData: record,
    });
  };
  // 插入新行（基于当前选中行之后；若无选中则追加到末尾）
  const handleInsertClick = async () => {
    const lastId = state.tableData?.length
      ? Math.max(...state.tableData.map((r: any) => Number(r.result_id) || 0))
      : 0;
    const targetSeqId = (state.selectedSeqId ?? lastId) + 1;
    const targetIndex =
      state.selectedRowIndex >= 0
        ? state.selectedRowIndex + 1
        : state.tableData.length; // 没选中就追加到末尾并聚焦末尾
    try {
      setState({ busyRow: { type: "insert" }, pendingFocusIndex: targetIndex });
      const { code, message: msg } = await createOneResult(targetSeqId);
      if (code !== 0) {
        message.error(msg || "插入失败");
        return;
      }
      message.success(msg || `已在第${targetSeqId}插入`);
      // setState({ selectedSeqId: targetSeqId }); // 新插入行作为选中
      afterMutate();
    } catch (e: any) {
      message.error(e?.message || "插入失败");
    } finally {
      setState({ busyRow: null });
    }
  };

  const afterMutate = () => {
    resultRef.current?.reload?.();
  };

  const handleTableLoad = (ds: any[]) => {
    setState({ tableData: ds, totalCount: ds?.length || 0 });

    if (!ds.length) {
      setState({
        selectedSeqId: null,
        selectedRowIndex: -1,
        selectedRowData: null,
        pendingFocusIndex: null, // 清掉
      });
      return;
    }

    // ⭐ 1) 优先用 pendingFocusIndex
    if (state.pendingFocusIndex != null) {
      const i = Math.min(Math.max(state.pendingFocusIndex, 0), ds.length - 1);
      handleRowClick(ds[i], i);
      setState({ pendingFocusIndex: null });
      return;
    }

    // 2) 再用 selectedSeqId（如果你仍想保留）
    let idx = -1;
    if (state.selectedSeqId != null) {
      idx = ds.findIndex(
        (r) => String(r?.result_id) === String(state.selectedSeqId)
      );
    }

    // 3) 兜底用上次的 index / 0
    if (idx < 0) {
      const fallback = state.selectedRowIndex >= 0 ? state.selectedRowIndex : 0;
      idx = Math.min(Math.max(fallback, 0), ds.length - 1);
    }
    handleRowClick(ds[idx], idx);
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
    const arraySize = precisionValue.array_size || 1;
    const minOffValues = parseArrayString(precisionValue.min_lmt_Low);
    const minHighValues = parseArrayString(precisionValue.min_lmt_Upp);
    const minDefaultValues = parseArrayString(precisionValue.min_Def);
    const maxOffValues = parseArrayString(precisionValue.max_lmt_Low);
    const maxHighValues = parseArrayString(precisionValue.max_lmt_Upp);
    const maxDefaultValues = parseArrayString(precisionValue.max_Def);

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

  // 渲染数组设置表格
  const renderArraySettingTable = () => {
    if (!precisionValue) return null;
    const arraySize = precisionValue.array_size || 1;
    // 动态生成表格列
    const columns: any = [
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
        align: "center",
        width: 80,
        render: (text: string, record: any) => {
          // 当数据类型为 bytearray 时，除了默认值外其他都不可编辑
          // const isDisabled =
          //   precisionValue.dataType === "bytearray" &&
          //   (record.key === "MinOffValue" ||
          //     record.key === "MinHighValue" ||
          //     record.key === "MaxOffValue" ||
          //     record.key === "MaxHighValue");
          const isbyte =
            precisionValue.data_type === 12 &&
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
              disabled={isbyte}
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
          数据类型:{" "}
          {(valueIsExist(precisionValue.data_type) &&
            dataTypeData[precisionValue.data_type]) ||
            "-"}{" "}
          | 数组大小: {arraySize}
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
  const handleArrayModalConfirm = async () => {
    try {
      // 将表格数据转换回字符串格式
      const arraySize = precisionValue.array_size || 1;
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
      // 辅助函数：从行中提取数组并自动补0
      const extractArray = (row: any) => {
        return Array.from({ length: arraySize }, (_, i) => {
          const val = row?.[`col${i}`];
          return val === undefined || val === null || val === "" ? "0" : val;
        });
      };
      console.log(
        minOffRow,
        minHighRow,
        minDefaultRow,
        maxOffRow,
        maxHighRow,
        maxDefaultRow
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
      if (precisionValue.dataType === 12) {
        // 保持原来的值
        minOffValue = precisionValue.min_lmt_Low || "";
        minHighValue = precisionValue.min_lmt_Upp || "";
        maxOffValue = precisionValue.max_lmt_Low || "";
        maxHighValue = precisionValue.max_lmt_Upp || "";
      } else {
        //   // 其他类型正常更新
        minOffValue = JSON.stringify(extractArray(minOffRow));
        minHighValue = JSON.stringify(extractArray(minHighRow));
        maxOffValue = JSON.stringify(extractArray(maxOffRow));
        maxHighValue = JSON.stringify(extractArray(maxHighRow));
      }
      minDefaultValue = JSON.stringify(extractArray(minDefaultRow));
      maxDefaultValue = JSON.stringify(extractArray(maxDefaultRow));
      const params = {
        ...precisionValue,
        min_lmt_Low: minOffValue,
        min_lmt_Upp: minHighValue,
        min_Def: minDefaultValue,
        max_lmt_Low: maxOffValue,
        max_lmt_Upp: maxHighValue,
        max_Def: maxDefaultValue,
      };

      console.log("params", params);

      setState({ precisionResultLoading: true });
      // 调用更新接口
      // await updateTestCondition(params);
      // 模拟接口调用延时
      const { code, message: msg } = await updateOneResult(params);

      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");
      setState({
        isPrecisionResultOpen: false,
        precisionValue: null,
      });
      afterMutate();
    } catch (error) {
      console.error("保存数组设置时出错:", error);
    } finally {
      setState({ precisionResultLoading: false });
    }
  };

  const handleModalCancel = () => {
    setState({ isPrecisionResultOpen: false, precisionValue: null });
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
        loading={isBusy}
        size="small"
        onRow={(record, index) => ({
          onClick: () => !isBusy && handleRowClick(record, index || 0),
        })}
        rowClassName={(record, index) =>
          selectedRowIndex === index ? "selected-row" : ""
        }
        toolBarRender={() => [
          <Button
            loading={isInserting}
            disabled={isBusy}
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
        open={isPrecisionResultOpen}
        onCancel={handleModalCancel}
        width={800}
        destroyOnHidden
        confirmLoading={precisionResultLoading}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
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
        onCancel={() => setState({ isEditModalOpen: false, editValue: {} })}
        type="edit"
        updateValue={editValue}
        onOk={(values) => {
          setState({ isEditModalOpen: false, editValue: {} });
          afterMutate();
        }}
      />
      {/* <Modal title="编辑测试条件" open={isEditModalOpen}></Modal> */}
    </div>
  );
};

export default ResultPage;
