import { request } from "@umijs/max";

const baseUrl = "/execution";
/**
 *
 * @param params 获取序列执行列表 sequence_id 测试序列ID
 * @returns
 */
export async function getList(sequence_id: any) {
  const result: any = await request<{}>(`${baseUrl}/getList`, {
    method: "GET",
    params: { sequence_id },
  });
  return result;
}

/**
 * 获取测试信息
 * @param data
 * testprogram 测试序列名称
 * @returns
 */

export async function getTestInfoList(testprogram: any) {
  const result: any = await request<{}>(`${baseUrl}/getTestiInfoList`, {
    method: "GET",
    params: { testprogram },
  });
  return result;
}

/**
 * 获取测试条件
 * @param data
 * execution_file_id 当前测试序列id
 * @returns 

 */
export async function getConditionalInfoList(execution_file_id: any) {
  const result: any = await request<{}>(`${baseUrl}/getTConditionalInfoList`, {
    method: "GET",
    params: { execution_file_id },
  });
  return result;
}

/**
 * 获取测试信息详情
 * @param data
 * @returns
 */
export async function getTestInfo() {
  const result: any = await request<{}>(`${baseUrl}/GetTestInf`, {
    method: "GET",
  });
  return result;
}
/**
 * 保存当前编辑测试信息
 * @param data
 * @returns
 */
export async function updateTestInfo(data: any) {
  const result: any = await request<{}>(`${baseUrl}/EditTestInf`, {
    method: "POST",
    data,
  });
  return result;
}
/**
 * 获取报告详情
 * @param data
 * @returns
 */
export async function getReportInfo() {
  const result: any = await request<{}>(`${baseUrl}/GetReportInf`, {
    method: "GET",
  });
  return result;
}
/**
 * 获取服务器列表
 * @param data
 * @returns
 */
export async function getServerList() {
  const result: any = await request<{}>(`${baseUrl}/GetServerList`, {
    method: "GET",
  });
  return result;
}
/**
 * 获取exel模板列表
 * @returns
 */
export async function GetExcelList() {
  const result: any = await request<{}>(`${baseUrl}/GetExcelTPLList`, {
    method: "GET",
  });
  return result;
}

// export async function createOne(data: any) {
//   const result: any = await request<{}>(`${baseUrl}/createOne`, {
//     method: "POST",
//     data: data,
//   });
//   return result;
// }

// export async function getAll(params: any) {
//   const result: any = await request<{}>(`${baseUrl}/getAll`, {
//     method: "GET",
//     params: params,
//   });
//   return result;
// }

// export async function getOne(id: any) {
//   const result: any = await request<{}>(`${baseUrl}/getOne/${id}`, {
//     method: "GET",
//   });
//   return result;
// }

// export async function updateOne(data: any) {
//   const result: any = await request<{}>(`${baseUrl}/updateOne`, {
//     method: "POST",
//     data: data,
//   });
//   return result;
// }

// export async function deleteOne(id: any) {
//   const result: any = await request<{}>(`${baseUrl}/deleteOne/${id}`, {
//     method: "DELETE",
//   });
//   return result;
// }

// export async function deleteBatch(ids: any) {
//   const result: any = await request<{}>(`${baseUrl}/deleteBatch`, {
//     method: "DELETE",
//     data: ids,
//   });
//   return result;
// }
