import { getAll as getUserList } from "@/services/system-management/user-management.service";
import { Form, Input, Modal, Select } from "antd";

import { useEffect, useState } from "react";
interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  data?: any;
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
}) => {
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取所有用户列表
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        pageSize: 1000, // 获取足够多的用户数据
      };
      const result = await getUserList(params);
      if (result?.data) {
        setUserList(result.data);
      }
    } catch (error) {
      console.error("获取用户列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      form?.resetFields();
      // 打开弹窗时获取所有用户列表
      // fetchAllUsers();
      // if (isUpdate && data) {
      //   console.log("uodateCalue", data);
      //   formRef.current?.setFieldsValue(data);
      // }
      // if ((type === "edit" || type === "copy") && data) {
      //   console.log("uodateCalue====", data);
      //   form?.setFieldsValue(data);
      // }
    }
  }, [open, data]);

  const [form] = Form.useForm();

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Form values:", values);
        if (onOk) {
          onOk(values);
        }
      })
      .catch((errorInfo) => {
        console.error("Validation failed:", errorInfo);
      });
  };

  return (
    <Modal
      title="设备种类参数配置"
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { minHeight: 100, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form {...layout} form={form} name="control-hooks">
        <Form.Item name="name" label="文件名" initialValue={"YSW-GC.hwc"}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="rate" label="发布" initialValue={"2"}>
          <Select placeholder="发布" disabled>
            <Option value="1 ">✓</Option>
            <Option value="2">✗</Option>
          </Select>
        </Form.Item>
        <Form.Item name="stopbits" label="保存文件名（*.hwc）">
          <Input placeholder="输入文件名" allowClear />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ParamModal;
