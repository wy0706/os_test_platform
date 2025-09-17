enum NETWORK_ERROR_CODE {
  /** 默认 */
  DEFAULT = 0,
  /** 参数缺失或格式错误 */
  BADREQUEST = 400,
  /** 用户不存在 */
  UNAUTHORIZED = 401,
  /** 权限不足 */
  FORBIDDEN = 403,
  /** 资源冲突 */
  CONFLICT = 409,
  /** 登录频繁，导致限流  */
  MANYREQUESTS = 429,
}

export const NETWORK_ERROR_TEXT = {
  DEFAULT: "请检查网络是否连接",
  BADREQUEST: "参数缺失或格式错误",
  UNAUTHORIZED: "用户不存在",
  FORBIDDEN: "权限不足",
  CONFLICT: "资源冲突",
  MANYREQUESTS: "登录频繁，导致限流",
};
