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

/**
 * 编辑某条数据
 * id 项目id
 * TST 测试项目的类别，Pre,UUT,Post
 * Active 是否激活
 * RPTFlag 是否生成报告
 * Comments 备注
 * TIName 测试项目名称
 * @param data
 * @returns
 */
export async function updateOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpftiedit`, {
    method: "POST",
    data: data,
  });
  return result;
}
/**
 * 删除某条数据
 * id待删除项目的id
 * TST: Pre,UUT,POST
 * @param id
 * @returns
 */
export async function deleteOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpftidelete`, {
    method: "DELETE",
    data,
  });
  return result;
}

/**
 * 复制某条数据
 * id 测试项目的id
 * TST: Pre,UUT,POST
 * @param data
 * @returns
 */

export async function copyOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpfticopy`, {
    method: "POST",
    data: data,
  });
  return result;
}
/**
 * 粘贴某条数据
 * Seq粘贴的位置
 * TST: Pre,UUT,POST
 * method:0-复制粘贴，1-剪切粘贴
 * @param data
 * @returns
 */
export async function pasteOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpftipaste`, {
    method: "POST",
    data: data,
  });
  return result;
}
/**
 * 剪切某条数据
 * Seq 粘贴的位置
 * TST: Pre,UUT,POST
 * @param data
 * @returns
 */
export async function cutOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpfticut`, {
    method: "POST",
    data: data,
  });
  return result;
}

/**
 * 上移某条数据
 * id 测试项目的id
 * TST: Pre,UUT,POST
 * Seq 测试项目的排序
 * @param data
 * @returns
 */
export async function moveUpOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpftiMoveUp`, {
    method: "POST",
    data: data,
  });
  return result;
}
/**
 * 下移某条数据
 * id 测试项目的id
 * TST: Pre,UUT,POST
 * Seq 测试项目的排序
 * @param data
 * @returns
 */
export async function moveDownOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpftiMoveDown`, {
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
