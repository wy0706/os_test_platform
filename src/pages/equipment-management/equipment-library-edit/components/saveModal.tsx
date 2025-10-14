import { saveData } from "@/services/equipment-management/equipment-library-edit.service";
import { Form, Input, message, Modal, Select } from "antd";

import { useEffect, useState } from "react";
interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  data?: any;
  id?: any;
  name?: string;
  type?: string;
}
const { Option } = Select;

let index = 0;
const layout = {
  labelCol: { span: 24 },
};

const ParamModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  data,
  id,
  name,
  type,
}) => {
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    if (open) {
      form?.resetFields();
      form?.setFieldsValue({ name });
    }
  }, [open, id, type]);

  const [form] = Form.useForm();
  const handleOk = async () => {
    const values = await form.validateFields();
    console.log("values", values);

    let method;
    if (type === "save") {
      if (id === undefined || id === null || id === "") {
        // 新建保存
        method = 0;
      } else if (id === "0" || id === 0 || id) {
        // 编辑保存
        if (values.file_name && values.file_name.trim() !== "") {
          method = 2; // 有文件名
        } else {
          method = 1; // 无文件名
        }
      }
    } else if (type === "saveAs") {
      method = 3;
    }

    const params = {
      method,
      file_name: type === "save" ? values.file_name : values.saveAs_name,
    };

    try {
      setConfirmLoading(true);
      const {
        code,
        message: msg,
        data: { result },
      } = await saveData(params);
      // 0:操作成功 -1:文件为空无法保存  -2:文件名重复
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");
      if (onOk) onOk(params);
    } catch (error) {
      console.error("保存失败:", error);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <Modal
      title={type == "save" ? "保存" : "另存为"}
      maskClosable={false}
      open={open}
      confirmLoading={confirmLoading}
      destroyOnHidden
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { minHeight: 100, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form {...layout} form={form}>
        {id && (
          <Form.Item name="name" label="文件名">
            <Input disabled />
          </Form.Item>
        )}
        {type && type == "save" && (
          <Form.Item
            name="file_name"
            label="保存文件名（*.hwc）"
            rules={[
              {
                required:
                  id === undefined || id === null || id === "" ? true : false,
              },
            ]}
          >
            <Input placeholder="输入文件名" allowClear />
          </Form.Item>
        )}
        {type && type == "saveAs" && (
          <Form.Item
            name="saveAs_name"
            label="保存文件名（*.hwc）"
            rules={[{ required: true }]}
          >
            <Input placeholder="输入文件名" allowClear />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default ParamModal;
