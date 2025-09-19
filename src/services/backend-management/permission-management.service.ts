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
// 创建角色
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
// 根据角色id查看权限code
export async function getOne(role_id: any) {
  const result: any = await request<{}>(`${baseUrl}/getOneById`, {
    method: "GET",
    params: { role_id },
  });
  return result;
}
// 角色/权限编辑
export async function updateOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/edit`, {
    method: "PUT",
    data: data,
  });
  return result;
}
// 删除角色
export async function deleteOne(role_id: any) {
  const result: any = await request<{}>(`${baseUrl}/delete`, {
    method: "DELETE",
    data: {
      role_id,
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
