import { updateOneCmd } from "@/services/case-management/test-sequence-edit.service";
import { useSetState } from "ahooks";
import { Form, Input, message, Modal, Select } from "antd";
import { useEffect } from "react";

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
  const [state, setState] = useSetState<any>({
    confirmLoading: false,
  });
  const { confirmLoading } = state;
  useEffect(() => {
    initData();
  }, [open, updateValue]);
  const initData = () => {
    if (open) {
      form?.resetFields();
      updateValue && form?.setFieldsValue({ ...updateValue });
    }
  };
  const [form] = Form.useForm();
  const handleOk = async () => {
    const values = await form.validateFields();
    try {
      setState({
        confirmLoading: true,
      });
      const { code, message: msg } = await updateOneCmd({
        ...values,
        seq_id: updateValue.seq_id,
      });
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");
      onOk?.(values);
    } finally {
      setState({
        confirmLoading: false,
      });
    }
    if (onOk) {
      onOk(values);
    }
  };

  return (
    <Modal
      title="测试流程"
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      confirmLoading={confirmLoading}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form {...layout} form={form}>
        <Form.Item name="active" label="激活">
          <Select placeholder="是否激活">
            <Option value={1}>✓</Option>
            <Option value={0}>✗</Option>
          </Select>
        </Form.Item>
        <Form.Item name="label" label="标签">
          <Input placeholder="输入标签" />
        </Form.Item>
        <Form.Item name="comment" label="注释">
          <Input placeholder="输入注释" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProcessModal;
