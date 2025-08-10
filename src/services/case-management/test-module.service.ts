import { request } from "@umijs/max";

const baseUrl = "/api/caseManagement/testModule";

// 获取模块列表
export async function getModuleList(params: any) {
  const result: any = await request<{}>(`${baseUrl}/getList`, {
    method: "GET",
    params: params,
  });
  return result;
}

// 创建新模块
export async function createModule(data: any) {
  const result: any = await request<{}>(`${baseUrl}/createOne`, {
    method: "POST",
    data: data,
  });
  return result;
}

// 获取单个模块信息
export async function getModule(id: any) {
  const result: any = await request<{}>(`${baseUrl}/getOne/${id}`, {
    method: "GET",
  });
  return result;
}

// 更新模块信息
export async function updateModule(data: any) {
  const result: any = await request<{}>(`${baseUrl}/updateOne`, {
    method: "POST",
    data: data,
  });
  return result;
}

// 删除模块
export async function deleteModule(id: any) {
  const result: any = await request<{}>(`${baseUrl}/deleteOne/${id}`, {
    method: "DELETE",
  });
  return result;
}

// 批量删除模块
export async function deleteModuleBatch(ids: any) {
  const result: any = await request<{}>(`${baseUrl}/deleteBatch`, {
    method: "DELETE",
    data: ids,
  });
  return result;
}

// 获取模块下的测试用例数量
export async function getModuleCaseCount(moduleId: any) {
  const result: any = await request<{}>(`${baseUrl}/getCaseCount/${moduleId}`, {
    method: "GET",
  });
  return result;
}
