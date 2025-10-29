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
import { dataTypeData } from "./schemas";
import TempModal from "./tempModal";

interface ConditionsProps {
  selectedId?: number | null; // 受控选中：temp_id
  onSelectedChange?: (id: number | null, index: number) => void;
}

const TemporaryVariables: React.FC<ConditionsProps> = ({
  selectedId,
  onSelectedChange,
}) => {
  const [state, setState] = useSetState<any>({
    title: "",
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
    pendingFocusIndex: null as number | null, // 刷新后优先用它来选中
  });
  const tempRef = useRef<ActionType>();
  const isBusy = !!state.busyRow;
  const isInserting = state.busyRow?.type === "insert";
  // 动态创建列定义，确保操作列能响应tableData变化
  const columns = [
    {
      title: "序号",
      dataIndex: "temp_id",
      // valueType: "index",
      width: 80,
    },
    {
      title: "扩展名",
      dataIndex: "extension_name",
      ellipsis: true,
      // key: "extensionName",
    },
    {
      title: "变量名",
      ellipsis: true,
      dataIndex: "variable_name",
    },
    {
      title: "数据类型",
      dataIndex: "data_type",
      ellipsis: true,
      valueType: "select",
      render: (_: any, record: any) => {
        return <span>{dataTypeData[record.data_type]}</span>;
      },
    },

    {
      title: "数组大小",
      ellipsis: true,
      dataIndex: "array_size",
    },
    {
      title: "单位",
      ellipsis: true,
      dataIndex: "unit",
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      width: 140,
      render: (text: any, record: any, index: number, action: any) => {
        // 动态获取当前表格数据长度来判断是否为最后一条
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

  const {
    title,
    editValue,
    isEditModalOpen,
    tableData,
    totalCount,
    selectedSeqId,
    selectedRowIndex,
    busyRow,
  } = state;
  const ensureSelected = (record: any, index: number) => {
    const id = record?.temp_id ?? null;
    setState({
      selectedSeqId: id,
      selectedRowIndex: index,
      selectedRowData: record,
    });
    onSelectedChange?.(id, index); // ★ 回写父组件
  };
  const moveRow = async (
    record: any,
    index: number,
    direction: "up" | "down"
  ) => {
    const APiFn = direction === "up" ? moveUpTemp : moveDownTemp;
    const delta = direction === "up" ? -1 : 1;

    try {
      setState({ busyRow: { type: "move", key: record?.temp_id } });
      const { code, message: msg } = await APiFn({
        temp_id: record.temp_id,
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
          setState({ busyRow: { type: "delete", key: row?.temp_id } });
          const { code, message: msg } = await deleteTemp(row.temp_id);
          if (code !== 0) {
            message.error(msg || "操作失败");
            return;
          }
          message.success("删除成功");

          // 如果删除的是选中行，预先调整选中 seq_id：优先选中“下一条”，否则“上一条”
          if (state.selectedSeqId === row.temp_id) {
            const isLast = index === state.tableData.length - 1;
            const nextSeqId = isLast ? row.temp_id - 1 : row.temp_id; // 中间删：下一条补位则 seq_id 不变
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
    ensureSelected(record, index);
  };
  // 插入新行（基于当前选中行之后；若无选中则追加到末尾）
  const handleInsertClick = async () => {
    const lastId = state.tableData?.length
      ? Math.max(...state.tableData.map((r: any) => Number(r.temp_id) || 0))
      : 0;
    const targetSeqId = (state.selectedSeqId ?? lastId) + 1;
    const targetIndex =
      state.selectedRowIndex >= 0
        ? state.selectedRowIndex + 1
        : state.tableData.length; // 没选中就追加到末尾并聚焦末尾
    try {
      setState({ busyRow: { type: "insert" }, pendingFocusIndex: targetIndex });
      const { code, message: msg } = await createOneTemp(targetSeqId);
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
    tempRef.current?.reload?.();
  };

  const requestData: any = async () => {
    const { code, data, message: msg } = await getTempList();
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
        pendingFocusIndex: null,
      });
      onSelectedChange?.(null, -1);
      return;
    }

    // ★ (0) 受控 selectedId
    if (selectedId != null) {
      const i = ds.findIndex((r) => String(r?.temp_id) === String(selectedId));
      if (i >= 0) {
        handleRowClick(ds[i], i);
        return;
      }
    }

    // (1) pendingFocusIndex
    if (state.pendingFocusIndex != null) {
      const i = Math.min(Math.max(state.pendingFocusIndex, 0), ds.length - 1);
      handleRowClick(ds[i], i);
      setState({ pendingFocusIndex: null });
      return;
    }

    // (2) 本地 selectedSeqId
    let idx = -1;
    if (state.selectedSeqId != null) {
      idx = ds.findIndex(
        (r) => String(r?.temp_id) === String(state.selectedSeqId)
      );
    }

    // (3) 兜底：上次 index 或 0
    if (idx < 0) {
      const fallback = state.selectedRowIndex >= 0 ? state.selectedRowIndex : 0;
      idx = Math.min(Math.max(fallback, 0), ds.length - 1);
    }
    handleRowClick(ds[idx], idx);
  };
  return (
    <div className="temporaryVariables-page tabs-page">
      <ProTable
        columns={columns}
        actionRef={tempRef}
        request={requestData}
        loading={isBusy}
        onLoad={handleTableLoad}
        rowKey={(row) => String(row?.temp_id)}
        search={false}
        pagination={false}
        options={false}
        toolBarRender={() => [
          <Button
            key="button"
            loading={isInserting}
            disabled={isBusy}
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
        rowClassName={(record, index) =>
          selectedRowIndex === index ? "selected-row" : ""
        }
      />

      <TempModal
        open={isEditModalOpen}
        onCancel={() => setState({ isEditModalOpen: false, editValue: {} })}
        type="edit"
        updateValue={editValue}
        onOk={(values) => {
          setState({ isEditModalOpen: false, editValue: {} });
          afterMutate();
        }}
      />
    </div>
  );
};

export default TemporaryVariables;
