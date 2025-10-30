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
import ResultModal from "./modals/resultModal";
import {
  dataTypeData,
  editTypeData,
  generateArrayColumns,
  parseArrayString,
  valueIsExist,
} from "./schemas";

interface ResultPageProps {
  /** 受控选中：稳定主键 id（不是 result_id） */
  selectedId?: number | null;
  onSelectedChange?: (id: number | null, index: number) => void;
}

const ResultPage: React.FC<ResultPageProps> = ({
  selectedId: controlledSelectedId,
  onSelectedChange,
}) => {
  const [state, setState] = useSetState<any>({
    isPrecisionResultOpen: false,
    precisionValue: null,
    isEditModalOpen: false,
    editValue: {},
    tableData: [] as any[],
    totalCount: 0,

    // ✅ 以稳定 id 为选中锚
    selectedId: controlledSelectedId ?? null,
    selectedRowIndex: -1,
    selectedRowData: null as any,

    // 请求中的行
    busyRow: null as null | {
      type: "insert" | "update" | "delete" | "move";
      key?: any;
    },

    // 刷新后的选中策略
    pendingSelectId: null as number | null, // 优先：按 id 精准选中（移动/删除）
    pendingFocusIndex: null as number | null, // 兜底：按 index 选中

    // 插入差集定位（当 createOneResult 不返回新 id 时使用）
    pendingInsertHint: null as {
      prevIdSet: Set<number>; // 插入前已有的 id 集合
      targetIndex: number; // 期望插入位置（多候选时最近优先）
    } | null,

    // 列表态
    isFetchingList: false,
    listReady: false,

    // 其它
    precisionResultLoading: false,
  });

  const {
    isPrecisionResultOpen,
    precisionValue,
    editValue,
    isEditModalOpen,
    selectedRowIndex,
    tableData,
    busyRow,
    precisionResultLoading,
    pendingSelectId,
    pendingFocusIndex,
    pendingInsertHint,
  } = state;

  const resultRef = useRef<ActionType>();
  const [arrayTableData, setArrayTableData] = useState<any[]>([]);
  const isBusy = !!busyRow;
  const isInserting = busyRow?.type === "insert";

  /** 高亮 + 回写父组件（以稳定 id） */
  const handleRowClick = (record: any, index: number) => {
    const id = record?.id ?? null;
    setState({
      selectedId: id,
      selectedRowIndex: index,
      selectedRowData: record,
    });
    onSelectedChange?.(id, index);
  };

  /** 取离 target 最近的索引 */
  const nearestIndex = (target: number, indexes: number[]) => {
    if (!indexes.length) return -1;
    let best = indexes[0];
    let bestDiff = Math.abs(indexes[0] - target);
    for (let i = 1; i < indexes.length; i++) {
      const d = Math.abs(indexes[i] - target);
      if (d < bestDiff) {
        best = indexes[i];
        bestDiff = d;
      }
    }
    return best;
  };

  /** 上/下移：移动成功后仍选中“当前这条”（按稳定 id 对焦） */
  const moveRow = async (
    record: any,
    index: number,
    direction: "up" | "down"
  ) => {
    const APiFn = direction === "up" ? moveUpResult : moveDownResult;
    const newIndex = direction === "up" ? index - 1 : index + 1;

    try {
      setState({
        busyRow: { type: "move", key: record?.id },
        pendingSelectId: record?.id, // 精准选中当前这一条
        pendingFocusIndex: newIndex, // 兜底：期望的新位置
      });

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

  /** 删除：成功后选中“同 index 的行”，末尾则上一行（尽量也用 id 精确） */
  const deleteRow = async (row: any, index: number) => {
    Modal.confirm({
      title: "确认删除吗？",
      onOk: async () => {
        try {
          const isLast = index === tableData.length - 1;
          const targetIndex = isLast ? index - 1 : index;
          const neighbor =
            targetIndex >= 0 && targetIndex < tableData.length
              ? tableData[targetIndex]
              : null;

          setState({
            busyRow: { type: "delete", key: row?.id },
            pendingSelectId: neighbor ? neighbor.id : null,
            pendingFocusIndex: neighbor ? targetIndex : null,
          });

          const { code, message: msg } = await deleteResult(row.result_id);
          if (code !== 0) {
            message.error(msg || "操作失败");
            return;
          }
          message.success("删除成功");
          afterMutate();
        } catch (e: any) {
          message.error(e?.message || "操作失败");
        } finally {
          setState({ busyRow: null });
        }
      },
    });
  };

  /** 插入新行：成功后选中新插入行；若接口不回 id → 用差集定位 */
  const handleInsertClick = async () => {
    // 目标插入位置（当前选中行之后 / 末尾）
    const targetIndex =
      selectedRowIndex >= 0 ? selectedRowIndex + 1 : tableData.length;

    // 供接口使用的顺序号（result_id）
    const lastRid = tableData?.length
      ? Math.max(...tableData.map((r: any) => Number(r.result_id) || 0))
      : 0;
    const baseRid =
      selectedRowIndex >= 0
        ? Number(tableData[selectedRowIndex]?.result_id) || lastRid
        : lastRid;
    const targetResultId = baseRid + 1;

    // 插入前的 id 集合：reload 后用差集定位新行
    const prevIdSet = new Set<number>(
      tableData.map((r: any) => Number(r?.id)).filter((x) => !Number.isNaN(x))
    );

    try {
      setState({
        busyRow: { type: "insert" },
        pendingSelectId: null, // 等待差集定位
        pendingFocusIndex: targetIndex,
        pendingInsertHint: { prevIdSet, targetIndex },
      });

      const { code, message: msg } = await createOneResult(targetResultId);
      if (code !== 0) {
        message.error(msg || "插入失败");
        setState({ pendingInsertHint: null });
        return;
      }
      message.success(msg || `已在第 ${targetResultId} 插入`);
      afterMutate(); // reload → handleTableLoad 做差集定位
    } catch (e: any) {
      setState({ pendingInsertHint: null });
    } finally {
      setState({ busyRow: null });
    }
  };

  const afterMutate = () => {
    resultRef.current?.reload?.();
  };

  /** 表格加载后决定选中（优先级：插入差集 → pendingSelectId → 受控 id → pendingFocusIndex → 之前 index/0） */
  const handleTableLoad = (ds: any[]) => {
    setState({ tableData: ds, totalCount: ds?.length || 0 });

    if (!ds.length) {
      setState({
        selectedId: null,
        selectedRowIndex: -1,
        selectedRowData: null,
        pendingFocusIndex: null,
        pendingSelectId: null,
        pendingInsertHint: null,
      });
      onSelectedChange?.(null, -1);
      return;
    }

    // 0) 插入差集定位（createOneResult 不返回新 id 的情况下）
    if (pendingInsertHint && !pendingSelectId) {
      const { prevIdSet, targetIndex } = pendingInsertHint;
      const candidates: number[] = [];
      ds.forEach((r, idx) => {
        const id = Number(r?.id);
        if (!Number.isNaN(id) && !prevIdSet.has(id)) {
          candidates.push(idx);
        }
      });
      if (candidates.length > 0) {
        const pick = nearestIndex(targetIndex, candidates);
        const idx = pick >= 0 ? pick : candidates[0];
        handleRowClick(ds[idx], idx);
        setState({ pendingInsertHint: null, pendingFocusIndex: null });
        return;
      }
      setState({ pendingInsertHint: null });
    }

    // 1) 刚刚操作指定了 pendingSelectId（移动/删除）
    if (pendingSelectId != null) {
      const i = ds.findIndex((r) => String(r?.id) === String(pendingSelectId));
      if (i >= 0) {
        handleRowClick(ds[i], i);
        setState({ pendingSelectId: null, pendingFocusIndex: null });
        return;
      }
      setState({ pendingSelectId: null });
    }

    // 2) 父组件受控 id
    if (controlledSelectedId != null) {
      const i = ds.findIndex(
        (r) => String(r?.id) === String(controlledSelectedId)
      );
      if (i >= 0) {
        handleRowClick(ds[i], i);
        setState({ pendingFocusIndex: null });
        return;
      }
    }

    // 3) 兜底：pendingFocusIndex（按位置）
    if (pendingFocusIndex != null) {
      const i = Math.min(Math.max(pendingFocusIndex, 0), ds.length - 1);
      handleRowClick(ds[i], i);
      setState({ pendingFocusIndex: null });
      return;
    }

    // 4) 最终兜底：沿用原 index 或第 0 行
    const fallback = selectedRowIndex >= 0 ? selectedRowIndex : 0;
    const idx = Math.min(Math.max(fallback, 0), ds.length - 1);
    handleRowClick(ds[idx], idx);
  };

  /** 请求数据 */
  const requestData: any = async () => {
    setState({ isFetchingList: true, listReady: false });
    try {
      const { code, data, message: msg } = await getResultList();
      if (code !== 0) {
        message.error(msg || "获取失败");
        setState({ totalCount: 0, listReady: false });
        return { data: [], total: 0, success: false };
      }
      setState({ totalCount: data?.total_cnt, listReady: true });
      const list = data?.lib_lists || [];
      return {
        data: list,
        total: data?.total_cnt || list?.length,
        success: true,
      };
    } finally {
      setState({ isFetchingList: false });
    }
  };

  /** 初始化数组设置表格数据（打开精度弹窗时） */
  useEffect(() => {
    if (isPrecisionResultOpen && precisionValue) {
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
    }
  }, [isPrecisionResultOpen, precisionValue]);

  /** 数组表格渲染与保存 */
  const renderArraySettingTable = () => {
    if (!precisionValue) return null;
    const arraySize = precisionValue.array_size || 1;
    const columns: any = [
      {
        title: "",
        dataIndex: "rowName",
        key: "rowName",
        width: 100,
        render: (t: string) => <strong>{t}</strong>,
      },
      ...Array.from({ length: arraySize }, (_, idx) => ({
        title: `${idx + 1}`,
        dataIndex: `col${idx}`,
        key: `col${idx}`,
        align: "center",
        width: 80,
        render: (text: string, record: any) => {
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
                handleArrayCellChange(record.key, `col${idx}`, e.target.value)
              }
              disabled={isbyte}
              size="small"
              style={{ textAlign: "center" }}
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

  const handleArrayCellChange = (
    rowKey: string,
    colKey: string,
    value: string
  ) => {
    setArrayTableData((prev) =>
      prev.map((row) =>
        row.key === rowKey ? { ...row, [colKey]: value } : row
      )
    );
  };

  const handleArrayModalConfirm = async () => {
    try {
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

      const extractArray = (row: any) =>
        Array.from({ length: arraySize }, (_, i) => {
          const val = row?.[`col${i}`];
          return val === undefined || val === null || val === "" ? "0" : val;
        });

      let minOffValue,
        minHighValue,
        minDefaultValue,
        maxOffValue,
        maxHighValue,
        maxDefaultValue;
      if (precisionValue.dataType === 12) {
        // bytearray: 上下限保持原值
        minOffValue = precisionValue.min_lmt_Low || "";
        minHighValue = precisionValue.min_lmt_Upp || "";
        maxOffValue = precisionValue.max_lmt_Low || "";
        maxHighValue = precisionValue.max_lmt_Upp || "";
      } else {
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

      setState({ precisionResultLoading: true });
      const { code, message: msg } = await updateOneResult(params);
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");
      setState({ isPrecisionResultOpen: false, precisionValue: null });
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

  const columns: any = [
    { title: "序号", dataIndex: "result_id", ellipsis: true, width: 80 }, // 展示顺序
    { title: "扩展名", dataIndex: "extension_name", ellipsis: true },
    { title: "变量名", dataIndex: "variable_name", ellipsis: true },
    {
      title: "数据类型",
      dataIndex: "data_type",
      render: (_: any, record: any) =>
        record.data_type === 10 ||
        record.data_type === 11 ||
        record.data_type === 12 ? (
          <a
            onClick={() => {
              setState({ isPrecisionResultOpen: true, precisionValue: record });
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
        ),
    },
    {
      title: "编辑类型",
      dataIndex: "edit_type",
      ellipsis: true,
      render: (_: any, record: any) => (
        <span>
          {(valueIsExist(record.edit_type) && editTypeData[record.edit_type]) ||
            "-"}
        </span>
      ),
    },
    { title: "最小值下限", dataIndex: "min_lmt_Low", ellipsis: true },
    { title: "最小值上限", dataIndex: "min_lmt_Upp", ellipsis: true },
    { title: "最小值默认值", dataIndex: "min_Def", ellipsis: true },
    { title: "最大值下限", dataIndex: "max_lmt_Low", ellipsis: true },
    { title: "最大值上限", dataIndex: "max_lmt_Upp", ellipsis: true },
    { title: "最大值默认值", dataIndex: "max_Def", ellipsis: true },
    { title: "精度", dataIndex: "precision", ellipsis: true },
    { title: "数组大小", dataIndex: "array_size", ellipsis: true },
    { title: "单位", dataIndex: "unit", ellipsis: true },
    {
      title: "可见",
      dataIndex: "visibility",
      ellipsis: true,
      valueType: "select",
      valueEnum: {
        1: { text: "✓", status: "Success" },
        0: { text: "✗", status: "Error" },
      },
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      width: 140,
      render: (_: any, record: any, index: number) => {
        const isFirst = index === 0;
        const isLast = index === tableData.length - 1;
        return [
          <a
            key="editable"
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(record, index);
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
              if (!isFirst && !isBusy) moveRow(record, index, "up");
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
              if (!isLast && !isBusy) moveRow(record, index, "down");
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
                const isLastRow = index === tableData.length - 1;
                const targetIndex = isLastRow ? index - 1 : index;
                const neighbor =
                  targetIndex >= 0 && targetIndex < tableData.length
                    ? tableData[targetIndex]
                    : null;
                setState({
                  pendingFocusIndex: neighbor ? targetIndex : null,
                  pendingSelectId: neighbor ? neighbor.id : null,
                });
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

  return (
    <div className="result-page tabs-page">
      <ProTable
        columns={columns}
        actionRef={resultRef}
        request={requestData}
        onLoad={handleTableLoad}
        rowKey={(row) => String(row?.id)} // ✅ 稳定主键 id
        search={false}
        pagination={false}
        loading={isBusy || state.isFetchingList}
        size="small"
        onRow={(record, index) => ({
          onClick: () => !isBusy && handleRowClick(record, index || 0),
        })}
        rowClassName={(_record, index) =>
          selectedRowIndex === index ? "selected-row" : ""
        }
        toolBarRender={() => [
          <Button
            loading={isInserting}
            disabled={isBusy || state.isFetchingList || !state.listReady}
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
          <Button key="submit" type="primary" onClick={handleArrayModalConfirm}>
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
        onOk={() => {
          setState({ isEditModalOpen: false, editValue: {} });
          afterMutate();
        }}
      />
    </div>
  );
};

export default ResultPage;
