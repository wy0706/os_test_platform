import { Footer } from "@/components";
import {
  AlipayCircleOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
} from "@ant-design/icons";
import {
  CaptFieldRef,
  LoginForm,
  ProForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from "@ant-design/pro-components";
import {
  FormattedMessage,
  Helmet,
  SelectLang,
  useIntl,
  useModel,
} from "@umijs/max";
import { Alert, App, Tabs } from "antd";
import { createStyles } from "antd-style";
import React, { useRef, useState } from "react";
import { flushSync } from "react-dom";
import Settings from "../../../../config/defaultSettings";

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: "8px",
      color: "rgba(0, 0, 0, 0.2)",
      fontSize: "24px",
      verticalAlign: "middle",
      cursor: "pointer",
      transition: "color 0.3s",
      "&:hover": {
        color: token.colorPrimaryActive,
      },
    },
    lang: {
      width: 42,
      height: 42,
      lineHeight: "42px",
      position: "fixed",
      right: 16,
      borderRadius: token.borderRadius,
      ":hover": {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "auto",
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: "100% 100%",
    },
  };
});

const ActionIcons = () => {
  const { styles } = useStyles();

  return (
    <>
      <AlipayCircleOutlined
        key="AlipayCircleOutlined"
        className={styles.action}
      />
      <TaobaoCircleOutlined
        key="TaobaoCircleOutlined"
        className={styles.action}
      />
      <WeiboCircleOutlined
        key="WeiboCircleOutlined"
        className={styles.action}
      />
    </>
  );
};

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>("account");
  const { initialState, setInitialState } = useModel("@@initialState");
  const { styles } = useStyles();
  const { message } = App.useApp();

  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };
  const [form] = ProForm.useForm();
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const captchaRef = useRef<CaptFieldRef | null | undefined>();
  const [captchaExpired, setCaptchaExpired] = useState(false); //倒计时是否结束
  const [captchaShow, setCaptchaShow] = useState(false);
  // 验证码错误消息
  const [captchaerrorMsg, setCaptchaErrorMsg] = useState("");
  const inputRef = useRef();
  const handleSubmit = async (values: API.LoginParams) => {
    try {
      // 登录
      // const msg = await login({ ...values, type });
      // if (msg.status === 'ok') {
      //   const defaultLoginSuccessMessage = intl.formatMessage({
      //     id: 'pages.login.success',
      //     defaultMessage: '登录成功！',
      //   });
      //   message.success(defaultLoginSuccessMessage);
      //   await fetchUserInfo();
      //   const urlParams = new URL(window.location.href).searchParams;
      //   window.location.href = urlParams.get('redirect') || '/';
      //   return;
      // }
      // console.log(msg);
      // 如果失败去设置用户错误信息
      // setUserLoginState(msg);
      if (attemptsLeft <= 0) {
        setErrorMsg("账号已锁定，请联系管理员");
        return;
      }
      console.log("value====", values);

      const { username, password, captcha, mobile } = values;
      // 如果是账号密码登录
      if (username && password) {
        if (username !== "user" && username !== "admin") {
          const newAttempts = attemptsLeft - 1;
          setAttemptsLeft(newAttempts);
          setSuccessMsg("");
          if (newAttempts > 0) {
            setErrorMsg(`账号或密码错误，你还有 ${newAttempts} 次重试机会`);
          } else {
            setErrorMsg("账号已锁定，请联系管理员");
          }
          return;
        }
      }

      // 验证码
      if (captcha && mobile) {
        console.log("验证码是否失效", captchaExpired);

        if (captcha !== "1234") {
          setCaptchaErrorMsg("验证码输入错误");
          return;
        }
        if (captcha === "1234" && captchaExpired) {
          //已结束
          setCaptchaErrorMsg("验证码已过期请重新输入");
          return;
        }
      }

      const defaultLoginSuccessMessage = intl.formatMessage({
        id: "pages.login.success",
        defaultMessage: "登录成功！",
      });
      message.success(defaultLoginSuccessMessage);
      await fetchUserInfo();
      // 重置尝试次数
      setErrorMsg("");
      setAttemptsLeft(5);
      // 验证码提示信息初始化
      setCaptchaErrorMsg("");
      setCaptchaShow(false);
      const urlParams = new URL(window.location.href).searchParams;
      window.location.href = urlParams.get("redirect") || "/";
      return;
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: "pages.login.failure",
        defaultMessage: "登录失败，请重试！",
      });
      console.log(error);
      message.error(defaultLoginFailureMessage);
    }
  };

  const waitTime = (time: number = 100) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });
  };

  const forgetPass = () => {
    message.open({
      key: "forget-error",
      type: "error",
      content: "请联系管理员",
    });
  };
  const onGetCaptcha = async (phone: string) => {
    if (phone) {
      // message.success("验证码已发送");
      // const result = await getFakeCaptcha({
      //   phone,
      // });
      // if (!result) {
      //   return;
      // }
      message.success("获取验证码成功！验证码为：1234");
    } else {
      message.error("请输入有效手机号");
      throw new Error("请输入有效手机号");
    }
  };

  const { status, type: loginType } = userLoginState;

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: "menu.login",
            defaultMessage: "登录页",
          })}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      {/* <Lang /> */}
      <div
        style={{
          flex: "1",
          padding: "32px 0",
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: "75vw",
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="OS 测试平台"
          subTitle="NEVC"
          initialValues={{
            autoLogin: true,
          }}
          // actions={[
          //   <FormattedMessage
          //     key="loginWith"
          //     id="pages.login.loginWith"
          //     defaultMessage="其他登录方式"
          //   />,
          //   <ActionIcons key="icons" />,
          // ]}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: "account",
                label: intl.formatMessage({
                  id: "pages.login.accountLogin.tab",
                  defaultMessage: "账户密码登录",
                }),
              },
              {
                key: "mobile",
                label: intl.formatMessage({
                  id: "pages.login.phoneLogin.tab",
                  defaultMessage: "手机号登录",
                }),
              },
            ]}
          />

          {status === "error" && loginType === "account" && (
            <LoginMessage
              content={intl.formatMessage({
                id: "pages.login.accountLogin.errorMessage",
                defaultMessage: "账户或密码错误(admin/ant.design)",
              })}
            />
          )}
          {type === "account" && (
            <>
              {/* 输入错误次数提示 */}

              {errorMsg && (
                <Alert
                  style={{ marginBottom: "10px" }}
                  message={errorMsg}
                  type="error"
                  showIcon
                />
              )}
              {/* {successMsg && (
                <Alert message={successMsg} type="info" showIcon />
              )} */}

              <ProFormText
                name="username"
                fieldProps={{
                  size: "large",
                  prefix: <UserOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: "pages.login.username.placeholder",
                  defaultMessage: "用户名: admin or user",
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="请输入用户名!"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: "large",
                  prefix: <LockOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: "pages.login.password.placeholder",
                  defaultMessage: "密码: ant.design",
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />
            </>
          )}

          {status === "error" && loginType === "mobile" && (
            <LoginMessage content="验证码错误" />
          )}
          {type === "mobile" && (
            <>
              {/* 验证码错误提示 */}
              {captchaerrorMsg && (
                <Alert
                  style={{ marginBottom: "10px" }}
                  message={captchaerrorMsg}
                  type="error"
                  showIcon
                />
              )}
              <ProFormText
                fieldProps={{
                  size: "large",
                  prefix: <MobileOutlined />,
                }}
                name="mobile"
                placeholder={intl.formatMessage({
                  id: "pages.login.phoneNumber.placeholder",
                  defaultMessage: "手机号",
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.required"
                        defaultMessage="请输入手机号！"
                      />
                    ),
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.invalid"
                        defaultMessage="手机号格式错误！"
                      />
                    ),
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: "large",
                  prefix: <LockOutlined />,
                }}
                captchaProps={{
                  size: "large",
                }}
                fieldRef={captchaRef}
                placeholder={intl.formatMessage({
                  id: "pages.login.captcha.placeholder",
                  defaultMessage: "请输入验证码",
                })}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${intl.formatMessage({
                      id: "pages.getCaptchaSecondText",
                      defaultMessage: "获取验证码",
                    })}`;
                  }
                  return intl.formatMessage({
                    id: "pages.login.phoneLogin.getVerificationCode",
                    defaultMessage: "获取验证码",
                  });
                }}
                phoneName="mobile"
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.captcha.required"
                        defaultMessage="请输入验证码！"
                      />
                    ),
                  },
                ]}
                onGetCaptcha={onGetCaptcha}
                onTiming={(count) => {
                  console.log("timing:", count);
                  if (count === 60) {
                    setCaptchaExpired(true);
                  } else {
                    setCaptchaExpired(false);
                  }
                }}
                // onTiming={() => setCaptchaExpired(true)} // 60秒结束时触发
              />
            </>
          )}
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              <FormattedMessage
                id="pages.login.rememberMe"
                defaultMessage="自动登录"
              />
            </ProFormCheckbox>
            <a
              style={{
                float: "right",
              }}
              onClick={forgetPass}
            >
              <FormattedMessage
                id="pages.login.forgotPassword"
                defaultMessage="忘记密码"
              />
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
