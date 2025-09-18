import { getAll as getUserList } from "@/services/system-management/user-management.service";
import { useSetState } from "ahooks";
import { Form, Input, Modal, Select } from "antd";
import { useEffect, useState } from "react";
interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  type: string;
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
  type,
  updateValue,
}) => {
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [state, setState] = useSetState<any>({
    title: "新建",
  });
  const { title } = state;
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
    const name = type === "add" ? "新建" : "编辑";
    setState({ title: name });
    if (open) {
      form?.resetFields();
      fetchAllUsers();
      if (type === "edit") {
        form?.setFieldsValue(updateValue);
      }
    } else {
      form?.resetFields();
    }
  }, [open, type, updateValue]);

  const [form] = Form.useForm();

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
      title={`${title}设备类型`}
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      {" "}
      <Form {...layout} form={form} name="control-hooks">
        {" "}
        <Form.Item name="name" label="设备名称" rules={[{ required: true }]}>
          <Input placeholder="输入设备名称" allowClear />
        </Form.Item>{" "}
        <Form.Item name="title" label="设备类型" rules={[{ required: true }]}>
          <Input placeholder="输入设备类型" allowClear />
        </Form.Item>{" "}
        {/* <Form.Item
          name="name6"
          label="安全操作"
          initialValue={"0"}
          rules={[{ required: true }]}
        >
          <Select placeholder="选择安全操作" allowClear>
            <Option value="1">✓</Option>
            <Option value="0">✗</Option>
          </Select>
        </Form.Item> */}
        <Form.Item name="name1" label="设备类型编码">
          <Input placeholder="系统自动分配" disabled />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddTypeModal;
