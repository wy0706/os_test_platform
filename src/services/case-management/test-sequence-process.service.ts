import { request } from "@umijs/max";

const baseUrl = "/tpfedit";

/**
 * 获取测试项目树结构
 *TST：测试项目的类型是Pre,UUT,还是POST
 * @param params
 * @returns
 */
export async function getTpfTree(params: any) {
  const result: any = await request<{}>(`${baseUrl}/tpfgettitree`, {
    method: "GET",
    params: params,
  });
  return result;
}
/**
 * 向测试程序中，插入测试项目
 * id ：待插入测试项目的ID
 * TST: Pre,UUT,POST
 *Seq ：插入测试项目的位置
 * @param data
 * @returns
 */
export async function insertOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpfinsertti`, {
    method: "POST",
    data: data,
  });
  return result;
}
/**
 * 页面切换(Pre UUT Post)获取列表
 * TST : Pre UUT Post
 * @param params
 * @returns
 */
export async function getList(params: any) {
  const result: any = await request<{}>(`${baseUrl}/tpftabsw`, {
    method: "GET",
    params: params,
  });
  return result;
}
// =================
/**
 * 编辑某条数据
 * @param data
 * @returns
 */
export async function updateOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/updateOne`, {
    method: "POST",
    data: data,
  });
  return result;
}
/**
 * 删除某条数据
 * @param id
 * @returns
 */
export async function deleteOne(id: any) {
  const result: any = await request<{}>(`${baseUrl}/deleteOne/${id}`, {
    method: "DELETE",
  });
  return result;
}

/**
 * 上移下移某条数据
 * @param data
 * @returns
 */
export async function moveOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/updateOne`, {
    method: "POST",
    data: data,
  });
  return result;
}
/**
 * 对应测试项目的测试条件的参数查询
 * id 测试项目的排序（SEQ）
 * TST 测试项目的类别，Pre,UUT,Post
 * @param params
 * @returns
 */
export async function getConList(params: any) {
  const result: any = await request<{}>(`${baseUrl}/tpfgetticon`, {
    method: "GET",
    params: params,
  });
  return result;
}
/**
 *  对应测试项目的测试结果的参数查询
 * id 测试项目的排序（SEQ）
 * TST 测试项目的类别，Pre,UUT,Post
 * @param params
 * @returns
 */
export async function getResultList(params: any) {
  const result: any = await request<{}>(`${baseUrl}/tpfgetres`, {
    method: "GET",
    params: params,
  });
  return result;
}
/**
 *
 * @param data 测试条件的值编辑
 * @returns
 */
export async function updateConditionOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpfconditionedit`, {
    method: "POST",
    data: data,
  });
  return result;
}

/**
 *
 * @param data 测试结果的值编辑
 * @returns
 */
export async function updateResultOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpfresultedit`, {
    method: "POST",
    data: data,
  });
  return result;
}
