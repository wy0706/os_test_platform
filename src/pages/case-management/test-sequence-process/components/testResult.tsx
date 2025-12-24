import { EditOutlined } from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Form, Input, message, Modal } from "antd";
import React, { useEffect, useMemo } from "react";

// ✅ 按你项目真实接口修改这里的导入与函数名
// 约定：
// - getResultList({ TST, id, Seq }) => { code, data, msg }
// - updateResultOne({ TST, id, Seq, resultId, ...payload }) => { code, msg }
// import {
//   getResultList,
//   updateResultOne,
// } from "@/services/task-management/test-requirement.service";
import {
  getResultList,
  updateResultOne,
} from "@/services/case-management/test-sequence-process.service";
type TST = "Pre" | "UUT" | "Post";

type Props = {
  TST: TST;
  selectedRow: any | null; // 来自 index，当前 tab 选中行
};

const TestResult: React.FC<Props> = ({ TST, selectedRow }) => {
  const [state, setState] = useSetState<any>({
    tableData: [] as any[],
    isOpen: false,
    editId: null as number | string | null,
    loading: false,
    editValue: null as any | null,
  });

  const layout = useMemo(() => ({ labelCol: { span: 24 } }), []);
  const { tableData, isOpen, editId, loading, editValue } = state;

  const [form] = Form.useForm();

  // ✅ 选中行的 id + seq（兼容你列表里字段命名：seq/Seq/sequence）
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
    // 没选中：清空
    if (!rowId || !TST) {
      setState({ tableData: [] });
      return;
    }

    try {
      setState({ loading: true });

      const resp = await getResultList({
        TST,
        id: rowId,
      });

      // 非 0：清空
      if (!resp || resp.code !== 0) {
        setState({ tableData: [] });
        message.error(resp?.msg || "获取测试结果失败");
        return;
      }

      const list = normalizeList(resp);
      setState({ tableData: list });
    } catch (e: any) {
      setState({ tableData: [] });
      message.error(e?.message || "获取测试结果异常");
    } finally {
      setState({ loading: false });
    }
  };

  // ✅ TST 或选中行变化：自动获取
  useEffect(() => {
    fetchList();
  }, [TST, rowId]);

  const columns = [
    {
      title: "扩展名",
      dataIndex: "VariableName_Extern",
      ellipsis: true,
    },
    {
      title: "变量名",
      dataIndex: "VariableName",
      ellipsis: true,
    },
    {
      title: "最小值",
      dataIndex: "MinValue",
      ellipsis: true,
    },
    {
      title: "最大值",
      dataIndex: "MaxValue",
      ellipsis: true,
    },
    {
      title: "单位",
      dataIndex: "Unit",
      ellipsis: true,
    },
    {
      title: "注释",
      dataIndex: "Comments",
      ellipsis: true,
    },
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
            if (!rowId) {
              message.warning("请先在左侧选择一条测试序列");
              return;
            }

            setState({ isOpen: true, editValue: record });
            form.setFieldsValue({
              MinValue: record.MinValue,
              MaxValue: record.MaxValue,
              Comments: record.Comments,
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
        title="测试结果"
        open={isOpen}
        onCancel={() => {
          setState({ isOpen: false, editValue: null });
          form?.resetFields();
        }}
        onOk={async () => {
          if (!rowId) {
            message.warning("请先在左侧选择一条测试序列");
            return;
          }

          try {
            const values = await form.validateFields();

            // ✅ 调真实编辑接口（成功后 fetchList）
            const res = await updateResultOne({
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
          <Form.Item name="MinValue" label="最小值">
            <Input style={{ width: "100%" }} placeholder="输入最小值" />
          </Form.Item>

          <Form.Item name="MaxValue" label="最大值">
            <Input style={{ width: "100%" }} placeholder="输入最大值" />
          </Form.Item>

          <Form.Item name="Comments" label="注释">
            <Input placeholder="输入注释" allowClear />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TestResult;
