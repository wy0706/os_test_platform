import { request } from "@umijs/max";

const baseUrl = "/tpfedit";

/**
 * 获取测试程序列表
 * @param params
 * tpfname 执行的文件名字，用于条件查询，支持模糊查询
 * page_size
 * page_index
 * sort 字典类型，包含键值对其中key为排序字段（目前只包含时间） value为升序/降序（ascend/descend）
 */
export async function getList(params: any) {
  const result: any = await request<{}>(`${baseUrl}/getList`, {
    method: "GET",
    params: params,
  });
  return result;
}
/**
 * 获取程序详情
 * @param id  测试程序的id
 */
export async function getOne(id: any) {
  const result: any = await request<{}>(`${baseUrl}/getInfo`, {
    method: "GET",
    params: { id },
  });
  return result;
}
/**
 *  编辑是否发布
 * @param data
 * @returns
 */
export async function updateOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpfInfoEdit`, {
    method: "PUT",
    data: data,
  });
  return result;
}
/**
 * 删除
 * @param id 测试程序的ID
 * @returns
 */
export async function deleteOne(id: any) {
  const result: any = await request<{}>(`${baseUrl}/tpfDelete`, {
    method: "DELETE",
    data: {
      id,
    },
  });
  return result;
}
// ============
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

export async function deleteBatch(ids: any) {
  const result: any = await request<{}>(`${baseUrl}/deleteBatch`, {
    method: "DELETE",
    data: ids,
  });
  return result;
}
