import { EditOutlined } from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Form, Input, message, Modal } from "antd";
import React, { useEffect } from "react";

// ✅ 按你项目真实接口修改这里的导入与函数名
// 约定：
// - getConList({ TST, id, Seq, isAll }) => { code, data, msg }
// - updateConditionOne({ TST, id, Seq, isAll?, condId, ...payload }) => { code, msg }

import {
  getConList,
  updateConditionOne,
} from "@/services/case-management/test-sequence-process.service";
type TST = "Pre" | "UUT" | "Post";

type Props = {
  TST: TST;
  selectedRow: any | null; // 来自 index，当前 tab 选中行
  isAll: boolean; // 来自 index 的“编辑所有测试条件”
};

const TestCondition: React.FC<Props> = ({ TST, selectedRow, isAll }) => {
  const [state, setState] = useSetState<any>({
    tableData: [] as any[],
    isOpen: false,

    loading: false,
    editValue: null as any | null,
  });

  const layout = {
    labelCol: { span: 24 },
  };

  const { tableData, isOpen, editValue, loading } = state;
  const [form] = Form.useForm();

  // ✅ 选中行的 id + seq（兼容命名：seq/Seq/sequence）
  const rowId = selectedRow?.id;
  const rowSeq =
    selectedRow?.seq ??
    selectedRow?.Seq ??
    selectedRow?.sequence ??
    selectedRow?.SEQ;

  const normalizeList = (resp: any) => {
    if (!resp || resp.code !== 0) return [];
    const data = resp.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.list)) return data.list;
    if (Array.isArray(data?.records)) return data.records;
    return [];
  };

  const fetchList = async () => {
    // ✅ 没选中行：清空
    if (!rowId || !TST) {
      setState({ tableData: [] });
      return;
    }

    try {
      setState({ loading: true });
      const resp = await getConList({
        TST,
        id: rowId,
        Visible: isAll ? 1 : 0,
      });

      if (!resp || resp.code !== 0) {
        setState({ tableData: [] });
        message.error(resp?.msg || "获取测试条件失败");
        return;
      }

      setState({ tableData: normalizeList(resp) });
    } catch (e: any) {
      setState({ tableData: [] });
    } finally {
      setState({ loading: false });
    }
  };

  useEffect(() => {
    fetchList();
  }, [TST, rowId, rowSeq, isAll]);

  const columns: any = [
    { title: "扩展名", dataIndex: "VariableName_Extern", ellipsis: true },
    { title: "变量名", dataIndex: "VariableName", ellipsis: true },
    { title: "值", dataIndex: "Value", ellipsis: true },
    { title: "单位", dataIndex: "Unit", ellipsis: true },
    {
      title: "操作",
      valueType: "option" as const,
      key: "option",
      width: 50,
      render: (_text: any, record: any) => [
        <a
          key="editable"
          onClick={(e) => {
            e.stopPropagation();

            if (!rowId || !rowSeq) {
              message.warning("请先在左侧选择一条测试序列");
              return;
            }

            setState({ isOpen: true, editValue: record });

            // ✅ 回填当前行数据（你原来只 set variable，这里按实际字段回填 val）
            form.setFieldsValue({
              val: record.val,
            });
          }}
        >
          <EditOutlined />
        </a>,
      ],
    },
  ];

  return (
    <div className="testCondition-page">
      <ProTable<any>
        columns={columns}
        search={false}
        options={false}
        dataSource={tableData}
        rowKey="Para_ID"
        pagination={false}
        size="small"
        loading={loading}
      />

      <Modal
        title="测试条件"
        open={isOpen}
        onCancel={() => {
          setState({ isOpen: false, editValue: null });
          form.resetFields();
        }}
        onOk={async () => {
          if (!rowId) {
            message.warning("请先在左侧选择一条测试序列");
            return;
          }

          try {
            const values = await form.validateFields();
            const res = await updateConditionOne({
              TST,
              id: rowId,
              CallName: editValue?.VariableName,
              ...values,
            });

            if (!res || res.code !== 0) {
              message.error(res?.message || "操作失败");
              return;
            }

            message.success(res?.message || "操作成功");
            setState({ isOpen: false, editValue: null });
            form.resetFields();
            await fetchList();
          } catch (e: any) {
            // validateFields 抛错不提示“异常”
            if (e?.errorFields) return;
          }
        }}
      >
        <Form {...layout} form={form}>
          <Form.Item name="Value" label="值">
            <Input placeholder="输入值" allowClear />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TestCondition;
