import { request } from "@umijs/max";

const baseUrl = "/api/caseManagement/testSequenceEdit";

enum BaseApi {
  TESTCOMMAND = "/testcommand", //测试流程
}

export async function getList(params: any) {
  const result: any = await request<{}>(`${baseUrl}/getList`, {
    method: "GET",
    params: params,
  });
  return result;
}

export async function createOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/createOne`, {
    method: "POST",
    data: data,
  });
  return result;
}

export async function getAll(params: any) {
  const result: any = await request<{}>(`${baseUrl}/getAll`, {
    method: "GET",
    params: params,
  });
  return result;
}

export async function getOne(id: any) {
  const result: any = await request<{}>(`${baseUrl}/getOne/${id}`, {
    method: "GET",
  });
  return result;
}

export async function updateOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/updateOne`, {
    method: "POST",
    data: data,
  });
  return result;
}

export async function deleteOne(id: any) {
  const result: any = await request<{}>(`${baseUrl}/deleteOne/${id}`, {
    method: "DELETE",
  });
  return result;
}

export async function deleteBatch(ids: any) {
  const result: any = await request<{}>(`${baseUrl}/deleteBatch`, {
    method: "DELETE",
    data: ids,
  });
  return result;
}
// 获取命令树
export async function getCmdTreeList() {
  const result: any = await request<{}>(`${BaseApi.TESTCOMMAND}/getcmdtree`, {
    method: "GET",
  });
  return result;
}
/**
 * 获取测试流程列表
 *  sequence_id 测试序列ID，-1时获取临时变量表
 */
export async function getCmdList(sequence_id: any) {
  const result: any = await request<{}>(`${BaseApi.TESTCOMMAND}/getList`, {
    method: "GET",
    params: {
      sequence_id,
    },
  });
  return result;
}
