import {
  BetaSchemaForm,
  type ProFormInstance,
} from "@ant-design/pro-components";
import { Modal } from "antd";
import React, { useRef } from "react";

interface SetMemberModalProps {
  open: boolean;
  isUpdate: boolean;
  updateValue: any;
  onSuccess: (values: any) => void;
  onCancel: () => void;
  formSchema: any;
  onOk?: (values: any) => void; // 新增
  onInnerCancel?: () => void; // 新增
}

const AddModal: React.FC<SetMemberModalProps> = ({
  open,
  isUpdate,
  updateValue,
  onSuccess,
  onCancel,
  formSchema,
  onOk, // 新增
  onInnerCancel, // 新增
}) => {
  const formRef = useRef<ProFormInstance | null>(null);

  React.useEffect(() => {
    if (open) {
      formRef.current?.resetFields();
      if (isUpdate && updateValue) {
        console.log("uodateCalue", updateValue);
        formRef.current?.setFieldsValue(updateValue);
      }
    }
  }, [open, isUpdate, updateValue]);

  const handleOk = async () => {
    const values = await formRef.current?.validateFields();
    const params = isUpdate ? { ...updateValue, ...values } : values;
    if (onSuccess) {
      onSuccess(params); // 新增
      return;
    }

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
    if (onInnerCancel) {
      onInnerCancel(); // 新增
      return;
    }
    onCancel();
    formRef.current?.resetFields();
  };

  return (
    <Modal
      title={isUpdate ? "编辑产品需求" : "新建产品需求"}
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      width={"40%"}
      styles={{ body: { minHeight: 300, padding: 20 } }}
    >
      <BetaSchemaForm<any>
        submitter={false}
        formRef={formRef}
        {...formSchema}
        defaultValue={updateValue}
      />
    </Modal>
  );
};

export default AddModal;
