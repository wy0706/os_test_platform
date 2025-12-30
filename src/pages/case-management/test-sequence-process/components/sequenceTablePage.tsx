import {
  copyOne,
  cutOne,
  deleteOne,
  getList,
  insertOne,
  moveDownOne,
  moveUpOne,
  pasteOne,
} from "@/services/case-management/test-sequence-process.service";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CiOutlined,
  CopyFilled,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, message, Modal } from "antd";
import { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import EditModal from "./editModal";

export type TablePageRef = {
  insertFromTree: (node: { key: string; title: string; id: string }) => void;
};

export type TabKey = "Pre" | "UUT" | "Post";
export type SelectedProject = { key: string; title: string; id: string } | null;

export interface SequenceTablePageProps {
  tab: TabKey;
  recordId: string;
  selectedProject: SelectedProject;

  /** ✅ 选中行回传给 index，用于 TestCondition/TestResult */
  onSelectionChange?: (tab: TabKey, row: any | null) => void;
}

/**
 * ✅ Tab级别记忆选中id（切换tab仍保持原选中）
 * key = `${recordId}_${tab}`
 */
const selectedIdCache: Record<string, string | null> = {};

const SequenceTablePage = forwardRef<TablePageRef, SequenceTablePageProps>(
  ({ tab, recordId, selectedProject, onSelectionChange }, ref) => {
    const cacheKey = `${recordId}_${tab}`;

    const [state, setState] = useSetState<any>({
      loading: false, // fetchList loading
      opLoading: false, // 操作锁
      tableData: [] as any[],

      /** ✅ 统一保存为 string，避免 number/string 混用导致选中 key 对不上 */
      selectedRowId: selectedIdCache[cacheKey] ?? null,
      selectedRowIndex: -1,

      /** ✅ 后端剪贴板状态（tab 内不共享） */
      clipboardReady: false,
      clipboardMethod: 0, // 0=复制粘贴 1=剪切粘贴

      /** 编辑 */
      isEditModalOpen: false,
      updateValue: {},
    });

    const {
      loading,
      opLoading,
      tableData,
      selectedRowId,
      selectedRowIndex,
      clipboardReady,
      clipboardMethod,
      isEditModalOpen,
      updateValue,
    } = state;

    /** 是否选中行 */
    const hasSelectedRow =
      selectedRowIndex !== -1 && tableData.length > 0 && selectedRowId != null;

    /** 是否允许插入（必须选中右侧 level=3 节点） */
    const canInsert = !opLoading && !!selectedProject?.id;

    /** ✅ 统一解析 getList 返回 data */
    const normalizeList = (resp: any) => {
      if (!resp || resp.code !== 0) return [];
      const data = resp.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.list)) return data.list;
      if (Array.isArray(data?.records)) return data.records;
      return [];
    };

    /**
     * ✅ fetchList
     * - 默认：优先按 cache 中的 selectedRowId 恢复选中（切换tab返回仍保持）
     * - forceSelectIndex=true：强制选中 preferSelectedIndex（插入/粘贴/移动后选中新行）
     */
    const fetchList = async (
      preferSelectedIndex?: number,
      forceSelectIndex: boolean = false
    ) => {
      try {
        setState({ loading: true });

        const resp = await getList({ TST: tab });

        if (!resp || resp.code !== 0) {
          setState({
            tableData: [],
            selectedRowIndex: -1,
            selectedRowId: null,
          });
          selectedIdCache[cacheKey] = null;
          onSelectionChange?.(tab, null);
          message.error(resp?.message || "获取列表失败");
          return;
        }

        const list = normalizeList(resp);

        // ✅ 优先使用缓存的 id 恢复选中
        const cachedId = selectedIdCache[cacheKey] ?? selectedRowId;

        let nextIndex = -1;

        if (forceSelectIndex) {
          if (list.length === 0) nextIndex = -1;
          else if (typeof preferSelectedIndex === "number") {
            nextIndex = Math.min(
              Math.max(preferSelectedIndex, 0),
              list.length - 1
            );
          } else {
            nextIndex = 0;
          }
        } else {
          if (list.length === 0) {
            nextIndex = -1;
          } else if (cachedId != null) {
            const idx = list.findIndex(
              (x: any) => String(x?.id) === String(cachedId)
            );
            nextIndex = idx >= 0 ? idx : -1;
          }

          // ✅ 缓存找不到就默认第一行
          if (nextIndex === -1 && list.length > 0) {
            if (typeof preferSelectedIndex === "number") {
              nextIndex = Math.min(
                Math.max(preferSelectedIndex, 0),
                list.length - 1
              );
            } else {
              nextIndex = 0;
            }
          }
        }

        const nextIdRaw = nextIndex >= 0 ? list[nextIndex]?.id : null;
        const nextId = nextIdRaw != null ? String(nextIdRaw) : null;

        // ✅ 更新 state + cache
        setState({
          tableData: list,
          selectedRowIndex: nextIndex,
          selectedRowId: nextId,
        });
        selectedIdCache[cacheKey] = nextId;

        const row =
          nextId != null
            ? list.find((x: any) => String(x?.id) === String(nextId))
            : null;

        onSelectionChange?.(tab, row || null);
      } catch (e: any) {
        setState({
          tableData: [],
          selectedRowIndex: -1,
          selectedRowId: null,
        });
        selectedIdCache[cacheKey] = null;
        onSelectionChange?.(tab, null);
        message.error(e?.message || "获取列表异常");
      } finally {
        setState({ loading: false });
      }
    };

    /** recordId/tab 变化时重新拉取，并读取 cache */
    useEffect(() => {
      // tab 切换时同步 cache 到 state
      setState({
        selectedRowId: selectedIdCache[cacheKey] ?? null,
        selectedRowIndex: -1,
      });
      fetchList();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, recordId]);

    /** ✅ 操作互斥锁：防止接口未返回继续操作 */
    const runWithLock = async (fn: () => Promise<void>) => {
      if (opLoading) return;
      try {
        setState({ opLoading: true });
        await fn();
      } finally {
        setState({ opLoading: false });
      }
    };

    /** ✅ 设置选中行（统一入口） */
    const setSelectedRow = (row: any | null) => {
      if (!row?.id) {
        setState({ selectedRowId: null, selectedRowIndex: -1 });
        selectedIdCache[cacheKey] = null;
        onSelectionChange?.(tab, null);
        return;
      }

      const idStr = String(row.id);
      const idx = tableData.findIndex(
        (x: any) => String(x?.id) === String(idStr)
      );

      setState({
        selectedRowId: idStr,
        selectedRowIndex: idx >= 0 ? idx : selectedRowIndex,
      });
      selectedIdCache[cacheKey] = idStr;

      onSelectionChange?.(tab, row);
    };

    /** ✅ 操作按钮点击时也要选中当前行 */
    const setSelectedRowByRecord = (record: any, index?: number) => {
      if (!record?.id) return;

      const idStr = String(record.id);
      let idx = typeof index === "number" && index >= 0 ? index : -1;
      if (idx === -1) {
        idx = tableData.findIndex((x: any) => String(x?.id) === String(idStr));
      }

      setState({
        selectedRowId: idStr,
        selectedRowIndex: idx >= 0 ? idx : selectedRowIndex,
      });
      selectedIdCache[cacheKey] = idStr;

      onSelectionChange?.(tab, record);
    };

    /** ✅ 插入（来自右侧树双击/插入按钮） */
    const insertTreeNode = async (nodeTitle?: string) => {
      if (!nodeTitle) {
        message.warning("请选择测试项目进行插入");
        return;
      }

      const insertIndex =
        selectedRowIndex >= 0 ? selectedRowIndex + 1 : tableData.length;

      await runWithLock(async () => {
        const res = await insertOne({
          TST: tab,
          TIName: nodeTitle,
          Seq: insertIndex + 1,
        });

        if (!res || res.code !== 0) {
          message.error(res?.message || "插入失败");
          return;
        }

        message.success(res?.message || "插入成功");
        await fetchList(insertIndex, true);
      });
    };

    useImperativeHandle(ref, () => ({
      insertFromTree: ({ title }) => insertTreeNode(title),
    }));

    /** ✅ 上移/下移 */
    const moveRow = async (index: number, direction: "up" | "down") => {
      const row = tableData[index];
      if (!row) return;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= tableData.length) return;

      await runWithLock(async () => {
        const api = direction === "up" ? moveUpOne : moveDownOne;

        const res = await api({
          TST: tab,
          id: row.id,
          Seq: row.Seq,
        });

        if (!res || res.code !== 0) {
          message.error(res?.message || "移动失败");
          return;
        }

        message.success(
          res?.message || (direction === "up" ? "上移成功" : "下移成功")
        );

        // 强制选中移动后的行
        selectedIdCache[cacheKey] = String(row.id);
        await fetchList(targetIndex, true);
      });
    };

    /** ✅ 删除 */
    const deleteRow = (index: number) => {
      const row = tableData[index];
      if (!row?.id) return;

      Modal.confirm({
        title: "确认删除吗？",
        onOk: async () => {
          await runWithLock(async () => {
            const res = await deleteOne({ id: row.id, TST: tab });

            if (!res || res.code !== 0) {
              message.error(res?.message || "删除失败");
              return;
            }

            message.success(res?.message || "删除成功");
            await fetchList(Math.max(index - 1, 0), true);
          });
        },
      });
    };

    /** ✅ 复制 */
    const handleCopy = () => {
      if (!hasSelectedRow) return;
      const row = tableData[selectedRowIndex];
      if (!row?.id) return;

      runWithLock(async () => {
        const res = await copyOne({ TST: tab, id: row.id });

        if (!res || res.code !== 0) {
          message.error(res?.message || "复制失败");
          return;
        }

        message.success(res?.message || "复制成功");
        setState({
          clipboardReady: true,
          clipboardMethod: 0,
        });
      });
    };

    /** ✅ 剪切 */
    const handleCut = () => {
      if (!hasSelectedRow) return;
      const row = tableData[selectedRowIndex];
      if (!row?.id) return;

      runWithLock(async () => {
        const res = await cutOne({ TST: tab, id: row.id });

        if (!res || res.code !== 0) {
          message.error(res?.message || "剪切失败");
          return;
        }

        message.success(res?.message || "剪切成功");
        setState({
          clipboardReady: true,
          clipboardMethod: 1,
        });

        await fetchList(Math.max(selectedRowIndex - 1, 0), true);
      });
    };

    /** ✅ 粘贴（method 表示复制粘贴 or 剪切粘贴） */
    const handlePaste = async () => {
      if (!clipboardReady) return;

      const insertIndex =
        selectedRowIndex >= 0 ? selectedRowIndex + 1 : tableData.length;

      runWithLock(async () => {
        const res = await pasteOne({
          TST: tab,
          Seq: insertIndex + 1,
          method: clipboardMethod,
        });

        if (!res || res.code !== 0) {
          message.error(res?.message || "粘贴失败");
          return;
        }

        message.success(res?.message || "粘贴成功");
        await fetchList(insertIndex, true);
      });
    };

    /** ✅ columns */
    const columns: any = useMemo(
      () => [
        { title: "序号", dataIndex: "Seq", ellipsis: true },
        {
          title: "激活",
          dataIndex: "Active",
          ellipsis: true,
          valueType: "select",
          valueEnum: {
            1: { text: "✓", status: "Success" },
            0: { text: "✗", status: "Error" },
          },
        },
        { title: "测试序列", dataIndex: "TIName", ellipsis: true },
        { title: "备注", dataIndex: "Comments", ellipsis: true },
        {
          title: "报告",
          dataIndex: "RPTFlag",
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
          width: 130,
          render: (_: any, record: any, index: number) => {
            const isFirst = index === 0;
            const isLast = index === tableData.length - 1;
            const disabled = opLoading;

            const linkStyle = (extra?: any) => ({
              marginRight: 10,
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.4 : 1,
              color: disabled ? "#999" : "#1677ff",
              ...extra,
            });

            return [
              <a
                key="editable"
                onClick={(e) => {
                  e.stopPropagation();
                  if (disabled) return;
                  setSelectedRowByRecord(record, index);
                  setState({ isEditModalOpen: true, updateValue: record });
                }}
                style={linkStyle()}
              >
                <EditOutlined />
              </a>,
              <a
                key="up"
                onClick={(e) => {
                  e.stopPropagation();
                  if (disabled || isFirst) return;
                  setSelectedRowByRecord(record, index);
                  moveRow(index, "up");
                }}
                style={linkStyle({
                  cursor: disabled || isFirst ? "not-allowed" : "pointer",
                  opacity: disabled || isFirst ? 0.4 : 1,
                  color: disabled || isFirst ? "#999" : "#1677ff",
                })}
              >
                <ArrowUpOutlined />
              </a>,
              <a
                key="down"
                onClick={(e) => {
                  e.stopPropagation();
                  if (disabled || isLast) return;
                  setSelectedRowByRecord(record, index);
                  moveRow(index, "down");
                }}
                style={linkStyle({
                  cursor: disabled || isLast ? "not-allowed" : "pointer",
                  opacity: disabled || isLast ? 0.4 : 1,
                  color: disabled || isLast ? "#999" : "#1677ff",
                })}
              >
                <ArrowDownOutlined />
              </a>,
              <a
                key="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  if (disabled) return;
                  setSelectedRowByRecord(record, index);
                  deleteRow(index);
                }}
                style={{
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.4 : 1,
                  color: disabled ? "#999" : "#ff4d4f",
                }}
              >
                <DeleteOutlined />
              </a>,
            ];
          },
        },
      ],
      [tableData, opLoading]
    );

    return (
      <div>
        <ProTable<any>
          columns={columns}
          search={false}
          options={false}
          dataSource={tableData}
          rowKey={(row) => String(row.id)}
          pagination={false}
          loading={loading || opLoading}
          size="small"
          toolBarRender={() => [
            <Button
              key="insert"
              icon={<PlusOutlined />}
              onClick={() => insertTreeNode(selectedProject?.title)}
              disabled={!canInsert}
            >
              插入
            </Button>,
            <Button
              key="copy"
              icon={<CopyFilled />}
              onClick={handleCopy}
              disabled={opLoading || !hasSelectedRow}
            >
              复制
            </Button>,
            <Button
              key="paste"
              icon={<CopyOutlined />}
              onClick={handlePaste}
              disabled={opLoading || !clipboardReady}
            >
              粘贴
            </Button>,
            <Button
              key="cut"
              icon={<CiOutlined />}
              onClick={handleCut}
              disabled={opLoading || !hasSelectedRow}
            >
              剪切
            </Button>,
            <Button
              key="refresh"
              icon={<ReloadOutlined />}
              onClick={() => fetchList(selectedRowIndex)}
              disabled={opLoading}
            >
              刷新
            </Button>,
          ]}
          /** ✅ 关键：使用 Table 内建选中逻辑，但隐藏左侧圆圈列 */
          rowSelection={{
            type: "radio",
            selectedRowKeys:
              selectedRowId != null ? [String(selectedRowId)] : [],
            onChange: (_, rows) => {
              const row = rows?.[0] || null;
              setSelectedRow(row);
            },
            // 隐藏左侧单选列（不显示圆圈 & 不占宽度）
            columnWidth: 0,
            fixed: false,
            renderCell: () => null,
          }}
          onRow={(record) => ({
            onClick: () => setSelectedRow(record),
          })}
        />

        <EditModal
          open={isEditModalOpen}
          updateValue={updateValue}
          type={tab}
          onCancel={() => setState({ isEditModalOpen: false })}
          onOk={async () => {
            setState({ isEditModalOpen: false });
            await fetchList(selectedRowIndex);
          }}
        />
      </div>
    );
  }
);

export default SequenceTablePage;
