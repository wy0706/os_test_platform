import { updateTypeOne } from "@/services/system-management/equip-management.service";
import { useSetState } from "ahooks";
import { Form, Input, message, Modal, Select } from "antd";
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

const AddTypeModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  type,
  updateValue,
}) => {
  const [state, setState] = useSetState<any>({
    title: "新建",
    confirmLoading: false,
  });
  const { title, confirmLoading } = state;

  useEffect(() => {
    initData();
  }, [open, type, updateValue]);

  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    console.log("Form values:", values);
    if (type == "add") {
      const { code, message: msg } = await updateTypeOne({ ...values });
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");
    } else {
      const { code, message: msg } = await updateTypeOne({
        ...values,
      });
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");
    }
    if (onOk) {
      onOk(values);
    }
  };
  const initData = () => {
    if (open) {
      form?.resetFields();
      const name = type === "add" ? "新建" : "编辑";
      setState({ title: name });

      if (type === "edit") {
        form?.setFieldsValue({
          ...updateValue,
          group_index: updateValue?.group_id || "",
        });
      }
    }
  };

  return (
    <Modal
      title={`${title}设备类型`}
      maskClosable={false}
      open={open}
      confirmLoading={confirmLoading}
      onCancel={() => {
        onCancel && onCancel();
      }}
      afterClose={() => form.resetFields()}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      onOk={handleOk}
    >
      <Form {...layout} form={form}>
        <Form.Item
          name="group_name"
          label="设备类型"
          rules={[{ required: true }]}
        >
          <Input placeholder="输入设备类型" allowClear />
        </Form.Item>
        <Form.Item
          name="group_comment"
          label="备注"
          rules={[{ required: true }]}
        >
          <Input placeholder="输入设备类型备注" allowClear />
        </Form.Item>

        <Form.Item
          name="group_index"
          label="设备类型编码"
          rules={[{ required: type == "edit" ? true : false }]}
        >
          <Input placeholder="系统自动分配" disabled />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddTypeModal;
