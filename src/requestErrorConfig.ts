import { NETWORK_ERROR_CODE, NETWORK_ERROR_TEXT } from "@/utils/error";
import type { RequestOptions } from "@@/plugin-request/request";
import type { RequestConfig } from "@umijs/max";
import { history } from "@umijs/max";
import { message, notification } from "antd";
const loginPath = "/user/login";
// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = "BizError";
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === "BizError") {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        // if (error.response.status === 408) {
        //   message.error("登录已过期，请重新登录");
        //   localStorage.clear();
        //   history.push(loginPath);
        //   return;
        // }

        if (/Network Error/.test(error.message)) {
          return message.error(`无法连接的服务器`);
        }
        switch (error.response.status) {
          case NETWORK_ERROR_CODE.BADREQUEST:
            message.error(`${NETWORK_ERROR_TEXT.BADREQUEST}`);
            return;
          case NETWORK_ERROR_CODE.CONFLICT:
            message.error(`${NETWORK_ERROR_TEXT.CONFLICT}`);
            return;
          case NETWORK_ERROR_CODE.FORBIDDEN:
            message.error(`${NETWORK_ERROR_TEXT.FORBIDDEN}`);
            return;
          case NETWORK_ERROR_CODE.MANYREQUESTS:
            message.error(`${NETWORK_ERROR_TEXT.MANYREQUESTS}`);
            return;
          case NETWORK_ERROR_CODE.NOTEXIST:
            message.error(`${NETWORK_ERROR_TEXT.NOTEXIST}`);
            return;
          case NETWORK_ERROR_CODE.UNAUTHORIZED:
            localStorage.clear();
            history.push(loginPath);
            message.error(`${NETWORK_ERROR_TEXT.UNAUTHORIZED},请重新登录`);
            return;
          case NETWORK_ERROR_CODE.UNAVAILABLE:
            message.error(`${NETWORK_ERROR_TEXT.UNAVAILABLE}`);
            return;
          case NETWORK_ERROR_CODE.UNKNOWNERROR:
            message.error(`${NETWORK_ERROR_TEXT.UNKNOWNERROR}`);
            return;
          case NETWORK_ERROR_CODE.REQUESTTIMEOUT:
            message.error(`${NETWORK_ERROR_TEXT.REQUESTTIMEOUT}`);
            return;
          default:
            message.error(`${error.response.data?.message}`);
            return;
        }
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error("None response! Please retry.");
      } else {
        // 发送请求时出了点问题
        message.error("Request error, please retry.");
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      const accessToken = localStorage.getItem("ACCESS-TOKEN");
      const refreshToken = localStorage.getItem("REFRESH-TOKEN");
      // config["headers"] = {
      //   ...config.headers,
      //   "ACCESS-TOKEN": `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU4NjgzMjk4LCJpYXQiOjE3NTgwNzg0OTgsImp0aSI6Ijc5NGI3ZDliMjc4ODRlMWJhNDY0ZDg5NGQzODkxOWY2IiwidXNlcl9pZCI6IjEifQ.Nq7faCz-JGA4tacPc1uERZOT6-88Twee8Hcjpe8jJ8k`,
      //   "REFRESH-TOKEN": `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1ODY4MzI5OCwiaWF0IjoxNzU4MDc4NDk4LCJqdGkiOiJlNmYzOTBhNzVjOWQ0ZmUyODkzZjI2M2EyNWU1NmRkZiIsInVzZXJfaWQiOiIxIn0.K8XmRdsf5mJzf02Y8iek7Q6BCfT_FWD-91W_R2Y6wzM`,
      // };
      config.headers = {
        ...config.headers,
        ...(accessToken ? { "ACCESS-TOKEN": accessToken } : {}),
        ...(refreshToken ? { "REFRESH-TOKEN": refreshToken } : {}),
      };
      // 拦截请求配置，进行个性化处理。
      // const url = config?.url?.concat('?token=123');
      // return { ...config, url };
      return config;
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response as unknown as ResponseStructure;

      // 如果后端返回了新的 token，就更新本地存储
      const newAccessToken = data.access_token;
      const newRefreshToken = data.refresh_token;
      if (newAccessToken && newRefreshToken) {
        localStorage.setItem("ACCESS-TOKEN", newAccessToken);
        localStorage.setItem("REFRESH-TOKEN", newRefreshToken);
      }
      if (data?.success === false) {
        message.error("请求失败！");
      }

      return response;
    },
  ],
};
