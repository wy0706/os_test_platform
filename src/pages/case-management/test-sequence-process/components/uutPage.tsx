import {
  deleteOne,
  getList,
  insertOne,
  moveOne,
  updateOne,
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
      loading: false, // fetchList loading
      opLoading: false, // ✅ 操作锁（插入/删除/移动/编辑/粘贴）
      tableData: [] as any[],
      selectedRowIndex: -1,
      isDirty: false,
      updateValue: {},
      isEditModalOpen: false,
      copyValue: {}, // ✅ 剪贴板
    });

    const {
      loading,
      opLoading,
      tableData,
      selectedRowIndex,
      isDirty,
      updateValue,
      isEditModalOpen,
      copyValue,
    } = state;

    // ✅ 是否选中有效行
    const hasSelectedRow = selectedRowIndex !== -1 && tableData.length > 0;

    // ✅ 是否有复制/剪切缓存
    const hasClipboard = copyValue && Object.keys(copyValue).length > 0;

    // ✅ 是否允许编辑操作（发布态全部禁止 + 操作期间锁定）
    const canEdit = !isRelease && !opLoading;

    // ✅ 插入是否允许：必须选中右侧树 level=3 节点（selectedProject.id）+ 可编辑 + 非操作中
    const canInsert = canEdit && !!selectedProject?.id;

    const emitMeta = (nextDirty: boolean, nextData: any[]) => {
      onMetaChange?.(tab, {
        isDirty: nextDirty,
        isEmpty: nextData.length === 0,
      });
    };

    const emitSelection = (data: any[], index: number) => {
      const row = index >= 0 && index < data.length ? data[index] : null;
      onSelectionChange?.(tab, row);
    };

    const fetchList = async (preferSelectedIndex?: number) => {
      try {
        setState({ loading: true });

        const resp = await getList({ TST: tab });

        if (!resp || resp.code !== 0) {
          setState({
            tableData: [],
            selectedRowIndex: -1,
            isDirty: false,
            copyValue: {},
          });
          emitMeta(false, []);
          emitSelection([], -1);
          message.error(resp?.msg || "获取列表失败");
          return;
        }

        const data = resp.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.list)
          ? data.list
          : Array.isArray(data?.records)
          ? data.records
          : [];

        const nextSelected =
          list.length === 0
            ? -1
            : typeof preferSelectedIndex === "number"
            ? Math.min(Math.max(preferSelectedIndex, 0), list.length - 1)
            : 0;

        setState({
          tableData: list,
          selectedRowIndex: nextSelected,
          isDirty: false,
        });

        emitSelection(list, nextSelected);
        emitMeta(false, list);
      } catch (e: any) {
        setState({
          tableData: [],
          selectedRowIndex: -1,
          isDirty: false,
          copyValue: {},
        });
        emitSelection([], -1);
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

    useEffect(() => {
      emitSelection(tableData, selectedRowIndex);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableData, selectedRowIndex]);

    // ✅ 操作锁统一封装：防止用户在接口未返回时继续操作
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
        await fetchList(insertIndex);

        setState({ isDirty: true });
        onMetaChange?.(tab, { isDirty: true, isEmpty: false });
      });
    };

    useImperativeHandle(ref, () => ({
      insertFromTree: ({ title }) => insertTreeNode(title),
    }));

    const moveRow = async (index: number, direction: "up" | "down") => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= tableData.length) return;

      await runWithLock(async () => {
        const res = await moveOne({ TST: tab });
        if (!res || res.code !== 0) {
          message.error(res?.msg || "移动失败");
          return;
        }

        message.success(direction === "up" ? "上移成功" : "下移成功");
        await fetchList(targetIndex);

        setState({ isDirty: true });
        onMetaChange?.(tab, { isDirty: true, isEmpty: false });
      });
    };

    const deleteRow = (index: number) => {
      Modal.confirm({
        title: "确认删除吗？",
        onOk: async () => {
          const row = tableData[index];
          if (!row) return;

          await runWithLock(async () => {
            const res = await deleteOne({ TST: tab });

            if (!res || res.code !== 0) {
              message.error(res?.msg || "删除失败");
              return;
            }

            message.success("删除成功");
            await fetchList(index);

            setState({ isDirty: true });
            onMetaChange?.(tab, { isDirty: true, isEmpty: false });
          });
        },
      });
    };

    const handleRowClick = (record: any, index: number) => {
      if (opLoading) return; // ✅ 操作期间不允许切换行，避免混乱
      setState({ selectedRowIndex: index });
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
      setState({ copyValue: tableData[selectedRowIndex] });
      message.success("复制成功");
    };

    const handlePaste = async () => {
      if (!hasClipboard) return;

      const title = copyValue?.TIName || copyValue?.title || copyValue?.command;
      if (!title) {
        message.warning("复制内容无效，无法粘贴");
        return;
      }

      await insertTreeNode(title);
    };

    const handleCut = () => {
      if (!hasSelectedRow) return;

      if (opLoading) return;

      const cutItem = tableData[selectedRowIndex];
      if (!cutItem) return message.warning("无效的行数据");

      setState({ copyValue: cutItem });

      const next = tableData.filter(
        (_: any, i: number) => i !== selectedRowIndex
      );

      // ✅ 如你后续剪切也走后端：这里替换成 deleteOne + fetchList()
      setState({
        tableData: next,
        selectedRowIndex: next.length
          ? Math.min(selectedRowIndex, next.length - 1)
          : -1,
        isDirty: true,
      });

      emitMeta(true, next);
      message.success("剪切成功");
    };

    const columns: any = useMemo(
      () => [
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
        { title: "测试序列", dataIndex: "Seq", ellipsis: true },
        { title: "扩展名", dataIndex: "TIName", ellipsis: true },
        {
          title: "报告",
          valueType: "select",
          dataIndex: "report",
          ellipsis: true,
          valueEnum: {
            success: { text: "✓", status: "Success" },
            error: { text: "✗", status: "Error" },
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
                onClick={() => {
                  if (disabled) return;
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
          loading={loading || opLoading} // ✅ 操作中也显示 loading
          toolBarRender={() => [
            <Button
              key="insert"
              icon={<PlusOutlined />}
              onClick={handleInsertBtn}
              disabled={!canInsert}
              title={
                !selectedProject?.id
                  ? "请先选择右侧测试项目（第3级节点）"
                  : !canEdit
                  ? "文件已发布或操作中，不可更改"
                  : ""
              }
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
              disabled={!canEdit || !hasClipboard}
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
          onRow={(record, index) => ({
            onClick: () => handleRowClick(record, index || 0),
          })}
          rowClassName={(_, index) =>
            selectedRowIndex === index ? "selected-row" : ""
          }
        />

        <EditModal
          open={isEditModalOpen}
          updateValue={updateValue}
          type="UUT"
          onCancel={() => setState({ isEditModalOpen: false })}
          onOk={async (values: any) => {
            setState({ isEditModalOpen: false });

            await runWithLock(async () => {
              const res = await updateOne({
                TST: tab,
                ...values,
              });

              if (!res || res.code !== 0) {
                message.error(res?.msg || "编辑失败");
                return;
              }

              message.success("编辑成功");
              await fetchList(selectedRowIndex);

              setState({ isDirty: true });
              onMetaChange?.(tab, { isDirty: true, isEmpty: false });
            });
          }}
        />
      </div>
    );
  }
);

export default UutPage;
