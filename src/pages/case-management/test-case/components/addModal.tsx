import { getAll as getUserList } from "@/services/system-management/user-management.service";
import { TableOutlined } from "@ant-design/icons";
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
        <Form.Item name="gender2" label="负责人" rules={[{ required: true }]}>
          <Select
            placeholder="负责人"
            allowClear
            showSearch
            loading={loading}
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          >
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
        <Form.Item name="note" label="测试库名称" rules={[{ required: true }]}>
          <Input
            placeholder="输入测试库名称"
            maxLength={32}
            prefix={<TableOutlined />}
          />
        </Form.Item>
        <Form.Item
          name="note2"
          label="测试库标识"
          rules={[
            { required: true },
            {
              pattern: /^[A-Z0-9]{1,15}$/,
              message: "只能输入大写字母或数字，最多15个字符",
            },
          ]}
        >
          <Input placeholder="大写字母或数字，15个字符以内" />
        </Form.Item>
        <Form.Item name="gender1" label="描述">
          <Input.TextArea
            rows={4}
            placeholder="输入任务描述"
            maxLength={2048}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddModal;
