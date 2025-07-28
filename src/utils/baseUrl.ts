type Env = {
  /** 正式环境 */
  prod: string;
  /** 测试环境 */
  test: string;
  /** 开发环境 */
  dev: string;
  /** 预发布 */
  pre: string;
  /** 其他环境 */
  [prop: string]: any;
};

export const API_BASE_MAP: Env = {
  dev: "http://127.0.0.1:8000",
  test: "http://127.0.0.1:8001",
  prod: "http://127.0.0.1:8002",
  pre: "http://127.0.0.1:8003",
};
