import { Form, Input, Modal, Select } from "antd";
import { useEffect } from "react";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  type: string;
  updateValue?: any;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const AddLeftModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  type,
  updateValue,
}) => {
  const [form] = Form.useForm();
  useEffect(() => {
    if (open) {
      form?.resetFields();
      console.log(updateValue);

      updateValue && form?.setFieldsValue({ ...updateValue });
    }
  }, [open, type, updateValue, form]);

  const handleOk = () => {
    console.log("111");
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
      title={type === "edit" ? "编辑序列" : "新建序列"}
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form {...layout} form={form} name="control-hooks">
        <Form.Item name="name" label="名称" rules={[{ required: true }]}>
          <Input placeholder="输入名称" maxLength={32} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddLeftModal;
