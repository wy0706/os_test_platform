import { request } from "@umijs/max";

const baseUrl = "/testlog";

export async function getList(params: any) {
  const result: any = await request<{}>(`${baseUrl}/getList`, {
    method: "GET",
    params: params,
  });
  return result;
}

export async function getOne(id: any) {
  const result: any = await request<{}>(`${baseUrl}/getinfo`, {
    method: "GET",
    params: { id },
  });
  return result;
}

export async function deleteOne(id: any) {
  const result: any = await request<{}>(`${baseUrl}/delete`, {
    method: "DELETE",
    data: { id },
  });
  return result;
}
