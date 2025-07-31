import { Button, Form, Input, Modal, Select } from "antd";
import { useEffect, useState } from "react";
interface SetMemberModalProps {
  open: boolean;
  onSuccess?: (values: any) => void;
  onCancel?: () => void;
  onInnerCancel?: () => void; // 新增
  onSelect?: () => void; // 新增
  testData?: any; // 新增
  type: string;
  updateValue?: any; // 新增
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const testSequenceData: React.FC<SetMemberModalProps> = ({
  open,
  onSuccess,
  onCancel,
  onInnerCancel,
  onSelect,
  testData,
  type,
  updateValue,
}) => {
  // useEffect(() => {
  //   console.log("选择测试文件");
  // }, [open]);
  const [title, setTitle] = useState("新建");
  useEffect(() => {
    const name = type === "edit" ? "编辑" : type === "copy" ? "复制" : "新建";
    setTitle(name);
    if (open) {
      form?.resetFields();
      // if (isUpdate && updateValue) {
      //   console.log("uodateCalue", updateValue);
      //   formRef.current?.setFieldsValue(updateValue);
      // }
      if ((type === "edit" || type === "copy") && updateValue) {
        console.log("uodateCalue====", updateValue);
        form?.setFieldsValue(updateValue);
      }
    }
  }, [open, type, updateValue]);

  const [form] = Form.useForm();

  const onGenderChange = (value: string) => {
    switch (value) {
      case "male":
        form.setFieldsValue({ note: "Hi, man!" });
        break;
      case "female":
        form.setFieldsValue({ note: "Hi, lady!" });
        break;
      case "other":
        form.setFieldsValue({ note: "Hi there!" });
        break;
      default:
    }
  };

  const onFinish = (values: any) => {
    console.log(values);
  };

  const onReset = () => {
    form.resetFields();
  };

  const onFill = () => {
    form.setFieldsValue({ note: "Hello world!", gender: "male" });
  };

  const handleOk = () => {
    console.log("111");
    form
      .validateFields()
      .then((values) => {
        console.log("Form values:", values);
        if (onSuccess) {
          onSuccess(values);
        }
      })
      .catch((errorInfo) => {
        console.error("Validation failed:", errorInfo);
      });
  };
  return (
    <Modal
      title={`${title}测试任务`}
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
        <Form.Item name="note" label="任务名称" rules={[{ required: true }]}>
          <Input placeholder="请输入任务名称" />
        </Form.Item>
        <Form.Item name="gender1" label="任务描述">
          <Input.TextArea rows={4} placeholder="请输入任务描述" />
        </Form.Item>
        <Form.Item name="gender2" label="负责人" rules={[{ required: true }]}>
          <Select placeholder="请选择负责人" allowClear>
            <Option value="male">张三</Option>
            <Option value="female">李四</Option>
            <Option value="other">王五</Option>
          </Select>
        </Form.Item>

        <Form.Item name="gender3" label="选择测试文件">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Button
              onClick={() => {
                onSelect && onSelect();
              }}
            >
              选择文件
            </Button>

            {testData?.id ? (
              <span> {testData?.title}</span>
            ) : (
              <span>请选择</span>
            )}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default testSequenceData;
