import { getList } from "@/services/case-management/test-sequence-process.service";
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
import { Button, message, Modal, Spin } from "antd";
import { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import EditModal from "./editModal";

export type TablePageRef = {
  insertFromTree: (node: { key: string; title: string }) => void;
};

type TabKey = "Pre" | "UUT" | "Post";
type SelectedProject = { key: string; title: string } | null;

interface Props {
  tab: TabKey;
  recordId: string; // params.id
  isRelease: boolean;
  selectedProject: SelectedProject;
  onMetaChange?: (
    tab: TabKey,
    meta: { isDirty: boolean; isEmpty: boolean }
  ) => void;
}

const PrePage = forwardRef<TablePageRef, Props>(
  ({ tab, recordId, isRelease, selectedProject, onMetaChange }, ref) => {
    const [state, setState] = useSetState<any>({
      loading: false,
      tableData: [] as any[],
      selectedRowIndex: -1,
      isDirty: false,

      updateValue: {},
      isEditModalOpen: false,

      copyValue: {},
    });

    const {
      loading,
      tableData,
      selectedRowIndex,
      isDirty,
      updateValue,
      isEditModalOpen,
      copyValue,
    } = state;

    const emitMeta = (nextDirty: boolean, nextData: any[]) => {
      onMetaChange?.(tab, {
        isDirty: nextDirty,
        isEmpty: nextData.length === 0,
      });
    };

    const normalizeList = (resp: any) => {
      const data = resp?.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.list)) return data.list;
      if (Array.isArray(data?.records)) return data.records;
      return [];
    };

    const fetchList = async () => {
      try {
        setState({ loading: true });
        // 你原来是 getList({ tab: key })，这里仍保持一致
        const resp = await getList({ tab });
        const list = normalizeList(resp);

        setState({
          tableData: list,
          selectedRowIndex: list.length ? 0 : -1,
          isDirty: false,
        });
        emitMeta(false, list);
      } catch (e) {
        setState({
          tableData: [],
          selectedRowIndex: -1,
          isDirty: false,
        });
        emitMeta(false, []);
      } finally {
        setState({ loading: false });
      }
    };

    useEffect(() => {
      // add 页面通常也需要初始化为空列表（或后端返回空）
      fetchList();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, recordId]);

    const updateTable = (next: any[], nextSelected?: number, dirty = true) => {
      const sel =
        typeof nextSelected === "number"
          ? nextSelected
          : next.length
          ? Math.min(selectedRowIndex, next.length - 1)
          : -1;

      setState({
        tableData: next,
        selectedRowIndex: sel,
        isDirty: dirty ? true : false,
      });
      emitMeta(dirty ? true : false, next);
    };

    const buildNewRow = (nodeKey: string, nodeTitle: string) => ({
      id: Date.now(),
      status: "success",
      command: nodeKey,
      extention: "测试数据",
      title: ` ${nodeTitle}`,
    });

    const insertTreeNode = async (nodeKey: string, nodeTitle: string) => {
      if (isRelease) {
        message.info("文件已发布，不可更改 ！");
        return;
      }

      const insertIndex =
        selectedRowIndex >= 0 ? selectedRowIndex + 1 : tableData.length;

      const newRow = buildNewRow(nodeKey, nodeTitle);

      // TODO: 调真实接口（建议后端返回插入后的完整行/列表）
      // await createRow({ tab, recordId, ...newRow })

      const next = [...tableData];
      next.splice(insertIndex, 0, newRow);
      next.forEach((item, i) => (item.sequence = i + 1));
      updateTable(next, insertIndex, true);

      message.success(tableData.length === 0 ? "已插入第一行" : "插入成功");
    };

    useImperativeHandle(ref, () => ({
      insertFromTree: ({ key, title }) => insertTreeNode(key, title),
    }));

    const columns: any = useMemo(
      () => [
        {
          title: "激活",
          dataIndex: "status",
          ellipsis: true,
          valueType: "select",
          valueEnum: {
            success: { text: "✓", status: "Success" },
            error: { text: "✗", status: "Error" },
          },
        },
        { title: "测试序列", dataIndex: "title", ellipsis: true },
        { title: "扩展名", dataIndex: "extension", ellipsis: true },
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
          fixed: "right",
          render: (_: any, record: any, index: number) => {
            const isFirst = index === 0;
            const isLast = index === tableData.length - 1;

            return [
              <a
                key="editable"
                onClick={() => {
                  if (isRelease) return message.info("文件已发布，不可更改 ！");
                  setState({ isEditModalOpen: true, updateValue: record });
                }}
                style={{ marginRight: 10, color: "#1677ff" }}
              >
                <EditOutlined style={{ marginRight: 4 }} />
              </a>,
              <a
                key="up"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isRelease) return message.info("文件已发布，不可更改 ！");
                  if (!isFirst) moveRow(index, "up");
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
                  if (isRelease) return message.info("文件已发布，不可更改 ！");
                  if (!isLast) moveRow(index, "down");
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
                  if (isRelease) return message.info("文件已发布，不可更改 ！");
                  deleteRow(index);
                }}
                style={{ color: "#ff4d4f" }}
              >
                <DeleteOutlined style={{ marginRight: 4 }} />
              </a>,
            ];
          },
        },
      ],
      [tableData, isRelease]
    );

    const moveRow = async (index: number, direction: "up" | "down") => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= tableData.length) return;

      const next = [...tableData];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      next.forEach((item, i) => (item.sequence = i + 1));

      // TODO: 调真实接口 reorder
      // await reorderRows({ tab, recordId, list: next })

      let newSelected = selectedRowIndex;
      if (selectedRowIndex === index) newSelected = targetIndex;
      else if (selectedRowIndex === targetIndex) newSelected = index;

      updateTable(next, newSelected, true);
    };

    const deleteRow = async (index: number) => {
      Modal.confirm({
        title: "确认删除吗？",
        onOk: async () => {
          const row = tableData[index];

          // TODO: 调真实接口 delete
          // await deleteRowApi({ tab, recordId, id: row.id })

          const next = [...tableData];
          next.splice(index, 1);
          next.forEach((item, i) => (item.sequence = i + 1));

          let newSelected = selectedRowIndex;
          if (next.length === 0) newSelected = -1;
          else if (selectedRowIndex >= next.length)
            newSelected = next.length - 1;

          updateTable(next, newSelected, true);
          message.success("删除成功");
        },
      });
    };

    const handleRowClick = (_record: any, index: number) => {
      setState({ selectedRowIndex: index });
    };

    const handleInsertBtn = () => {
      if (!selectedProject?.key) {
        message.warning("请先选择右侧测试项目");
        return;
      }
      insertTreeNode(
        selectedProject.key,
        selectedProject.title || selectedProject.key
      );
    };

    const handleCopy = () => {
      if (selectedRowIndex !== -1 && tableData.length > 0) {
        setState({ copyValue: tableData[selectedRowIndex] });
        message.success("复制成功");
      } else {
        message.warning("请先选中要复制的行");
      }
    };

    const handlePaste = async () => {
      if (!copyValue || Object.keys(copyValue).length === 0) {
        message.warning("请先复制数据");
        return;
      }
      if (isRelease) return message.info("文件已发布，不可更改 ！");

      const insertIndex =
        selectedRowIndex >= 0 ? selectedRowIndex + 1 : tableData.length;

      const next = [...tableData];
      next.splice(insertIndex, 0, { ...copyValue, id: Date.now() });
      next.forEach((item, i) => (item.sequence = i + 1));

      // TODO: 调真实接口 paste/create
      updateTable(next, insertIndex, true);
      message.success("粘贴成功");
    };

    const handleCut = () => {
      if (selectedRowIndex == null || selectedRowIndex < 0) {
        message.warning("请先选中要剪切的行");
        return;
      }
      if (isRelease) return message.info("文件已发布，不可更改 ！");

      const cutItem = tableData[selectedRowIndex];
      if (!cutItem) return message.warning("无效的行数据");

      setState({ copyValue: cutItem });
      const next = tableData.filter(
        (_: any, i: number) => i !== selectedRowIndex
      );

      // TODO: 调真实接口 delete + copy
      updateTable(next, Math.min(selectedRowIndex, next.length - 1), true);
      message.success("剪切成功");
    };

    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin />
        </div>
      );
    }

    return (
      <div className="postPage-page">
        <ProTable<any>
          columns={columns}
          search={false}
          options={false}
          dataSource={tableData}
          rowKey="id"
          pagination={false}
          toolBarRender={() => [
            <Button
              key="insert"
              icon={<PlusOutlined />}
              onClick={handleInsertBtn}
            >
              插入
            </Button>,
            <Button key="copy" icon={<CopyFilled />} onClick={handleCopy}>
              复制
            </Button>,
            <Button key="paste" icon={<CopyOutlined />} onClick={handlePaste}>
              粘贴
            </Button>,
            <Button key="cut" icon={<CiOutlined />} onClick={handleCut}>
              剪切
            </Button>,
            <Button key="refresh" icon={<ReloadOutlined />} onClick={fetchList}>
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
          type="Pre"
          onCancel={() => setState({ isEditModalOpen: false })}
          onOk={async (values: any) => {
            setState({ isEditModalOpen: false });

            // TODO: 调真实接口 update
            // await updateRowApi({ tab, recordId, ...values })

            const next = tableData.map((item) =>
              item.id === values.id ? values : item
            );
            updateTable(next, selectedRowIndex, true);
          }}
        />
      </div>
    );
  }
);

export default PrePage;
