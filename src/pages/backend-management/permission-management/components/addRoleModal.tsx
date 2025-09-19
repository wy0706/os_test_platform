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
      const params = isUpdate ? { ...updateValue, ...values } : values;
      if (isUpdate) {
        const { code, message: msg } = await updateOne({
          ...params,
          role_id: updateValue.id,
        });
        if (code === 0) {
          message.success(msg);
          onOk?.(params);
        } else {
          message.error(msg);
        }
      } else {
        const { code, message: msg } = await createOne(params);
        if (code === 0) {
          message.success(msg);
          onOk?.(params);
        } else {
          message.error(msg);
        }
      }
    } catch (error) {}

    // try {
    //   const values = await formRef.current?.validateFields();
    //   if (onOk) {
    //     onOk(values); // 新增
    //     return;
    //   }
    //   if (isUpdate) {
    //     values.id = updateValue.id;
    //     const res: any = await updateOne({ ...values, id: updateValue.id });
    //     if (res.code === "0") {
    //       message.success("操作成功");
    //       formRef.current?.resetFields();
    //       if (!continueAdd) {
    //         onSuccess();
    //       }
    //     }
    //   } else {
    //     const res: any = await createOne({ ...values, config: "{}" });
    //     if (res.code === "0") {
    //       message.success("操作成功");
    //       formRef.current?.resetFields();
    //       if (!continueAdd) {
    //         onSuccess();
    //       }
    //     }
    //   }
    // } catch (err) {
    //   console.log("表单校验失败:", err);
    // }
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
