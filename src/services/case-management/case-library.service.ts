import { request } from "@umijs/max";

const baseUrl = "/executionfile";
/**
 * 获取序列执行列表
 * @param params
 * @returns
 */
export async function getList(params: any) {
  const result: any = await request<{}>(`${baseUrl}/getList`, {
    method: "GET",
    params: params,
  });
  return result;
}
/**
 * 编辑测试文件信息
 * @param data
 * execution_file_id 执行文件ID
 * mode 型号
 * username 作者
 * user_id 用户ID
 * testtime 测试时间
 * description 说明
 * configfile 配置文件
 * @returns
 */
export async function editRunFileForm(data: any) {
  const result: any = await request<{}>(`${baseUrl}/edit`, {
    method: "POST",
    data: data,
  });
  return result;
}

/**
 * 获取测试文件信息详情
 * @param 
 * execution_file_id 执行文件id

 * @returns
 */
export async function getOne(execution_file_id: any) {
  const result: any = await request<{}>(`${baseUrl}/getOneById`, {
    method: "GET",
    params: {
      execution_file_id,
    },
  });
  return result;
}
