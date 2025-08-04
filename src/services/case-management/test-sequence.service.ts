import { request } from "@umijs/max";

const baseUrl = "/api/caseManagement/testSequence";

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

// 获取序列类型列表
export async function getSequenceTypes() {
  const result: any = await request<{}>(`${baseUrl}/getSequenceTypes`, {
    method: "GET",
  });
  return result;
}

// 根据序列类型获取测试序列列表
export async function getTestSequencesByType(sequenceType: string) {
  const result: any = await request<{}>(`${baseUrl}/getTestSequencesByType`, {
    method: "GET",
    params: { sequenceType },
  });
  return result;
}
