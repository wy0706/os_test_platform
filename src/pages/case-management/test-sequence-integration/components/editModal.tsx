import { updateOne } from "@/services/case-management/test-sequence-integration.service";
import { useSetState } from "ahooks";
import { Form, message, Modal, Select } from "antd";
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

const EditModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  updateValue,
}) => {
  const [state, setState] = useSetState<any>({
    title: "序列集成",
    confirmLoading: false,
  });
  const { title, confirmLoading } = state;

  useEffect(() => {
    if (open) {
      form?.resetFields();
      setState({
        title: `${updateValue?.tpf_file}`,
      });
      form?.setFieldsValue(updateValue);
    }
  }, [open, updateValue]);

  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    try {
      setState({ confirmLoading: true });
      if (!updateValue?.tpf_file_id) {
        message.error("缺少必要参数，操作失败");
        return;
      }
      const { code, message: msg } = await updateOne({
        id: updateValue?.tpf_file_id,
        ...values,
      });
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      if (onOk) {
        onOk(values);
      }
    } catch (error) {
    } finally {
      setState({ confirmLoading: false });
    }
  };

  return (
    <Modal
      title={title}
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      confirmLoading={confirmLoading}
      styles={{ body: { padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form {...layout} form={form} name="control-hooks">
        <Form.Item
          name="is_published"
          label="发布"
          rules={[{ required: true }]}
        >
          <Select placeholder="选择是否发布">
            <Option value={1}>✓</Option>
            <Option value={0}>✗</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditModal;
