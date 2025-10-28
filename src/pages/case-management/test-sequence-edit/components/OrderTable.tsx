import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { ActionType, ProColumns, ProTable } from "@ant-design/pro-components";
import { Button, Modal, message } from "antd";
import React, { useRef } from "react";

export type ApiListResp<T> = {
  code: number;
  message?: string;
  data?: { lib_lists: T[]; total_cnt?: number } | null;
};

export type ApiResp = { code: number; message?: string };

export type OrderTableServices<T> = {
  /** 获取列表（需返回 lib_lists / total_cnt 结构） */
  fetchList: () => Promise<ApiListResp<T>>;
  /** 上移 */
  moveUp: (payload: any) => Promise<ApiResp>;
  /** 下移 */
  moveDown: (payload: any) => Promise<ApiResp>;
  /** 删除 */
  remove: (payload: any) => Promise<ApiResp>;
  /** 插入（通常需要一个位置/序号作为参数） */
  insert: (position: number) => Promise<ApiResp>;
};

export type FocusPolicy = { type: "keep-current" } | { type: "new-row" };

export type IdGetter<T> = (row: T) => string | number;
export type PayloadBuilder = (id: string | number) => any;

export type OrderTableProps<T extends Record<string, any>> = {
  /** 行唯一 id：优先使用 getId，其次使用 idField，最后回退 row.id */
  getId?: IdGetter<T>;
  idField?: string;
  /** 用于服务端需要的 payload 组装，例如 {condition_id: id} */
  buildPayload: PayloadBuilder;
  /** 业务 API */
  services: OrderTableServices<T>;
  /** 基础列（不含“操作列”） */
  columns: ProColumns<T>[];
  /** 表格标题（可选） */
  title?: React.ReactNode;
  /** 插入后的聚焦策略：保持当前行/选中新行（默认：选中新行） */
  insertFocusPolicy?: FocusPolicy;
  /** 当用户点击“编辑”按钮 */
  onEdit?: (record: T, index: number) => void;
  /** 允许外部覆盖右上角工具栏（默认提供“插入”按钮） */
  renderToolbar?: (
    insert: () => void,
    actionRef: React.MutableRefObject<ActionType | undefined>
  ) => React.ReactNode[];
  /** 当列表加载完成时（例如用于传递 tableData 给外部） */
  onLoaded?: (rows: T[]) => void;
  /** 可选：自定义行类名（例如高亮当前行） */
  rowClassName?: (record: T, index: number) => string;
  /** 焦点（选中行）变化时通知外部 */
  onFocusChange?: (record: T | undefined, index: number) => void;
};

function useRowFocus<T extends Record<string, any>>(getId: IdGetter<T>) {
  const state = React.useRef({
    selectedId: null as string | number | null,
    selectedIndex: -1,
    pendingFocusIndex: null as number | null,
    rows: [] as T[],
  });

  const setRows = (rows: T[]) => {
    state.current.rows = rows || [];
  };

  const ensureSelected = (record: T, index: number) => {
    state.current.selectedId = getId(record);
    state.current.selectedIndex = index;
  };

  const scheduleFocusIndex = (index: number | null) => {
    state.current.pendingFocusIndex = index;
  };

  const resolveFocusOnLoad = () => {
    const rows = state.current.rows;
    if (!rows.length) {
      state.current.selectedId = null;
      state.current.selectedIndex = -1;
      state.current.pendingFocusIndex = null;
      return { record: undefined, index: -1 };
    }

    // 1) 优先 pendingFocusIndex
    if (state.current.pendingFocusIndex != null) {
      const i = Math.min(
        Math.max(state.current.pendingFocusIndex, 0),
        rows.length - 1
      );
      state.current.pendingFocusIndex = null;
      state.current.selectedIndex = i;
      state.current.selectedId = getId(rows[i]);
      return { record: rows[i], index: i };
    }

    // 2) 其次按 selectedId 对齐
    if (state.current.selectedId != null) {
      const i = rows.findIndex(
        (r) => String(getId(r)) === String(state.current.selectedId)
      );
      if (i >= 0) {
        state.current.selectedIndex = i;
        return { record: rows[i], index: i };
      }
    }

    // 3) 兜底：保持原 index 或 0
    const fallback =
      state.current.selectedIndex >= 0 ? state.current.selectedIndex : 0;
    const i = Math.min(Math.max(fallback, 0), rows.length - 1);
    state.current.selectedIndex = i;
    state.current.selectedId = getId(rows[i]);
    return { record: rows[i], index: i };
  };

  return {
    state, // 如果外部想读当前值
    setRows,
    ensureSelected,
    scheduleFocusIndex,
    resolveFocusOnLoad,
  } as const;
}

