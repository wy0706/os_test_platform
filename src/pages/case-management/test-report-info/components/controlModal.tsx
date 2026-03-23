import { useModel } from "@umijs/max";
import { Form, Input, message, Modal, Select } from "antd";
import { useEffect, useState } from "react";

import { createOne } from "@/services/case-management/test-case.service";
interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  onSelect?: () => void;
  testData?: any;
  type?: string;
  updateValue?: any;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const ControlModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  onSelect,
  testData,
  type,
  updateValue,
}) => {
  const { initialState } = useModel("@@initialState");
  const { currentUser } = initialState || {};
  const [userList, setUserList] = useState<any[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    initData();
  }, [open, updateValue]);
  const initData = async () => {
    if (open) {
      form?.resetFields();

      console.log("update", updateValue);
    }
  };

  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    setSubmitLoading(true);
    try {
      const { code, message: msg } = await createOne(values);
      if (code !== 0) {
        message.error(msg);
        return;
      }
      message.success(msg);
      onOk?.(values);
    } catch (error) {
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Modal
      title="生成报告控件"
      maskClosable={false}
      open={open}
      onCancel={() => {
        form?.resetFields();
        onCancel && onCancel();
      }}
      destroyOnHidden
      confirmLoading={submitLoading}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      onOk={handleOk}
    >
      <Form {...layout} form={form}>
        <Form.Item
          name="lib_name"
          label="报告名称"
          rules={[{ required: true }]}
        >
          <Input placeholder="输入报告名称" maxLength={32} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ControlModal;
