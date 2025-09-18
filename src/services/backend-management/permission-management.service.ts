import { request } from "@umijs/max";

const baseUrl = "/role";

// 获取角色列表
export async function getList(params: any) {
  const result: any = await request<{}>(`${baseUrl}/getList`, {
    method: "GET",
    params,
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
// 根据角色id查看权限code
export async function getOne(role_id: any) {
  const result: any = await request<{}>(`${baseUrl}/getOneById`, {
    method: "GET",
    params: { role_id },
  });
  return result;
}

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