export function OrderTable<T extends Record<string, any>>(
  props: OrderTableProps<T>
) {
  const {
    getId,
    idField,
    buildPayload,
    services,
    columns,
    title,
    insertFocusPolicy = { type: "new-row" },
    onEdit,
    renderToolbar,
    onLoaded,
    rowClassName,
    onFocusChange,
  } = props;

  const resolvedGetId: IdGetter<T> = React.useMemo(() => {
    if (getId) return getId;
    if (idField) return (row: any) => row?.[idField as any];
    return (row: any) => row?.id;
  }, [getId, idField]);

  const focus = useRowFocus<T>(resolvedGetId);
  const actionRef = useRef<ActionType>();

  const request = async () => {
    const res = await services.fetchList();
    const { code, data, message: msg } = res || {};
    if (code !== 0) {
      message.error(msg || "获取失败");
      focus.setRows([]);
      return { data: [], total: 0, success: false };
    }
    const list = data?.lib_lists || [];
    focus.setRows(list);
    return { data: list, total: data?.total_cnt || list.length, success: true };
  };

  const onLoad = (rows: T[]) => {
    onLoaded?.(rows);
    const { record, index } = focus.resolveFocusOnLoad();
    onFocusChange?.(record, index);
  };

  const reload = () => actionRef.current?.reload?.();

  // 操作行为
  const handleInsert = async () => {
    // 计算前端希望插入后聚焦的索引
    const rows = focus.state.current.rows;
    const cur = focus.state.current.selectedIndex;

    let focusIndexAfter: number;
    if (insertFocusPolicy.type === "keep-current") {
      focusIndexAfter = cur >= 0 ? cur : Math.max(0, rows.length - 1);
    } else {
      // new-row
      focusIndexAfter = cur >= 0 ? cur + 1 : rows.length; // 末尾
    }
    focus.scheduleFocusIndex(focusIndexAfter);

    // 服务端位置参数（按你们的 targetSeqId 习惯）
    const lastId = rows.length
      ? Math.max(...rows.map((r) => Number(resolvedGetId(r)) || 0))
      : 0;
    const selectedId = focus.state.current.selectedId as any;
    const targetPos = (selectedId ?? lastId) + 1;

    const { code, message: msg } = await services.insert(targetPos);
    if (code !== 0) {
      message.error(msg || "插入失败");
      return;
    }
    message.success(msg || "插入成功");
    reload();
  };

  const handleMove = async (record: T, index: number, dir: "up" | "down") => {
    focus.ensureSelected(record, index);
    focus.scheduleFocusIndex(dir === "up" ? index - 1 : index + 1);

    const id = resolvedGetId(record);
    const api = dir === "up" ? services.moveUp : services.moveDown;

    const { code, message: msg } = await api({ ...buildPayload(id) });
    if (code !== 0) {
      message.error(msg || "操作失败");
      return;
    }
    message.success(msg || "操作成功");
    reload();
  };

  const handleDelete = (record: T, index: number) => {
    Modal.confirm({
      title: "确认删除吗？",
      onOk: async () => {
        // 预置删除后的聚焦索引：优先下一条，末尾则上一条
        const rows = focus.state.current.rows;
        const isLast = index === rows.length - 1;
        const target = isLast ? index - 1 : index;
        focus.ensureSelected(record, index);
        focus.scheduleFocusIndex(target >= 0 ? target : null);

        const id = resolvedGetId(record);
        const { code, message: msg } = await services.remove(buildPayload(id));
        if (code !== 0) {
          message.error(msg || "操作失败");
          return;
        }
        message.success("删除成功");
        reload();
      },
    });
  };

  // 组装操作列
  const opCol: ProColumns<T> = React.useMemo(
    () => ({
      title: "操作",
      valueType: "option",
      width: 140,
      render: (_, record, index) => {
        const rows = focus.state.current.rows;
        const isFirst = index === 0;
        const isLast = index === rows.length - 1;
        return [
          <a
            key="editable"
            onClick={(e) => {
              e.stopPropagation();
              focus.ensureSelected(record, index);
              focus.scheduleFocusIndex(index); // 编辑后刷新仍回到这行
              onEdit?.(record, index);
            }}
            style={{ marginRight: 10, color: "#1677ff" }}
          >
            <EditOutlined style={{ marginRight: 4 }} />
          </a>,
          <a
            key="up"
            onClick={(e) => {
              e.stopPropagation();
              if (!isFirst) handleMove(record, index, "up");
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
              if (!isLast) handleMove(record, index, "down");
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
              handleDelete(record, index);
            }}
            style={{ color: "#ff4d4f" }}
          >
            <DeleteOutlined style={{ marginRight: 4 }} />
          </a>,
        ];
      },
    }),
    [onEdit]
  );

  const allColumns = React.useMemo(() => [...columns, opCol], [columns, opCol]);

  return (
    <ProTable<T>
      columns={allColumns}
      actionRef={actionRef}
      request={request}
      onLoad={onLoad}
      rowKey={(row) => String(resolvedGetId(row))}
      search={false}
      pagination={false}
      size="small"
      options={false}
      headerTitle={title}
      toolBarRender={
        renderToolbar
          ? () => renderToolbar(handleInsert, actionRef)
          : () => [
              <Button
                key="insert"
                icon={<PlusOutlined />}
                onClick={handleInsert}
              >
                插入
              </Button>,
            ]
      }
      onRow={(record, index) => ({
        onClick: () => {
          if (typeof index === "number") {
            focus.ensureSelected(record, index);
            onFocusChange?.(record, index);
          }
        },
      })}
      rowClassName={(record, index) =>
        rowClassName ? rowClassName(record, index!) : ""
      }
    />
  );
}
