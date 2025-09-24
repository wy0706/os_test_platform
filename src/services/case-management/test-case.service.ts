import { request } from "@umijs/max";

const baseUrl = "/testCaseLib";
// 获取测试用例库列表
export async function getList(params: any) {
  const result: any = await request<{}>(`${baseUrl}/getList`, {
    method: "GET",
    params: params,
  });
  return result;
}
// 创建测试用例库
export async function createOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/create`, {
    method: "POST",
    data: data,
  });
  return result;
}

// export async function getAll(params: any) {
//   const result: any = await request<{}>(`${baseUrl}/getAll`, {
//     method: "GET",
//     params: params,
//   });
//   return result;
// }

// 获取测试用例库详情
export async function getOne(lib_id: any) {
  const result: any = await request<{}>(`${baseUrl}/getOneById`, {
    method: "GET",
    params: {
      lib_id,
    },
  });
  return result;
}
// 编辑测试用例库
export async function updateOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/edit`, {
    method: "POST",
    data: data,
  });
  return result;
}
// 删除测试用例库

export async function deleteOne(lib_id: any) {
  const result: any = await request<{}>(`${baseUrl}/delete`, {
    method: "DELETE",
    data: {
      lib_id,
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
