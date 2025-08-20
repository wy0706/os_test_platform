import { EditOutlined } from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Form, Input, InputNumber, message, Modal } from "antd";
import React, { useEffect } from "react";
const TestResult: React.FC = () => {
  const [state, setState] = useSetState<any>({
    tableData: [
      {
        id: 1,
        extension: "",
        variable: "string",
        minVal: "ok",
        maxVal: "",
        unit: "",
        annotation: "",
      },
      {
        id: 12,
        extension: "",
        variable: "fatal_SM",
        val: "FATAL STATUS",
        unit: "",
        annotation: "",
      },
    ],
    isOpen: false,
    editId: null,
  });
  const layout = {
    labelCol: { span: 24 },
  };
  const { tableData, isOpen, editId } = state;
  const [form] = Form.useForm();
  const columns = [
    {
      title: "扩展名",
      dataIndex: "extension",
      ellipsis: true,
    },
    {
      title: "变量名",
      dataIndex: "variable",
      ellipsis: true,
    },
    {
      title: "最小值",
      dataIndex: "minVal",
      ellipsis: true,
    },
    {
      title: "最大值",
      dataIndex: "maxVal",
      ellipsis: true,
    },
    {
      title: "单位",
      dataIndex: "unit",
      ellipsis: true,
    },
    {
      title: "注释",
      dataIndex: "annotation",
      ellipsis: true,
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      width: 50,
      render: (text: any, record: any, _: any, action: any) => [
        <a
          key="editable"
          onClick={(e) => {
            e.stopPropagation();
            setState({ isOpen: true, editId: record.id });
            form.setFieldsValue({ variable: record.variable });
          }}
        >
          <EditOutlined />
        </a>,
      ],
    },
  ];
  useEffect(() => {}, []);

  return (
    <div className="testCondition-page">
      <ProTable<any>
        columns={columns}
        search={false}
        options={false}
        dataSource={tableData}
        rowKey="id"
        pagination={false}
        size="small"
      />
      <Modal
        title="测试结果"
        open={isOpen}
        onCancel={() => {
          setState({ isOpen: false, editId: null });
        }}
        onOk={() => {
          setState({ isOpen: false });
          console.log("ok");
          form.validateFields().then((res) => {
            const newData = tableData.map((item: { id: any }) =>
              item.id === editId ? { ...item, ...res } : item
            );
            setState({ tableData: newData, editId: null });
            message.success("操作成功");
          });
        }}
      >
        <Form {...layout} form={form}>
          <Form.Item name="minVal" label="最小值">
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              placeholder="输入最小值"
            />
          </Form.Item>
          <Form.Item name="maxVal" label="最大值">
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              placeholder="输入最小值"
            />
          </Form.Item>
          <Form.Item name="annotation" label="注释">
            <Input placeholder="输入注释" allowClear />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TestResult;
