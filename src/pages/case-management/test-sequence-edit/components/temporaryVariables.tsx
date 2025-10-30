import {
  createOneTemp,
  deleteTemp,
  getTempList,
  moveDownTemp,
  moveUpTemp,
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
import { Button, message, Modal } from "antd";
import React, { useRef } from "react";
import TempModal from "./modals/tempModal";
import { dataTypeData } from "./schemas";

interface ConditionsProps {
  /** 受控：选中的稳定主键 id（不是 temp_id） */
  selectedId?: number | null;
  onSelectedChange?: (id: number | null, index: number) => void;
}

const TemporaryVariables: React.FC<ConditionsProps> = ({
  selectedId: controlledSelectedId,
  onSelectedChange,
}) => {
  const [state, setState] = useSetState<any>({
    isEditModalOpen: false,
    editValue: {},
    tableData: [] as any[],
    totalCount: 0,

    // 以稳定 id 为选中锚
    selectedId: controlledSelectedId ?? null,
    selectedRowIndex: -1,
    selectedRowData: null as any,

    // 请求中的行
    busyRow: null as null | {
      type: "insert" | "update" | "delete" | "move";
      key?: any;
    },

    // 刷新后选中策略
    pendingSelectId: null as number | null, // 优先：按稳定 id 精准选中
    pendingFocusIndex: null as number | null, // 兜底：按 index 选中

    // 插入差集线索（createOneTemp 不返回新 id 时使用）
    pendingInsertHint: null as {
      prevIdSet: Set<number>; // 插入前已有的 id 集合
      targetIndex: number; // 期望插入位置（多候选时最近优先）
    } | null,

    // 列表请求态
    isFetchingList: false,
    listReady: false,
  });

  const tempRef = useRef<ActionType>();
  const isBusy = !!state.busyRow;
  const isInserting = state.busyRow?.type === "insert";

  const {
    isEditModalOpen,
    editValue,
    tableData,
    selectedRowIndex,
    pendingSelectId,
    pendingFocusIndex,
    pendingInsertHint,
  } = state;

  /** 高亮 + 回写父组件（以稳定 id） */
  const handleRowClick = (record: any, index: number) => {
    setState({
      selectedId: record?.id ?? null,
      selectedRowIndex: index,
      selectedRowData: record,
    });
    onSelectedChange?.(record?.id ?? null, index);
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

  /** 上/下移：移动成功后仍选中“当前这条”（按稳定 id 对焦），高亮随新位置 */
  const moveRow = async (
    record: any,
    index: number,
    direction: "up" | "down"
  ) => {
    const APiFn = direction === "up" ? moveUpTemp : moveDownTemp;
    const newIndex = direction === "up" ? index - 1 : index + 1;

    try {
      setState({
        busyRow: { type: "move", key: record?.id },
        pendingSelectId: record?.id, // 精准命中当前这条
        pendingFocusIndex: newIndex, // 兜底期望 index
      });
      const { code, message: msg } = await APiFn({ temp_id: record.temp_id });
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

          const { code, message: msg } = await deleteTemp(row.temp_id);
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
    // 计算插入位置（当前行后 / 末尾）与用于接口的目标顺序号
    const targetIndex =
      state.selectedRowIndex >= 0
        ? state.selectedRowIndex + 1
        : tableData.length;

    const lastTempId = tableData?.length
      ? Math.max(...tableData.map((r: any) => Number(r.temp_id) || 0))
      : 0;
    const baseTempId =
      state.selectedRowIndex >= 0
        ? Number(tableData[state.selectedRowIndex]?.temp_id) || lastTempId
        : lastTempId;
    const targetTempId = baseTempId + 1;

    // 插入前的 id 集合，用于差集定位新行
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

      const { code, message: msg /*, data*/ } = await createOneTemp(
        targetTempId
      );
      if (code !== 0) {
        message.error(msg || "插入失败");
        setState({ pendingInsertHint: null });
        return;
      }
      message.success(msg || `已在第 ${targetTempId} 插入`);
      afterMutate(); // reload → handleTableLoad 做差集定位
    } catch (e: any) {
      setState({ pendingInsertHint: null });
    } finally {
      setState({ busyRow: null });
    }
  };

  const afterMutate = () => {
    tempRef.current?.reload?.();
  };

  /** 请求数据 */
  const requestData: any = async () => {
    setState({ isFetchingList: true, listReady: false });
    try {
      const { code, data, message: msg } = await getTempList();
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
    setState({ tableData: ds });

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

    // 0) 插入差集定位（createOneTemp 不返回新 id 的情况下）
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

    // 1) 精准对焦 id（移动/删除后的 pendingSelectId）
    if (pendingSelectId != null) {
      const i = ds.findIndex((r) => String(r?.id) === String(pendingSelectId));
      if (i >= 0) {
        handleRowClick(ds[i], i);
        setState({ pendingSelectId: null, pendingFocusIndex: null });
        return;
      }
      setState({ pendingSelectId: null });
    }

    // 2) 受控 selectedId（来自父组件）
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
    if (state.pendingFocusIndex != null) {
      const i = Math.min(Math.max(state.pendingFocusIndex, 0), ds.length - 1);
      handleRowClick(ds[i], i);
      setState({ pendingFocusIndex: null });
      return;
    }

    // 4) 最终兜底：沿用原 index 或第 0 行
    const fallback = selectedRowIndex >= 0 ? selectedRowIndex : 0;
    const idx = Math.min(Math.max(fallback, 0), ds.length - 1);
    handleRowClick(ds[idx], idx);
  };

  /** 列定义（temp_id 仅用于显示顺序） */
  const columns = [
    { title: "序号", dataIndex: "temp_id", width: 80 },
    { title: "扩展名", dataIndex: "extension_name", ellipsis: true },
    { title: "变量名", dataIndex: "variable_name", ellipsis: true },
    {
      title: "数据类型",
      dataIndex: "data_type",
      ellipsis: true,
      valueType: "select",
      render: (_: any, record: any) => (
        <span>{dataTypeData[record.data_type]}</span>
      ),
    },
    { title: "数组大小", dataIndex: "array_size", ellipsis: true },
    { title: "单位", dataIndex: "unit", ellipsis: true },
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
              if (!isBusy) deleteRow(record, index);
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
    <div className="temporaryVariables-page tabs-page">
      <ProTable
        columns={columns}
        actionRef={tempRef}
        request={requestData}
        loading={isBusy || state.isFetchingList}
        onLoad={handleTableLoad}
        rowKey={(row) => String(row?.id)}
        search={false}
        pagination={false}
        options={false}
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
        size="small"
        onRow={(record, index) => ({
          onClick: () => !isBusy && handleRowClick(record, index || 0),
        })}
        rowClassName={(_record, index) =>
          selectedRowIndex === index ? "selected-row" : ""
        }
      />

      <TempModal
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

export default TemporaryVariables;
