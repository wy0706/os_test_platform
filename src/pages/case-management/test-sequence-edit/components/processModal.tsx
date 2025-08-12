import { Form, Input, Modal, Select } from "antd";
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

const ProcessModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  updateValue,
}) => {
  const [title, setTitle] = useState("add");
  // 加载树数据

  useEffect(() => {
    if (open) {
      form?.resetFields();
      updateValue && form?.setFieldsValue({ ...updateValue });
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
      title="测试流程"
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
        <Form.Item name="status" label="激活">
          <Select placeholder="是否激活">
            <Option value="success">✓</Option>
            <Option value="error">✗</Option>
          </Select>
        </Form.Item>
        <Form.Item name="tag" label="标签">
          <Input placeholder="输入标签" />
        </Form.Item>
        <Form.Item name="description" label="注释">
          <Input placeholder="输入注释" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProcessModal;
