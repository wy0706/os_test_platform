import { getList as getUserList } from "@/services/backend-management/user-management.service";
import { TableOutlined } from "@ant-design/icons";
import { useModel } from "@umijs/max";
import { Form, Input, message, Modal, Select } from "antd";
import { useEffect, useState } from "react";

import {
  createOne,
  updateOne,
} from "@/services/case-management/test-case.service";
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
  const { initialState } = useModel("@@initialState");
  const { currentUser } = initialState || {};
  const [title, setTitle] = useState("新建");
  const [userList, setUserList] = useState<any[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  // 获取所有用户列表
  const fetchAllUsers = async () => {
    try {
      const params = {
        page_index: 1,
        page_size: 9999,
      };
      const { code, data, message: msg } = await getUserList(params);
      if (code === 0) {
        setUserList(data?.list || []);
      } else {
        setUserList([]);
        message.error(msg);
      }
    } catch (error) {
      console.error("获取用户列表失败:", error);
    }
  };

  useEffect(() => {
    initData();
  }, [open, type, updateValue]);
  const initData = async () => {
    const name = type === "edit" ? "编辑" : type === "copy" ? "复制" : "新建";
    setTitle(name);
    if (open) {
      form?.resetFields();
      // 打开弹窗时获取所有用户列表
      await fetchAllUsers();
      if (type == "add") {
        form?.setFieldsValue({ user_id: currentUser?.id });
      }

      if ((type == "edit" || type == "copy") && updateValue) {
        form?.setFieldsValue({
          lib_name: type == "edit" ? updateValue?.name || undefined : undefined,
          lib_label: updateValue?.label || undefined,
          user_id: updateValue?.owner?.id || undefined,
          description: updateValue?.description || undefined,
        });
      }
    }
  };

  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    setSubmitLoading(true);
    try {
      if (type == "add" || type == "copy") {
        const { code, message: msg } = await createOne(values);
        if (code !== 0) {
          message.error(msg);
          return;
        }
        message.success(msg);
        onOk?.(values);
      } else {
        if (!updateValue.id) {
          message.error("缺少id");
          return;
        }
        const { code, message: msg } = await updateOne({
          lib_id: updateValue.id,
          ...values,
        });
        if (code !== 0) {
          message.error(msg);
          return;
        }
        message.success(msg);
        onOk?.(values);
      }
    } catch (error) {
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Modal
      title={`${title}测试库`}
      maskClosable={false}
      open={open}
      onCancel={() => {
        form?.resetFields();
        onCancel && onCancel();
      }}
      destroyOnHidden
      confirmLoading={submitLoading}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form {...layout} form={form} name="control-hooks">
        <Form.Item name="user_id" label="负责人" rules={[{ required: true }]}>
          <Select
            placeholder="负责人"
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {userList.map((user) => (
              <Option key={user.id} value={user.id}>
                {user.name || user.username || "-"}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="lib_name"
          label="测试库名称"
          rules={[{ required: true }]}
        >
          <Input
            placeholder="输入测试库名称"
            maxLength={32}
            prefix={<TableOutlined />}
          />
        </Form.Item>
        <Form.Item
          name="lib_label"
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
        <Form.Item name="description" label="描述">
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
