import { getList } from "@/services/backend-management/permission-management.service";
import {
  createOne,
  updateOne,
} from "@/services/backend-management/user-management.service";
import { isArray } from "@/utils";
import { Button, Checkbox, Form, Input, message, Modal, Select } from "antd";
import React, { useEffect, useState } from "react";
const { Option } = Select;
interface SetMemberModalProps {
  open: boolean;
  isUpdate: boolean;
  updateValue: any;
  onCancel: () => void;
  onOk?: (values: any) => void; // 新增
}

const layout = {
  labelCol: { span: 24 },
};
const SetMemberModal: React.FC<SetMemberModalProps> = ({
  open,
  isUpdate,
  updateValue,
  onCancel,
  onOk, // 新增
}) => {
  const [continueAdd, setContinueAdd] = useState(false);
  const [form] = Form.useForm();
  const [roleList, setRoleList] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!open) return;

      try {
        await getRoleList();
        form?.resetFields();
        if (isUpdate && updateValue) {
          form.setFieldsValue(updateValue);
        }
      } catch (err) {
        console.error("获取角色列表或设置表单失败:", err);
        // 这里可以做错误提示，比如 message.error('加载失败')
      }
    };
    fetchData();
  }, [open, isUpdate, updateValue, form]);
  const getRoleList = async () => {
    try {
      const {
        code,
        data,
        message: msg,
      } = await getList({ page_index: 1, page_size: 999 });
      if (code === 0) {
        const list = isArray(data.list) ? data.list : [];
        setRoleList(list);
      } else {
        message.error(msg);
        setRoleList([]);
      }
    } catch (error) {
      setRoleList([]);
    }
  };
  const handleOk = async () => {
    const values = await form.validateFields();
    if (isUpdate) {
      const { code, message: msg } = await updateOne({
        ...values,
        user_id: updateValue.id,
      });
      if (code === 0) {
        message.success(msg);
        onOk?.(values);
      } else {
        message.error(msg);
      }
      //编辑
    } else {
      const { code, message: msg } = await createOne({ ...values });
      if (code === 0) {
        message.success(msg);
        onOk?.(values);
      } else {
        message.error(msg);
      }
    }
  };

  return (
    <Modal
      title={isUpdate ? "编辑成员信息" : "新增成员信息"}
      open={open}
      width={"50%"}
      // styles={{
      //   body: {
      //     minHeight: 300,
      //   },
      // }}
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
            <Button
              onClick={() => {
                onCancel && onCancel();
              }}
              style={{ marginRight: 8 }}
            >
              取消
            </Button>
            <Button type="primary" onClick={handleOk}>
              确认
            </Button>
          </div>
        </div>,
      ]}
    >
      <Form {...layout} form={form} name="control-hooks">
        <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
          <Input placeholder="输入姓名" />
        </Form.Item>{" "}
        <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
          <Input placeholder="输入姓名" />
        </Form.Item>
        <Form.Item
          name="phone_num"
          label="手机号"
          rules={[
            { required: true, message: "请输入手机号" },
            {
              pattern: /^1\d{10}$/,
              message: "手机号格式错误！",
            },
          ]}
        >
          <Input placeholder="输入手机号" />
        </Form.Item>
        <Form.Item name="role_id" label="角色">
          <Select
            placeholder="选择角色"
            allowClear
            showSearch
            options={roleList.map((item: any) => ({
              value: item.id,
              label: item.name,
            }))}
            // 过滤时用 String() 转字符串防止类型错误
            filterOption={(input, option) =>
              String(option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SetMemberModal;
