import { Form, Modal, Select } from "antd";
import { useEffect } from "react";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const CreateReportModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();
  useEffect(() => {
    if (open) {
      console.log("CreateReportModal opened");
    } else {
      form.resetFields;
    }
  }, [open]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onOk?.(values);
      })
      .catch((errorInfo) => {
        console.error("Validation failed:", errorInfo);
      });
  };

  return (
    <Modal
      title="生成测试报告"
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      {" "}
      <Form {...layout} form={form} name="control-hooks">
        <Form.Item
          name="note"
          label="模版"
          rules={[{ required: true }]}
          initialValue={"1"}
        >
          <Select placeholder="请选择模版">
            <Option value="1">默认模版</Option>
            <Option value="2" disabled>
              自定义模版
            </Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateReportModal;
