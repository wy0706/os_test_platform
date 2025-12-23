import { request } from "@umijs/max";

const baseUrl = "/tpfedit";

/**
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
export async function createOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/InsertTi`, {
    method: "POST",
    data: data,
  });
  return result;
}
// =========================================
export async function getList(params: any) {
  const result: any = await request<{}>(`${baseUrl}/getList`, {
    method: "GET",
    params: params,
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
