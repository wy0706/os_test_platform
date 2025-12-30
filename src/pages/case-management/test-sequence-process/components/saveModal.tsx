import { saveData } from "@/services/case-management/test-sequence-process.service";
import { useSetState } from "ahooks";
import { Form, Input, message, Modal } from "antd";
import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onOk?: (values: any, type: any) => void;
  onCancel?: () => void;
  type: string;
  id?: string; // Optional prop for record ID
  btnType?: string; // add 表示新建 有数据
}

const layout = {
  labelCol: { span: 24 },
};

const SaveModal: React.FC<ModalProps> = ({
  open,
  onOk,
  onCancel,
  type,
  id,
}) => {
  const [state, setState] = useSetState<any>({
    confirmLoading: false,
  });

  const [form] = Form.useForm();

  const { confirmLoading } = state;
  useEffect(() => {
    if (open) {
      form?.resetFields();
    }
  }, [open, id]);

  const handleOk = async () => {
    const values = await form.validateFields();
    try {
      setState({ confirmLoading: true });
      let method;
      if (type == "saveAs") {
        method = 2; // 另存为
      } else {
        method = 0; // 新建保存
      }

      const res = await saveData({
        method: method, // 新建保存 method=0，编辑保存 method=1，另存为 method=2 ，编辑保存在index.tsx里处理了
        filename: values.filename,
      });
      if (res?.code !== 0) {
        message.error(res?.message || "操作失败");
        return;
      }
      message.success(res?.message || "操作成功");
      if (onOk) {
        onOk({ ...values }, type);
      }
    } catch {
    } finally {
      setState({ confirmLoading: false });
    }
  };

  return (
    <Modal
      title={type == "save" ? "保存" : "另存为"}
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      confirmLoading={confirmLoading}
      afterClose={() => {
        form?.resetFields();
      }}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form {...layout} form={form} name="control-hooks">
        {/* {type !== "save" ? (
          <Form.Item name="title" label="原文件名">
            <Input addonAfter=".tpf" allowClear disabled />
          </Form.Item>
        ) : null} */}
        <Form.Item
          name="filename"
          label="文件名"
          rules={[{ required: true, message: "请输入文件名" }]}
        >
          <Input addonAfter=".tpf" allowClear />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SaveModal;
