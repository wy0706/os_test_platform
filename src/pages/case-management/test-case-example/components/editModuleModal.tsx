import { Form, Input, InputNumber, Modal, Select } from "antd";
import { useEffect } from "react";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  data: any;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const EditModuleModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  data,
}) => {
  useEffect(() => {
    if (open) {
      console.log("data", data);
      if (data) {
        form?.setFieldsValue({
          coverage: parseFloat("40%") || undefined, // => 40
          name: data.name,
        });
      }
    } else {
      form?.resetFields();
    }
  }, [open]);

  const [form] = Form.useForm();

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        values.coverage =
          values.coverage != null ? `${values.coverage}%` : undefined;
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
      title="创建用例"
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { padding: 20 } }}
      width={"60%"}
      onOk={handleOk}
    >
      <Form {...layout} form={form} name="control-hooks">
        <Form.Item name="name" label="模块名" rules={[{ required: true }]}>
          <Input placeholder="输入模块名" maxLength={32} />
        </Form.Item>
        <Form.Item name="coverage" label="覆盖率">
          <InputNumber
            min={0}
            max={100}
            placeholder="输入覆盖率"
            style={{ width: "100%" }}
            addonAfter="%"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditModuleModal;
