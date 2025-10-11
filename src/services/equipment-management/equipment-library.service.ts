import { request } from "@umijs/max";

const baseUrl = "/app_hwc";

/**
 * 获取文件列表
 *
 * @param {Object} params 请求参数
 * @param {string} params.file_name 文件名
 * @param {string} params.edit_time 时间
 * @param {number} params.page_size 每页数量
 * @param {number} params.page_index 当前页码
 * @returns {Promise<Object>} 文件列表请求结果
 */
export async function getList(params: any) {
  const result: any = await request<{}>(`${baseUrl}/hwcfilelist`, {
    method: "GET",
    params: params,
  });
  return result;
}
// 新建
export async function createOne() {
  const result: any = await request<{}>(`${baseUrl}/hwcfilenew`, {
    method: "POST",
    data: {},
  });
  return result;
}

export async function deleteOne(id: any) {
  const result: any = await request<{}>(`${baseUrl}/hwcfilelistdel`, {
    method: "POST",
    data: {
      file_id: id,
    },
  });
  return result;
}

// export async function deleteBatch(ids: any) {
//   const result: any = await request<{}>(`${baseUrl}/deleteBatch`, {
//     method: "DELETE",
//     data: ids,
//   });
//   return result;
// }
