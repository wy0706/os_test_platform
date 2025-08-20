import { Form, Input, Modal, Select } from "antd";
import { useEffect, useState } from "react";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any, type: any) => void;
  onCancel?: () => void;
  updateValue: any;
  type: string;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const EditModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  type,
  updateValue,
}) => {
  const [title, setTitle] = useState<any>(null);

  useEffect(() => {
    if (open) {
      const name =
        type == "pre"
          ? "Pre"
          : type == "uut"
          ? "UUT"
          : type == "post"
          ? "Post"
          : null;
      setTitle(name);
      form?.setFieldsValue(updateValue);
    }
  }, [open, updateValue]);

  const [form] = Form.useForm();

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (onOk) {
          onOk({ ...updateValue, ...values }, type);
        }
      })
      .catch((errorInfo) => {
        console.error("Validation failed:", errorInfo);
      });
  };

  return (
    <Modal
      title={`${title}编辑`}
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
          <Select placeholder="选择是否发布">
            <Option value="success">✓</Option>
            <Option value="error">✗</Option>
          </Select>
        </Form.Item>{" "}
        <Form.Item name="title" label="测试项目">
          <Input />
        </Form.Item>{" "}
        <Form.Item name="extension" label="扩展名">
          <Input />
        </Form.Item>{" "}
        <Form.Item name="report" label="报告">
          <Select placeholder="选择报告">
            <Option value="success">✓</Option>
            <Option value="error">✗</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditModal;
