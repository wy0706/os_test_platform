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
import "./index.less";
import ConditionModal from "./modals/conditionModal";
import EditTypeModal from "./modals/editTypeModal";
import {
  dataTypeData,
  editTypeData,
  formatEnum,
  generateArrayColumns,
  parseArrayString,
  valueIsExist,
} from "./schemas";

interface ConditionsProps {
  /** 受控选中：稳定主键 id（不是 condition_id） */
  selectedId?: number | null;
  onSelectedChange?: (id: number | null, index: number) => void;
}

const Conditions: React.FC<ConditionsProps> = ({
  selectedId: controlledSelectedId,
  onSelectedChange,
}) => {
  const [state, setState] = useSetState<any>({
    // 弹窗状态
    isPrecisionModalOpen: false,
    precisionValue: null,
    isEditModalOpen: false,
    editValue: {},
    isEditTypeModalOpen: false,
    projectOption: [],

    // 表格数据
    tableData: [] as any[],
    totalCount: 0,

    // ✅ 以稳定 id 为选中锚
    selectedId: controlledSelectedId ?? null,
    selectedRowIndex: -1,
    selectedRowData: null as any,

    // 忙态
    busyRow: null as null | {
      type: "insert" | "update" | "delete" | "move";
      key?: any;
    },

    // 刷新后的选中策略
    pendingSelectId: null as number | null, // 优先：按 id 精准选中（移动/删除）
    pendingFocusIndex: null as number | null, // 兜底：按 index 选中

    // 插入差集定位（当 createOneCondition 不返回新 id 时使用）
    pendingInsertHint: null as {
      prevIdSet: Set<number>; // 插入前已有的 id 集合
      targetIndex: number; // 期望插入位置（多候选时最近优先）
    } | null,

    // 列表态
    isFetchingList: false,
    listReady: false,

    // 其它
    precisionModalLoading: false,
  });

  const {
    isEditTypeModalOpen,
    isPrecisionModalOpen,
    precisionValue,
    isEditModalOpen,
    editValue,
    projectOption,
    tableData,
    selectedRowIndex,
    precisionModalLoading,
    pendingSelectId,
    pendingFocusIndex,
    pendingInsertHint,
  } = state;

  const conditionRef = useRef<ActionType>();
  const [arrayTableData, setArrayTableData] = useState<any[]>([]);
  const isBusy = !!state.busyRow;
  const isInserting = state.busyRow?.type === "insert";

  const isINtAndCom = (dataType: any, editType: any) =>
    dataType === 11 && editType === 1;

  /** 选中行（以稳定 id），并回写父组件 */
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
    const APiFn = direction === "up" ? moveUpCondition : moveDownCondition;
    const newIndex = direction === "up" ? index - 1 : index + 1;

    try {
      setState({
        busyRow: { type: "move", key: record?.id },
        pendingSelectId: record?.id, // 精准命中当前这条
        pendingFocusIndex: newIndex, // 兜底：期望的新位置
      });

      const { code, message: msg } = await APiFn({
        condition_id: record.condition_id,
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

          const { code, message: msg } = await deleteConditon(row.condition_id);
          if (code !== 0) {
            message.error(msg || "操作失败");
            return;
          }
          message.success("删除成功");
          afterMutate();
        } catch (e: any) {
        } finally {
          setState({ busyRow: null });
        }
      },
    });
  };

  /** 插入：成功后选中新插入行；若接口不回 id → 用差集定位 */
  const handleInsertClick = async () => {
    // 目标插入位置（当前选中行之后 / 末尾）
    const targetIndex =
      selectedRowIndex >= 0 ? selectedRowIndex + 1 : tableData.length;

    // 供接口使用的顺序号（condition_id）
    const lastSeq = tableData?.length
      ? Math.max(...tableData.map((r: any) => Number(r.condition_id) || 0))
      : 0;
    const baseSeq =
      selectedRowIndex >= 0
        ? Number(tableData[selectedRowIndex]?.condition_id) || lastSeq
        : lastSeq;
    const targetConditionId = baseSeq + 1;

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

      const { code, message: msg } = await createOneCondition(
        targetConditionId
      );
      if (code !== 0) {
        message.error(msg || "插入失败");
        setState({ pendingInsertHint: null });
        return;
      }
      message.success(msg || `已在第 ${targetConditionId} 插入`);
      afterMutate(); // reload → handleTableLoad 做差集定位
    } catch (e: any) {
      setState({ pendingInsertHint: null });
    } finally {
      setState({ busyRow: null });
    }
  };

  const afterMutate = () => {
    conditionRef.current?.reload?.();
  };

  /** 请求数据 */
  const requestData: any = async () => {
    setState({ isFetchingList: true, listReady: false });
    try {
      const { code, data, message: msg } = await getConditonList();
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

    // 0) 插入差集定位（createOneCondition 不返回新 id 的情况下）
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

  // ====== 精度/数组设置逻辑 ======

  // 打开精度弹窗时初始化表格数据
  useEffect(() => {
    if (isPrecisionModalOpen && precisionValue) {
      initializeArrayTableData();
    }
  }, [isPrecisionModalOpen, precisionValue]);

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

  // 渲染数组设置表格
  const renderArraySettingTable = () => {
    if (!precisionValue) return null;
    const arraySize = precisionValue.array_size || 1;

    const tableColumns: any = [
      {
        title: "",
        dataIndex: "rowName",
        key: "rowName",
        width: 100,
        render: (t: string) => <strong>{t}</strong>,
      },
      ...Array.from({ length: arraySize }, (_, index) => ({
        title: `${index + 1}`,
        dataIndex: `col${index}`,
        key: `col${index}`,
        width: 120,
        align: "center",
        render: (text: string, record: any) => {
          const isbyte =
            precisionValue.data_type === 12 &&
            (record.key === "MinValue" || record.key === "MaxValue");

          const useSelect =
            isINtAndCom(precisionValue.data_type, precisionValue.edit_type) &&
            record.key === "DefaultValue";

          if (useSelect) {
            return (
              <Select
                value={text}
                onChange={(val) =>
                  handleArrayCellChange(record.key, `col${index}`, val)
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
              style={{ textAlign: "center" }}
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
          columns={tableColumns}
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
    setArrayTableData((prev) =>
      prev.map((row) =>
        row.key === rowKey ? { ...row, [colKey]: value } : row
      )
    );
  };

  // 数组弹窗确定
  const handleArrayModalConfirm = async () => {
    try {
      const arraySize = precisionValue.array_size || 1;

      const minRow = arrayTableData.find((row) => row.key === "MinValue");
      const maxRow = arrayTableData.find((row) => row.key === "MaxValue");
      const defaultRow = arrayTableData.find(
        (row) => row.key === "DefaultValue"
      );

      if (!minRow || !maxRow || !defaultRow) {
        message.error("数据不完整，请检查数组设置");
        return;
      }

      const extractArray = (row: any) =>
        Array.from({ length: arraySize }, (_, i) => {
          const val = row?.[`col${i}`];
          return val === undefined || val === null || val === "" ? "0" : val;
        });

      let minValue, maxValue, defaultValue;
      if (precisionValue.data_type === 12) {
        // 特殊类型：上下限保持原值
        minValue = precisionValue.min_value || "";
        maxValue = precisionValue.max_value || "";
      } else {
        minValue = JSON.stringify(extractArray(minRow));
        maxValue = JSON.stringify(extractArray(maxRow));
      }
      defaultValue = JSON.stringify(extractArray(defaultRow));

      const params = {
        ...precisionValue,
        min_value: minValue,
        max_value: maxValue,
        default_value: defaultValue,
      };

      setState({ precisionModalLoading: true });
      const { code, message: msg } = await updateOneCondition(params);
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");
      afterMutate();
      setState({
        isPrecisionModalOpen: false,
        projectOption: [],
        precisionValue: null,
      });
    } catch (error) {
      // noop
    } finally {
      setState({ precisionModalLoading: false });
    }
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
          const k = Object.keys(it)[0];
          return { label: k, value: k, key: it[k] };
        }
        return it;
      });
      return normalized;
    }
    return [];
  };

  const clearUpdateValue = (type: string) => {
    setState({ editValue: {} });
    if (type === "condition") setState({ isEditModalOpen: false });
    if (type === "editType") setState({ isEditTypeModalOpen: false });
  };

  const handleTableModalCancel = () => {
    setState({
      isPrecisionModalOpen: false,
      projectOption: [],
      precisionValue: null,
    });
  };

  /** 列定义（condition_id 仅用于展示顺序） */
  const columns: any = [
    { title: "序号", dataIndex: "condition_id", width: 80 },
    { title: "扩展名", dataIndex: "extension_name" },
    { title: "变量名", dataIndex: "variable_name" },
    {
      title: "数据类型",
      dataIndex: "data_type",
      render: (_: any, record: any) =>
        record.data_type === 10 ||
        record.data_type === 11 ||
        record.data_type === 12 ? (
          <a
            onClick={() => {
              setState({
                isPrecisionModalOpen: true,
                precisionValue: { ...record },
              });
              if (isINtAndCom(record.data_type, record.edit_type)) {
                setState({ projectOption: enumToOption(record) });
              }
            }}
          >
            {valueIsExist(record.data_type)
              ? dataTypeData[record.data_type]
              : "-"}
          </a>
        ) : (
          <span>
            {valueIsExist(record.data_type)
              ? dataTypeData[record.data_type]
              : "-"}
          </span>
        ),
    },
    {
      title: "编辑类型",
      dataIndex: "edit_type",
      render: (_: any, record: any) =>
        record.edit_type === 1 ? (
          <a
            onClick={() => {
              setState({ isEditTypeModalOpen: true, editValue: { ...record } });
            }}
          >
            {(valueIsExist(record.edit_type) &&
              editTypeData[record.edit_type]) ||
              "-"}
          </a>
        ) : (
          <span>
            {(valueIsExist(record.edit_type) &&
              editTypeData[record.edit_type]) ||
              "-"}
          </span>
        ),
    },
    { title: "最小值", dataIndex: "min_value" },
    { title: "最大值", dataIndex: "max_value" },
    { title: "默认值", dataIndex: "default_value" },
    { title: "精度", dataIndex: "precision" },
    {
      title: "枚举项目",
      dataIndex: "enum",
      render: (_: any, record: any) => <span>{formatEnum(record.enum)}</span>,
    },
    { title: "数组大小", dataIndex: "array_size" },
    { title: "单位", dataIndex: "unit" },
    {
      title: "可见",
      dataIndex: "visibility",
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
    <div className="conditions-page tabs-page">
      <ProTable
        columns={columns}
        actionRef={conditionRef}
        request={requestData}
        onLoad={handleTableLoad}
        loading={isBusy || state.isFetchingList}
        rowKey={(row) => String(row?.id)} // ✅ 稳定主键 id
        search={false}
        pagination={false}
        size="small"
        toolBarRender={() => [
          <Button
            key="button"
            loading={isInserting}
            disabled={isBusy || state.isFetchingList || !state.listReady}
            icon={<PlusOutlined />}
            onClick={handleInsertClick}
          >
            插入
          </Button>,
        ]}
        options={false}
        onRow={(record, index) => ({
          onClick: () => !isBusy && handleRowClick(record, index || 0),
        })}
        rowClassName={(_, index) =>
          selectedRowIndex === index ? "selected-row" : ""
        }
      />

      {/* 数组设置弹框 */}
      <Modal
        title="数组设置"
        open={isPrecisionModalOpen}
        onCancel={() =>
          setState({
            isPrecisionModalOpen: false,
            projectOption: [],
            precisionValue: null,
          })
        }
        width={800}
        destroyOnHidden
        confirmLoading={precisionModalLoading}
        footer={[
          <Button
            key="cancel"
            onClick={() =>
              setState({
                isPrecisionModalOpen: false,
                projectOption: [],
                precisionValue: null,
              })
            }
          >
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleArrayModalConfirm}>
            确定
          </Button>,
        ]}
      >
        {renderArraySettingTable()}
      </Modal>

      <ConditionModal
        open={isEditModalOpen}
        onCancel={() => setState({ isEditModalOpen: false, editValue: {} })}
        type="edit"
        updateValue={editValue}
        onOk={() => {
          setState({ isEditModalOpen: false, editValue: {} });
          afterMutate();
        }}
      />

      <EditTypeModal
        open={isEditTypeModalOpen}
        onCancel={() => setState({ isEditTypeModalOpen: false, editValue: {} })}
        onOk={() => {
          setState({ isEditTypeModalOpen: false, editValue: {} });
          afterMutate();
        }}
        updateValue={{ ...editValue }}
      />
    </div>
  );
};

export default Conditions;
