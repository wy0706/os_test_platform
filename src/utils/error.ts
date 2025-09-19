export const enum NETWORK_ERROR_CODE {
  /** 默认 */
  DEFAULT = 0,
  /** 参数缺失或格式错误 */
  BADREQUEST = 400,
  /** 未认证/Token 失效 */
  UNAUTHORIZED = 401,
  /** 没有权限 */
  FORBIDDEN = 403,
  /** 资源冲突 */
  CONFLICT = 409,
  /** 登录频繁，导致限流  */
  MANYREQUESTS = 429,
  /** 接口不存在  */
  NOTEXIST = 404,
  /** 服务端未知错误 */
  UNKNOWNERROR = 500,
  /** 服务不可用 */
  UNAVAILABLE = 503,
}

export const NETWORK_ERROR_TEXT = {
  DEFAULT: "请检查网络是否连接",
  BADREQUEST: "请求参数不合法",
  UNAUTHORIZED: "未认证/Token 失效",
  FORBIDDEN: "没有权限",
  CONFLICT: "资源冲突",
  MANYREQUESTS: "登录频繁，导致限流",
  NOTEXIST: "接口不存在",
  UNKNOWNERROR: "服务器未知错误",
  UNAVAILABLE: "服务不可用",
};
