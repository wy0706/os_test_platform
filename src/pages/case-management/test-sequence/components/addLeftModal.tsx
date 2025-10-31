import {
  createSequenceType,
  updateSequenceType,
} from "@/services/case-management/test-sequence.service";
import { useSetState } from "ahooks";
import { Form, Input, message, Modal, Select } from "antd";
import { useEffect } from "react";
interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  type: string;
  updateValue?: any;
  parentsId: any;
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
  parentsId,
}) => {
  const [form] = Form.useForm();

  const [state, setState] = useSetState<any>({
    submitLoading: false,
  });
  const { submitLoading } = state;
  useEffect(() => {
    initData();
  }, [open, type, updateValue]);
  const initData = () => {
    if (open) {
      form?.resetFields();
      updateValue && form?.setFieldsValue({ tigroup: updateValue.name });
    }
  };
  const handleOk = async () => {
    const values = await form.validateFields();
    try {
      setState({
        submitLoading: true,
      });
      if (type == "add") {
        const { code, message: msg } = await createSequenceType({
          sysoruser: parentsId,
          ...values,
        });
        if (code !== 0) {
          message.error(msg || "操作失败");
          return;
        }
        message.success(msg || "操作成功");
      } else {
        const { code, message: msg } = await updateSequenceType({
          ...values,
          sequencetype_id: updateValue.rawKey,
        });
        if (code !== 0) {
          message.error(msg || "操作失败");
          return;
        }
        message.success(msg || "操作成功");
      }
      if (onOk) {
        onOk({ ...values, parentsId });
      }
    } finally {
      setState({
        submitLoading: false,
      });
    }
  };

  return (
    <Modal
      title={type === "edit" ? "编辑序列" : "新建序列"}
      maskClosable={false}
      open={open}
      confirmLoading={submitLoading}
      onCancel={() => {
        onCancel && onCancel();
      }}
      afterClose={() => form?.resetFields()}
      styles={{ body: { padding: 20 } }}
      onOk={handleOk}
    >
      <Form {...layout} form={form}>
        <Form.Item name="tigroup" label="名称" rules={[{ required: true }]}>
          <Input placeholder="输入名称" maxLength={32} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddLeftModal;
