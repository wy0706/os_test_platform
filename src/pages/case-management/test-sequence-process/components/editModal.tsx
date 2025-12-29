import { updateOne } from "@/services/case-management/test-sequence-process.service";
import { useSetState } from "ahooks";
import { Form, Input, message, Modal, Select } from "antd";
import { useEffect } from "react";

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
  const [state, setState] = useSetState<any>({
    confirmLoading: false,
  });
  const { confirmLoading } = state;
  useEffect(() => {
    if (open) {
      form?.setFieldsValue(updateValue);
    }
  }, [open, updateValue]);

  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    try {
      setState({ confirmLoading: true });
      delete values.TIName; // TIName 不允许修改
      const res = await updateOne({
        id: updateValue?.id,
        TST: type,
        ...values, // Active / RPTFlag / Comments
      });
      if (res?.code !== 0) {
        message.error(res?.message || "操作失败");
        return;
      }
      message.success(res?.message || "操作成功");
      if (onOk) {
        onOk(values, type);
      }
    } catch (error) {
    } finally {
      setState({ confirmLoading: false });
    }
  };

  return (
    <Modal
      title={`${type}编辑`}
      maskClosable={false}
      open={open}
      confirmLoading={confirmLoading}
      onCancel={() => {
        form?.resetFields();
        onCancel && onCancel();
      }}
      styles={{ body: { padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form {...layout} form={form} name="control-hooks">
        <Form.Item name="Active" label="激活">
          <Select placeholder="选择是否发布" allowClear>
            <Option value={1}>✓</Option>
            <Option value={0}>✗</Option>
          </Select>
        </Form.Item>
        <Form.Item name="TIName" label="测试序列">
          <Input disabled />
        </Form.Item>
        <Form.Item name="Comments" label="备注">
          <Input />
        </Form.Item>
        <Form.Item name="RPTFlag" label="报告">
          <Select placeholder="选择报告" allowClear>
            <Option value={1}>✓</Option>
            <Option value={0}>✗</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditModal;
