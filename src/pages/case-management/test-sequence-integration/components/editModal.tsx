import { Form, Modal, Select } from "antd";
import { useEffect, useState } from "react";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  updateValue?: any;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const EditModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,

  updateValue,
}) => {
  const [title, setTitle] = useState("序列集成");

  useEffect(() => {
    if (open) {
      setTitle(`${updateValue?.title}`);
      const name = updateValue.title;
      form?.resetFields();

      form?.setFieldsValue(updateValue);
    }
  }, [open, updateValue]);

  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log(values);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
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
      title={title}
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form {...layout} form={form} name="control-hooks">
        <Form.Item name="status" label="发布" rules={[{ required: true }]}>
          <Select placeholder="选择是否发布">
            <Option value="success">✓</Option>
            <Option value="error">✗</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditModal;
