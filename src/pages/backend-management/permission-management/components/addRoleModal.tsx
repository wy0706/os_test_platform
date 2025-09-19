import {
  createOne,
  updateOne,
} from "@/services/backend-management/permission-management.service";
import {
  BetaSchemaForm,
  type ProFormInstance,
} from "@ant-design/pro-components";
import { Form, message, Modal } from "antd";
import React, { useEffect, useRef } from "react";
import { schemasForm } from "../schemas";

interface SetMemberModalProps {
  open: boolean;
  isUpdate: boolean;
  updateValue: any;
  onCancel: () => void;
  onOk?: (values: any) => void;
}

// const formItemLayout = {
//   labelCol: { span: 4 },
//   wrapperCol: { span: 20 },
// };

const AddRoleModal: React.FC<SetMemberModalProps> = ({
  open,
  isUpdate,
  updateValue,
  onCancel,
  onOk, // 新增
}) => {
  const formRef = useRef<ProFormInstance | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (isUpdate && updateValue) {
        form.setFieldsValue({
          role_name: updateValue?.name,
          role_description: updateValue?.description,
        });
      }
    }
  }, [open, isUpdate, updateValue, form]);

  const handleOk = async () => {
    try {
      const values = await formRef.current?.validateFields();

      if (isUpdate) {
        const { code, message: msg } = await updateOne({
          ...values,
          role_id: updateValue.id,
        });
        if (code === 0) {
          message.success(msg);
          onOk?.(values);
        } else {
          message.error(msg);
        }
      } else {
        const { code, message: msg } = await createOne(values);
        if (code === 0) {
          message.success(msg);
          onOk?.(values);
        } else {
          message.error(msg);
        }
      }
    } catch (error) {}
  };

  const handleCancel = () => {
    onCancel?.();
    formRef.current?.resetFields();
  };

  return (
    <Modal
      title={isUpdate ? "编辑角色" : "新增角色"}
      open={open}
      onCancel={handleCancel}
      width={"50%"}
      onOk={handleOk}
    >
      <BetaSchemaForm<any>
        submitter={false}
        formRef={formRef}
        {...schemasForm}
        defaultValue={updateValue}
        form={form}
      />
    </Modal>
  );
};

export default AddRoleModal;
