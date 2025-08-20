import { Form, Input, Modal, Select } from "antd";
import { useEffect, useState } from "react";

interface ModalProps {
  open: boolean;
  onOk?: (values: any, type: any) => void;
  onCancel?: () => void;
  type: string;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const SaveModal: React.FC<ModalProps> = ({ open, onOk, onCancel, type }) => {
  const [title, setTitle] = useState<any>(null);

  useEffect(() => {
    if (open) {
      const name = type == "save" ? "保存" : "另存为";
      setTitle(name);
      //   form?.setFieldsValue(updateValue);
    }
  }, [open]);

  const [form] = Form.useForm();

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (onOk) {
          onOk({ ...values }, type);
        }
      })
      .catch((errorInfo) => {
        console.error("Validation failed:", errorInfo);
      });
  };

  return (
    <Modal
      title={`${title}`}
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
        <Form.Item name="title" label="文件名">
          <Input addonAfter=".tpf" />
        </Form.Item>{" "}
      </Form>
    </Modal>
  );
};

export default SaveModal;
