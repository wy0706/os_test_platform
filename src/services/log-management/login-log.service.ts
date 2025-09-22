import { request } from "@umijs/max";

const baseUrl = "/loginLog";

export async function getList(params: any) {
  const result: any = await request<{}>(`${baseUrl}/getList`, {
    method: "GET",
    params,
  });
  return result;
}
