import {
  updateOne,
  updatePassWord,
} from "@/services/backend-management/user-management.service";
import type { ProFormInstance } from "@ant-design/pro-components";
import {
  PageContainer,
  ProForm,
  ProFormText,
} from "@ant-design/pro-components";
import { history, useModel } from "@umijs/max";
import { Button, Form, Input, Menu, message, Space } from "antd";
import React, { useRef, useState } from "react";
import { flushSync } from "react-dom";
import "./index.less";

const ChangePasswordForm: React.FC = () => {
  const loginPath = "/user/login";
  const { setInitialState } = useModel("@@initialState");
  const [loading, setLoading] = useState(false);
  const formRef = useRef<ProFormInstance>();

  // 修改密码请求
  const handleChangePassword = async (values: any) => {
    setLoading(true);
    try {
      const { code, message: msg } = await updatePassWord({
        ...values,
        confirmPassword: null,
      });
      if (code !== 0) {
        message.error(msg);
        return false;
      }
      message.success("密码修改成功");
      formRef.current?.resetFields();
      localStorage.clear();
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: {},
        }));
      });

      history.push(loginPath);
      return true;
    } catch (error) {
      message.error("密码修改失败，请重试");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProForm
      formRef={formRef}
      onFinish={handleChangePassword}
      layout="vertical"
      submitter={{
        searchConfig: {
          submitText: "提交",
          resetText: "重置",
        },
        submitButtonProps: {
          loading,
          type: "primary",
          size: "large",
        },
        resetButtonProps: {
          style: { marginLeft: 16 },
          size: "large",
        },
        render: (props, doms) => (
          <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
            {doms}
          </div>
        ),
      }}
      disabled={loading}
      // style={{ borderRadius: 6 }} // 设置表单圆角
      style={{
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        maxWidth: 600,
        margin: "0 auto",
      }}
    >
      <ProFormText.Password
        name="old_password"
        label="旧密码"
        placeholder="请输入旧密码"
        rules={[{ required: true, message: "请输入旧密码" }]}
        fieldProps={{ size: "large" }}
      />

      <ProFormText.Password
        name="new_password"
        label="新密码"
        placeholder="请输入新密码"
        rules={[
          { required: true, message: "请输入新密码" },
          { min: 6, message: "密码长度不能少于6位" },
        ]}
        fieldProps={{ size: "large" }}
      />

      <ProFormText.Password
        name="confirmPassword"
        label="确认新密码"
        placeholder="请再次输入新密码"
        dependencies={["new_password"]}
        rules={[
          { required: true, message: "请确认新密码" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("new_password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("两次输入的密码不一致"));
            },
          }),
        ]}
        fieldProps={{ size: "large" }}
      />
    </ProForm>
  );
};
const AccountInfo: React.FC = () => {
  const { initialState, setInitialState } = useModel("@@initialState");
  const { currentUser } = initialState || {};
  const [newUsername, setNewUsername] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    // 先判断至少有一项有值
    if (!values.name && !values.phone_num) {
      message.info("请至少填写一个要修改的字段");
      return;
    }
    // 如果手机号有值就校验手机号
    if (values.phone_num && !/^1[3-9]\d{9}$/.test(values.phone_num)) {
      message.error("请输入正确的11位手机号码");
      return;
    }

    if (!currentUser?.id) {
      message.error("用户信息缺失");
      return;
    }

    setSaving(true);
    try {
      const { code, message: msg } = await updateOne({
        user_id: currentUser.id,
        // 只传有值的字段
        ...(values.name ? { name: values.name } : {}),
        ...(values.phone_num ? { phone_num: values.phone_num } : {}),
      });
      if (code === 0) {
        message.success(msg);
        // 更新全局状态
        const updatedUser = {
          ...currentUser,
          name: values.name || currentUser.name,
          phone_num: values.phone_num || currentUser.phone_num,
        };

        setInitialState((prev) => ({
          ...prev,
          currentUser: updatedUser,
        }));

        // 更新 localStorage
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        setNewUsername("");
        setNewMobile("");
        form.resetFields();
      } else {
        message.error(msg);
      }
    } catch (err) {
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setNewUsername("");
    setNewMobile("");
    form.resetFields();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      style={{
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        maxWidth: 600,
        margin: "0 auto",
      }}
      onFinish={handleSubmit}
    >
      {/* 用户名行 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        <div style={{ minWidth: 60, fontWeight: 500 }}>用户名</div>
        <div style={{ minWidth: 100, marginRight: 16 }}>
          {currentUser?.name || "-"}
        </div>
        <Form.Item
          name="name"
          style={{ flex: 1, marginBottom: 0 }}
          initialValue={newUsername}
        >
          <Input
            size="large"
            placeholder="输入新的用户名"
            onChange={(e) => setNewUsername(e.target.value)}
          />
        </Form.Item>
      </div>

      {/* 手机号行 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        <div style={{ minWidth: 60, fontWeight: 500 }}>手机</div>
        <div style={{ minWidth: 100, marginRight: 16 }}>
          {currentUser?.phone_num || "-"}
        </div>
        <Form.Item
          name="phone_num"
          style={{ flex: 1, marginBottom: 0 }}
          initialValue={newMobile}
        >
          <Input
            size="large"
            placeholder="输入新的手机号"
            onChange={(e) => setNewMobile(e.target.value)}
          />
        </Form.Item>
      </div>

      {/* 按钮单独一行居中 */}
      <Form.Item style={{ textAlign: "center", marginTop: 24 }}>
        <Space>
          <Button
            onClick={handleReset}
            size="large"
            style={{ marginRight: 10 }}
            disabled={saving}
          >
            重置
          </Button>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            // style={{ width: 140 }}
            loading={saving}
            disabled={saving}
          >
            修改
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

const menuItems = [
  { key: "account", label: "账号信息" },
  { key: "password", label: "修改密码" },
];

const Page: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState("account");
  return (
    <PageContainer>
      <div
        style={{
          display: "flex",
          background: "#fff",
          borderRadius: 4,
          minHeight: 400,
        }}
      >
        {/* 左侧菜单栏 */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{
            width: 180,
            borderRight: "1px solid #f0f0f0",
            padding: "32px 0",
          }}
          items={menuItems}
          onClick={(e) => setSelectedKey(e.key)}
        />
        {/* 右侧内容区 */}
        <div style={{ flex: 1, padding: "32px 120px" }}>
          {selectedKey === "account" && <AccountInfo />}
          {selectedKey === "password" && <ChangePasswordForm />}
        </div>
      </div>
    </PageContainer>
  );
};

export default Page;
