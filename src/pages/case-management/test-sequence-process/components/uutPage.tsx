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

type TabKey = "Pre" | "UUT" | "Post";
type SelectedProject = { key: string; title: string; id: string } | null;

interface Props {
  tab: TabKey;
  recordId: string;
  isRelease: boolean;
  selectedProject: SelectedProject;
  onMetaChange?: (
    tab: TabKey,
    meta: { isDirty: boolean; isEmpty: boolean }
  ) => void;
  onSelectionChange?: (tab: TabKey, row: any | null) => void;
}

const UutPage = forwardRef<TablePageRef, Props>(
  (
    {
      tab,
      recordId,
      isRelease,
      selectedProject,
      onMetaChange,
      onSelectionChange,
    },
    ref
  ) => {
    const [state, setState] = useSetState<any>({
      loading: false,
      opLoading: false,
      tableData: [] as any[],

      // ✅ 用 id 控制高亮
      selectedRowId: null as string | number | null,
      selectedRowIndex: -1,

      isDirty: false,
      updateValue: {},
      isEditModalOpen: false,

      // ✅ 后端剪贴板状态（tab 内不共享）
      clipboardReady: false,
      clipboardMethod: 0, // 0=复制粘贴  1=剪切粘贴
    });

    const {
      loading,
      opLoading,
      tableData,
      selectedRowIndex,
      selectedRowId,
      updateValue,
      isEditModalOpen,
      clipboardReady,
      clipboardMethod,
    } = state;

    const hasSelectedRow =
      selectedRowIndex !== -1 && tableData.length > 0 && selectedRowId != null;

    const canEdit = !isRelease && !opLoading;
    const canInsert = canEdit && !!selectedProject?.id;

    const emitMeta = (nextDirty: boolean, nextData: any[]) => {
      onMetaChange?.(tab, {
        isDirty: nextDirty,
        isEmpty: nextData.length === 0,
      });
    };

    const emitSelection = (data: any[], id: any) => {
      const row = data?.find((x: any) => String(x?.id) === String(id)) || null;
      onSelectionChange?.(tab, row);
    };

    const normalizeList = (resp: any) => {
      if (!resp || resp.code !== 0) return [];
      const data = resp.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.list)) return data.list;
      if (Array.isArray(data?.records)) return data.records;
      return [];
    };

    /**
     * ✅ fetchList：
     * - 默认：优先按 selectedRowId 恢复选中（不丢高亮）
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
            isDirty: false,
          });
          emitMeta(false, []);
          emitSelection([], null);
          message.error(resp?.message || "获取列表失败");
          return;
        }

        const list = normalizeList(resp);

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
          } else if (selectedRowId != null) {
            const idx = list.findIndex(
              (x: any) => String(x?.id) === String(selectedRowId)
            );
            nextIndex = idx >= 0 ? idx : -1;
          }

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

        const nextId = nextIndex >= 0 ? list[nextIndex]?.id : null;

        setState({
          tableData: list,
          selectedRowIndex: nextIndex,
          selectedRowId: nextId,
          isDirty: false,
        });

        emitSelection(list, nextId);
        emitMeta(false, list);
      } catch (e: any) {
        setState({
          tableData: [],
          selectedRowIndex: -1,
          selectedRowId: null,
          isDirty: false,
        });
        emitSelection([], null);
        emitMeta(false, []);
        message.error(e?.message || "获取列表异常");
      } finally {
        setState({ loading: false });
      }
    };

    useEffect(() => {
      fetchList();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, recordId]);

    /**
     * ✅ 操作互斥锁：防止接口未返回继续操作
     */
    const runWithLock = async (fn: () => Promise<void>) => {
      if (isRelease) {
        message.info("文件已发布，不可更改 ！");
        return;
      }
      if (opLoading) return;

      try {
        setState({ opLoading: true });
        await fn();
      } finally {
        setState({ opLoading: false });
      }
    };

    /**
     * ✅ 新增：操作按钮点击时也要把这一行设为选中行（高亮跟随）
     */
    const setSelectedRowByRecord = (record: any, index?: number) => {
      if (!record?.id) return;

      // 用 index 快速设置，如果 index 不可信再用 id 查
      let idx = typeof index === "number" && index >= 0 ? index : -1;

      if (idx === -1) {
        idx = tableData.findIndex(
          (x: any) => String(x?.id) === String(record.id)
        );
      }

      setState({
        selectedRowId: record.id,
        selectedRowIndex: idx >= 0 ? idx : selectedRowIndex,
      });

      onSelectionChange?.(tab, record);
    };

    /**
     * ✅ 插入：成功后强制选中新行
     */
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

        setState({ isDirty: true });
        onMetaChange?.(tab, { isDirty: true, isEmpty: false });
      });
    };

    useImperativeHandle(ref, () => ({
      insertFromTree: ({ title }) => insertTreeNode(title),
    }));

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

        setState({ selectedRowId: row.id });
        await fetchList(targetIndex, true);

        setState({ isDirty: true });
        onMetaChange?.(tab, { isDirty: true, isEmpty: false });
      });
    };

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

            setState({ isDirty: true });
            onMetaChange?.(tab, { isDirty: true, isEmpty: false });
          });
        },
      });
    };

    const handleRowClick = (record: any) => {
      if (opLoading) return;
      if (!record?.id) return;

      const idx = tableData.findIndex(
        (x: any) => String(x?.id) === String(record.id)
      );

      setState({
        selectedRowId: record.id,
        selectedRowIndex: idx >= 0 ? idx : selectedRowIndex,
      });

      onSelectionChange?.(tab, record);
    };

    const handleInsertBtn = () => {
      if (!selectedProject?.id) {
        message.warning("请先选择右侧测试项目（第3级节点）");
        return;
      }
      insertTreeNode(selectedProject.title);
    };

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

        setState({ isDirty: true });
        onMetaChange?.(tab, { isDirty: true, isEmpty: false });
      });
    };

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

        setState({ isDirty: true });
        onMetaChange?.(tab, { isDirty: true, isEmpty: false });
      });
    };

    const columns: any = useMemo(
      () => [
        {
          title: "序号",
          dataIndex: "Seq",
          ellipsis: true,
        },
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
          valueType: "option",
          key: "option",
          width: 130,
          render: (_: any, record: any, index: number) => {
            const isFirst = index === 0;
            const isLast = index === tableData.length - 1;
            const disabled = isRelease || opLoading;

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
                  setSelectedRowByRecord(record, index); // ✅ 让当前行立即选中高亮
                  setState({ isEditModalOpen: true, updateValue: record });
                }}
                style={linkStyle()}
              >
                <EditOutlined style={{ marginRight: 4 }} />
              </a>,
              <a
                key="up"
                onClick={(e) => {
                  e.stopPropagation();
                  if (disabled || isFirst) return;
                  // ✅ 点击上移先选中当前行
                  setSelectedRowByRecord(record, index);
                  moveRow(index, "up");
                }}
                style={linkStyle({
                  cursor: disabled || isFirst ? "not-allowed" : "pointer",
                  opacity: disabled || isFirst ? 0.4 : 1,
                  color: disabled || isFirst ? "#999" : "#1677ff",
                })}
              >
                <ArrowUpOutlined style={{ marginRight: 4 }} />
              </a>,
              <a
                key="down"
                onClick={(e) => {
                  e.stopPropagation();
                  if (disabled || isLast) return;
                  // ✅ 点击下移先选中当前行
                  setSelectedRowByRecord(record, index);
                  moveRow(index, "down");
                }}
                style={linkStyle({
                  cursor: disabled || isLast ? "not-allowed" : "pointer",
                  opacity: disabled || isLast ? 0.4 : 1,
                  color: disabled || isLast ? "#999" : "#1677ff",
                })}
              >
                <ArrowDownOutlined style={{ marginRight: 4 }} />
              </a>,
              <a
                key="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  if (disabled) return;
                  // ✅ 点击删除先选中当前行
                  setSelectedRowByRecord(record, index);
                  deleteRow(index);
                }}
                style={{
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.4 : 1,
                  color: disabled ? "#999" : "#ff4d4f",
                }}
              >
                <DeleteOutlined style={{ marginRight: 4 }} />
              </a>,
            ];
          },
        },
      ],
      [tableData, isRelease, opLoading]
    );

    return (
      <div>
        <ProTable<any>
          columns={columns}
          search={false}
          options={false}
          dataSource={tableData}
          rowKey="id"
          pagination={false}
          loading={loading || opLoading}
          toolBarRender={() => [
            <Button
              key="insert"
              icon={<PlusOutlined />}
              onClick={handleInsertBtn}
              disabled={!canInsert}
            >
              插入
            </Button>,
            <Button
              key="copy"
              icon={<CopyFilled />}
              onClick={handleCopy}
              disabled={!canEdit || !hasSelectedRow}
            >
              复制
            </Button>,
            <Button
              key="paste"
              icon={<CopyOutlined />}
              onClick={handlePaste}
              disabled={!canEdit || !clipboardReady}
            >
              粘贴
            </Button>,
            <Button
              key="cut"
              icon={<CiOutlined />}
              onClick={handleCut}
              disabled={!canEdit || !hasSelectedRow}
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
          size="small"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
          rowClassName={(record) =>
            String(record?.id) === String(selectedRowId) ? "selected-row" : ""
          }
        />

        <EditModal
          open={isEditModalOpen}
          updateValue={updateValue}
          type={tab}
          onCancel={() => setState({ isEditModalOpen: false })}
          onOk={async () => {
            // ✅ EditModal 内部已完成 updateOne，这里只刷新
            setState({ isEditModalOpen: false });

            await fetchList(selectedRowIndex); // ✅ 保持当前选中
            setState({ isDirty: true });
            onMetaChange?.(tab, { isDirty: true, isEmpty: false });
          }}
        />
      </div>
    );
  }
);

export default UutPage;
