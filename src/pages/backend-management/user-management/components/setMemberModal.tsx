import {
  createOne,
  updateOne,
} from "@/services/system-management/role-management.service";
import {
  BetaSchemaForm,
  type ProFormInstance,
} from "@ant-design/pro-components";
import { Button, Checkbox, Form, message, Modal } from "antd";
import React, { useRef, useState } from "react";

interface SetMemberModalProps {
  open: boolean;
  isUpdate: boolean;
  updateValue: any;
  onSuccess: () => void;
  onCancel: () => void;
  formSchema: any;
  onOk?: (values: any) => void; // 新增
  onInnerCancel?: () => void; // 新增
}

const SetMemberModal: React.FC<SetMemberModalProps> = ({
  open,
  isUpdate,
  updateValue,
  onSuccess,
  onCancel,
  formSchema,
  onOk, // 新增
  onInnerCancel, // 新增
}) => {
  const [continueAdd, setContinueAdd] = useState(false);
  const formRef = useRef<ProFormInstance | null>(null);
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (open) {
      form.resetFields();
      if (isUpdate && updateValue) {
        form.setFieldsValue(updateValue);
      }
    }
  }, [open, isUpdate, updateValue, form]);

  const handleOk = async () => {
    try {
      const values = await formRef.current?.validateFields();
      if (onOk) {
        onOk(values); // 新增
        return;
      }
      if (isUpdate) {
        values.id = updateValue.id;
        const res: any = await updateOne({ ...values, id: updateValue.id });
        if (res.code === "0") {
          message.success("操作成功");
          formRef.current?.resetFields();
          if (!continueAdd) {
            onSuccess();
          }
        }
      } else {
        const res: any = await createOne({ ...values, config: "{}" });
        if (res.code === "0") {
          message.success("操作成功");
          formRef.current?.resetFields();
          if (!continueAdd) {
            onSuccess();
          }
        }
      }
    } catch (err) {
      console.log("表单校验失败:", err);
    }
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
      title={isUpdate ? "编辑成员信息" : "新增成员信息"}
      open={open}
      onCancel={handleCancel}
      width={"50%"}
      bodyStyle={{ minHeight: 300 }}
      footer={[
        <div
          key="checkbox"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {!isUpdate ? (
            <Checkbox
              checked={continueAdd}
              onChange={(e) => setContinueAdd(e.target.checked)}
            >
              是否继续增加一条
            </Checkbox>
          ) : (
            <div />
          )}

          <div>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" onClick={handleOk}>
              确认
            </Button>
          </div>
        </div>,
      ]}
    >
      <BetaSchemaForm<any>
        submitter={false}
        formRef={formRef}
        {...formSchema}
        defaultValue={updateValue}
        form={form}
      />
    </Modal>
  );
};

export default SetMemberModal;
