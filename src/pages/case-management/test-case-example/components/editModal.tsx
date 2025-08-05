import { getAll as getUserList } from "@/services/system-management/user-management.service";
import { Form, Input, Modal, Select } from "antd";
import { useEffect, useState } from "react";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  onSelect?: () => void;
  testData?: any;
  type: string;
  updateValue?: any;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const AddModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  onSelect,
  testData,
  type,
  updateValue,
}) => {
  const [title, setTitle] = useState("新建");
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
    const name = type === "edit" ? "编辑" : type === "copy" ? "复制" : "移动";
    setTitle(name);
    if (open) {
      form?.resetFields();
      // 打开弹窗时获取所有用户列表
      fetchAllUsers();
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

  const onFinish = (values: any) => {
    console.log(values);
  };

  const handleOk = () => {
    console.log("111");
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
      title={`${title}测试库`}
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
        {type && type !== "remove" && (
          <Form.Item name="gender1" label="标题" rules={[{ required: true }]}>
            <Input placeholder="输入标题" maxLength={32} />
          </Form.Item>
        )}

        {type && type === "edit" && (
          <Form.Item name="gender2" label="重要程度">
            <Select placeholder="选择重要程度">
              <Option value="1">P0</Option>
              <Option value="2">P1</Option>
              <Option value="2">P2</Option>
              <Option value="3">P3</Option>
              <Option value="3">P4</Option>
            </Select>
          </Form.Item>
        )}

        {(type && type === "copy") ||
          (type === "remove" && (
            <>
              <Form.Item name="gender5" label="所属测试库">
                <Select placeholder="选择测试库">
                  <Option value="1">测试库1</Option>
                </Select>
              </Form.Item>
              <Form.Item name="gender" label="模块">
                <Select placeholder="选择模块">
                  <Option value="1">测试库1</Option>
                </Select>
              </Form.Item>
            </>
          ))}
      </Form>
    </Modal>
  );
};

export default AddModal;
