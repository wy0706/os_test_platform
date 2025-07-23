import type { ProFormInstance } from "@ant-design/pro-components";
import {
  PageContainer,
  ProForm,
  ProFormText,
} from "@ant-design/pro-components";
import { Button, Form, Input, Menu, message } from "antd";
import React, { useRef, useState } from "react";
import "./index.less";

const ChangePasswordForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<ProFormInstance>();

  // 模拟异步修改密码请求
  const handleChangePassword = async (values: any) => {
    setLoading(true);
    try {
      // 模拟网络请求延迟
      await new Promise((resolve) => setTimeout(resolve, 1200));
      // 这里可以对接真实接口
      console.log("提交的密码数据:", values);
      message.success("密码修改成功");
      formRef.current?.resetFields();
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
      style={{ borderRadius: 6 }} // 设置表单圆角
    >
      <ProFormText.Password
        name="oldPassword"
        label="旧密码"
        placeholder="请输入旧密码"
        rules={[{ required: true, message: "请输入旧密码" }]}
        fieldProps={{ size: "large" }}
      />

      <ProFormText.Password
        name="newPassword"
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
        dependencies={["newPassword"]}
        rules={[
          { required: true, message: "请确认新密码" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("newPassword") === value) {
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
  const [form] = Form.useForm();
  const [username, setUsername] = useState("admin");
  const [mobile, setMobile] = useState("18701493522");
  const [newUsername, setNewUsername] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 模拟发送验证码
  const handleSendCode = () => {
    if (!/^1\d{10}$/.test(newMobile)) {
      message.error("请输入有效的手机号");
      return;
    }
    setCodeSent(true);
    setCountdown(60);
    message.success("验证码已发送");
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCodeSent(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 修改用户名
  const handleChangeUsername = () => {
    if (!newUsername) {
      message.error("请输入新用户名");
      return;
    }
    setUsername(newUsername);
    setNewUsername("");
    message.success("用户名已修改");
  };

  // 修改手机号
  const handleChangeMobile = () => {
    if (!/^1\d{10}$/.test(newMobile)) {
      message.error("请输入新手机号");
      return;
    }
    if (!code) {
      message.error("请输入验证码");
      return;
    }
    setMobile(newMobile);
    setNewMobile("");
    setCode("");
    message.success("手机号已修改");
  };

  return (
    <div style={{ padding: "32px 0" }}>
      {/* 用户名分组 */}
      <div style={{ display: "flex", marginBottom: 20, flexWrap: "wrap" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            marginBottom: 20,
          }}
        >
          <div style={{ minWidth: 60, fontWeight: 500, marginTop: 8 }}>
            用户名
          </div>
          <div style={{ minWidth: 100, marginTop: 8 }}>{username}</div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "flex-start" }}>
          <div>
            <Input
              size="large"
              placeholder="输入新的用户名"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              style={{ marginBottom: 0, width: "100%" }}
            />
          </div>
          <Button
            type="primary"
            size="large"
            style={{ marginLeft: 24, width: 100 }}
            onClick={handleChangeUsername}
          >
            修改
          </Button>
        </div>
      </div>
      {/* 手机号分组 */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          marginBottom: 40,
        }}
      >
        <div style={{ display: "flex", marginBottom: 20 }}>
          <div style={{ minWidth: 60, fontWeight: 500, marginTop: 8 }}>
            手机
          </div>
          <div style={{ minWidth: 100, marginTop: 8 }}>{mobile}</div>
        </div>

        <div style={{ display: "flex", flex: 1 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <Input
              size="large"
              placeholder="输入新的手机号"
              value={newMobile}
              onChange={(e) => setNewMobile(e.target.value)}
              style={{ flex: 1, minWidth: 180 }}
            />
            <Input
              size="large"
              placeholder="输入验证码"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ width: 100 }}
            />
            <Button
              size="large"
              disabled={codeSent || !/^1\d{10}$/.test(newMobile)}
              onClick={handleSendCode}
              style={{ minWidth: 120 }}
            >
              {codeSent ? `${countdown}s后重试` : "获取验证码"}
            </Button>
          </div>
          <Button
            type="primary"
            size="large"
            style={{ marginLeft: 24, width: 100 }}
            onClick={handleChangeMobile}
          >
            修改
          </Button>
        </div>
      </div>
    </div>
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
