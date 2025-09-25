import {
  createOne,
  updateOne,
} from "@/services/case-management/test-case-example.service";
import { Form, Input, InputNumber, message, Modal, Select } from "antd";
import { useEffect, useState } from "react";
interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  data: any;
  type: string;
  licId: string | number;
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
  type,
  licId,
}) => {
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (type == "edit") {
        form?.setFieldsValue({
          ...data,
          module_name: data.name || "",
        });
      }
    } else {
      form?.resetFields();
    }
  }, [open, type, data, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitLoading(true);
      if (type == "add") {
        if (!licId) {
          message.error("缺少必要的用例库ID");
          return;
        }
        const { code, message: msg } = await createOne({
          ...values,
          lib_id: licId,
        });

        if (code !== 0) {
          message.error(msg || "创建失败");
          return;
        }
        message.success(msg || "创建成功");
      } else {
        const { code, message: msg } = await updateOne({
          ...values,
          module_id: data.id,
        });
        if (code !== 0) {
          message.error(msg || "创建失败");
          return;
        }
        message.success(msg || "创建成功");
      }
      onOk && onOk(values);
    } catch (error) {
      console.log("Validation Failed:", error);
      return;
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Modal
      title={type == "add" ? "创建模块" : "编辑模块"}
      maskClosable={false}
      open={open}
      destroyOnHidden
      confirmLoading={submitLoading}
      onCancel={() => {
        form?.resetFields();
        onCancel && onCancel();
      }}
      styles={{ body: { padding: 20 } }}
      width={"60%"}
      onOk={handleOk}
    >
      <Form {...layout} form={form} name="control-hooks">
        <Form.Item
          name="module_name"
          label="模块名"
          rules={[{ required: true }]}
        >
          <Input placeholder="输入模块名" maxLength={32} />
        </Form.Item>
        <Form.Item name="coverage" label="覆盖率" rules={[{ required: true }]}>
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
