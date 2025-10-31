import { Form, Input, Modal, Select } from "antd";

import { useEffect, useState } from "react";
interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  data?: any;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const OtherModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  data,
}) => {
  const [form] = Form.useForm();
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      form?.resetFields();
      // 打开弹窗时获取所有用户列表
      // fetchAllUsers();
      // if (isUpdate && data) {
      //   console.log("uodateCalue", data);
      //   formRef.current?.setFieldsValue(data);
      // }

      form?.setFieldsValue(data);
    }
  }, [open, data]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Form values:", values);
        if (onOk) {
          onOk(values);
        }
      })
      .catch((errorInfo) => {
        console.error("Validation failed:", errorInfo);
      });
  };

  return (
    <Modal
      title="设备种类参数配置"
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { padding: 20 } }}
      onOk={handleOk}
    >
      <Form {...layout} form={form}>
        <Form.Item name="param1" label="参数1">
          <Input allowClear placeholder="输入参数1" />
        </Form.Item>{" "}
        <Form.Item name="param1" label="参数2">
          <Input allowClear placeholder="输入参数2" />
        </Form.Item>{" "}
        <Form.Item name="param1" label="参数3">
          <Input allowClear placeholder="输入参数3" />
        </Form.Item>{" "}
        <Form.Item name="param1" label="参数4">
          <Input allowClear placeholder="输入参数4" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OtherModal;
