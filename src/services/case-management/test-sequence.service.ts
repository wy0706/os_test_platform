import { request } from "@umijs/max";

enum BaseApi {
  TestSequenceType = `/testsequencetype`,
  TestSequence = "/testsequence",
}

/**
 * 获取测试序列类
 */
export async function getTypeList() {
  const result: any = await request<{}>(`${BaseApi.TestSequenceType}/getList`, {
    method: "GET",
  });
  return result;
}

/**
 * 创建测试序列类
 * tigroup 类型名称
 * sysoruser  用户或系统名称

 */

export async function createSequenceType(data: any) {
  const result: any = await request<{}>(`${BaseApi.TestSequenceType}/create`, {
    method: "POST",
    data,
  });
  return result;
}
/**
 * 编辑测试序列类 被编辑序列类ID
 * sequencetype_id
tigroup 类型名称

 */
export async function updateSequenceType(data: any) {
  const result: any = await request<{}>(`${BaseApi.TestSequenceType}/edit`, {
    method: "POST",
    data,
  });
  return result;
}
/**
 * 删除测试序列类
 */

export async function deleteSequenceType(id: any) {
  const result: any = await request<{}>(`${BaseApi.TestSequenceType}/delete`, {
    method: "DELETE",
    data: { sequencetype_id: id },
  });
  return result;
}
/**
 * 获取测试序列列表
 *
 * @param {Object} params 请求参数
 * @param {string} params.sequence_name 测试序列名称，用于条件查询，支持模糊查询
 * @param {string} params.TST 测试类型，包括pre/uut/post ，用于条件查询
 * @param {string} params.tc_title 关联测试用例名称，用于条件查询，支持模糊查询
 * @param {string} params.sequencetype_id 测试类型ID，获取测试序列所在的
 * @param {string} params.is_published 是否发布，用于条件查询
 * @param {string} params.sysoruser 获取测试序列所在的sys类型或user类
 * page_size
 * page_index
 */
export async function getSequenceList(params: any) {
  const result: any = await request<{}>(`${BaseApi.TestSequence}/getList`, {
    method: "GET",
    params,
  });
  return result;
}

/**
 * 创建测试序列 
 * sequence_name 测试序列名称
TST 三阶段测试，包括pre/uut/post 
tc_title 无	关联测试用例标题，发送用例ID和用例名称，是一组数据表现形式：【{id：，title:},{}】
tigroup 测试序列类
 */
export async function createSequence(data: any) {
  const result: any = await request<{}>(`${BaseApi.TestSequence}/create`, {
    method: "POST",
    data,
  });
  return result;
}
/**
 * 编辑测试序列 
 * 
 * tigroup 测试序列类，可以做移动功能编辑（移动功能）
sequence_name 序列名称
tc_title 关联测试用例标题，发送用例ID和用例名称，是一组数据表现形式：【{id：，title:},{}】
is_published 是否发布
TST 三阶段测试，包括pre/uut/post

 */
export async function updateSequence(data: any) {
  const result: any = await request<{}>(`${BaseApi.TestSequence}/edit`, {
    method: "POST",
    data,
  });
  return result;
}
/**
 * 删除测试序列
 * sequence_id  测试序列ID
 */
export async function deleteSequence(id: any) {
  const result: any = await request<{}>(`${BaseApi.TestSequence}/delete`, {
    method: "DELETE",
    data: { sequence_id: id },
  });
  return result;
}
/**
 * 复制测试序列
 * sequence_name 序列名称
tigroup 类型名称
is_published 是否发布
 */
export async function copySequence(data: any) {
  const result: any = await request<{}>(`${BaseApi.TestSequence}/copy`, {
    method: "POST",
    data,
  });
  return result;
}
