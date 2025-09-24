import { request } from "@umijs/max";
const baseUrl = "/user";

// 获取用户列表
export async function getList(params: any) {
  const result: any = await request<{}>(`${baseUrl}/getList`, {
    method: "GET",
    params,
  });
  return result;
}
// 创建用户信息
export async function createOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/create`, {
    method: "POST",
    data: data,
  });
  return result;
}
// 获取用户信息
export async function getOne(user_id: any) {
  const result: any = await request<{}>(`${baseUrl}/getOneById`, {
    method: "GET",
    params: { user_id },
  });
  return result;
}
// 编辑用户
export async function updateOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/edit`, {
    method: "PUT",
    data: data,
  });
  return result;
}
// 删除
export async function deleteOne(user_id: any) {
  const result: any = await request<{}>(`${baseUrl}/delete`, {
    method: "DELETE",
    data: {
      user_id,
    },
  });
  return result;
}
// 解锁状态
export async function activeOne(user_id: any) {
  const result: any = await request<{}>(`${baseUrl}/activeAccount`, {
    method: "PATCH",
    data: { user_id },
  });
  return result;
}
// 用户修改密码 PATCH
export async function updatePassWord(params: any) {
  const result: any = await request<{}>(`${baseUrl}/changePassword`, {
    method: "PATCH",
    data: params,
  });
  return result;
}
// 重置密码
export async function resetPassWord(user_id: any) {
  const result: any = await request<{}>(`${baseUrl}/resetPassword`, {
    method: "PATCH",
    data: { user_id },
  });
  return result;
}
