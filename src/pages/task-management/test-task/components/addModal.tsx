import {
  BetaSchemaForm,
  type ProFormInstance,
} from "@ant-design/pro-components";
import { Modal } from "antd";
import React, { useEffect, useRef, useState } from "react";
interface SetMemberModalProps {
  open: boolean;
  updateValue: any;
  type: string;
  onSuccess: (values: any) => void;
  onCancel: () => void;
  formSchema: any;
  onOk?: (values: any) => void; // 新增
  onInnerCancel?: () => void; // 新增
}

const AddModal: React.FC<SetMemberModalProps> = ({
  open,
  updateValue,
  onSuccess,
  onCancel,
  formSchema,
  type,
  onOk, // 新增
  onInnerCancel, // 新增
}) => {
  const formRef = useRef<ProFormInstance | null>(null);
  const [title, setTitle] = useState("新建");
  useEffect(() => {
    const name = type === "edit" ? "编辑" : type === "copy" ? "复制" : "新建";
    setTitle(name);
    if (open) {
      formRef.current?.resetFields();
      // if (isUpdate && updateValue) {
      //   console.log("uodateCalue", updateValue);
      //   formRef.current?.setFieldsValue(updateValue);
      // }
      if ((type === "edit" || type === "copy") && updateValue) {
        console.log("uodateCalue====", updateValue);
        formRef.current?.setFieldsValue(updateValue);
      }
    }
  }, [open, type, updateValue]);

  const handleOk = async () => {
    const values = await formRef.current?.validateFields();
    const params =
      type === "add"
        ? values
        : type === "edit"
        ? { ...updateValue, ...values }
        : { ...updateValue, id: null };
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
    <>
      <Modal
        title={`${title}测试任务`}
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
        ></BetaSchemaForm>

        {/* <ProForm submitter={false} formRef={formRef} defaultValue={updateValue}>
          <ProFormSelect
            options={[
              {
                value: "chapter",
                label: "盖章后生效",
              },
            ]}
            width="sm"
            name="useMode"
            label="合同约定生效方式"
          />
        </ProForm> */}
      </Modal>
    </>
  );
};

export default AddModal;
