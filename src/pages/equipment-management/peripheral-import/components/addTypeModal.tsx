import { getAll as getUserList } from "@/services/system-management/user-management.service";
import { Form, Modal, Select } from "antd";
import { useEffect, useState } from "react";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  onSelect?: () => void;
  testData?: any;
  type?: string;
  updateValue?: any;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const AddTypeModal: React.FC<SetMemberModalProps> = ({
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
    const name = type === "edit" ? "编辑" : type === "copy" ? "复制" : "新建";
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
      title="添加设备类型"
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { minHeight: 100, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
        <Form.Item name="name" label="设备类型" rules={[{ required: true }]}>
          <Select
            placeholder="选择设备类型"
            allowClear
            showSearch
            loading={loading}
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            <Option value="AC SOURCE">AC SOURCE</Option>
            <Option value="DSO">DSO</Option>
            <Option value="LOAD">LOAD</Option>
            <Option value="AWC">AWC</Option>
            <Option value="LED LOAD">LED LOAD</Option>
            {userList.map((user) => (
              <Option key={user.id} value={user.id}>
                {user.name ||
                  user.username ||
                  user.realName ||
                  user.displayName}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddTypeModal;
