import { Form, Input, Modal, Select } from "antd";
import { useEffect, useState } from "react";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  data?: any;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const TestInfoModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  data,
}) => {
  const [treeData, setTreeData] = useState<any>([]);
  const [title, setTitle] = useState("add");

  const [userList, setUserList] = useState<any>([]);

  useEffect(() => {
    if (open) {
      form?.resetFields();
      data && form?.setFieldsValue({ ...data });
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
      title="设置测试信息"
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form {...layout} form={form} name="control-hooks">
        <Form.Item name="name" label="项目名称" rules={[{ required: true }]}>
          <Input placeholder="输入项目名称" allowClear />
        </Form.Item>
        <Form.Item name="name1" label="样品名称">
          <Input placeholder="输入样品名称" allowClear />
        </Form.Item>
        <Form.Item name="name2" label="型号">
          <Input placeholder="输入型号" allowClear />
        </Form.Item>
        <Form.Item name="name3" label="测试单位">
          <Input placeholder="输入测试单位" allowClear />
        </Form.Item>
        <Form.Item name="gender2" label="检验人员">
          <Input placeholder="输入检验人员" allowClear />

          {/* <Select
            placeholder="选择作者"
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {userList.map((user: any) => (
              <Option key={user.id} value={user.id}>
                {user.name ||
                  user.username ||
                  user.realName ||
                  user.displayName}
              </Option>
            ))}
          </Select> */}
        </Form.Item>
        <Form.Item name="name4" label="检验人员">
          <Input placeholder="输入检验人员" allowClear />
        </Form.Item>
        <Form.Item name="name5" label="测试依据">
          <Input placeholder="输入测试依据" allowClear />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TestInfoModal;
