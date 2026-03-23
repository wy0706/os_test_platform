import { request } from "@umijs/max";

const baseUrl = "/api/caseManagement/testReport";

export async function getList(params: any) {
  const result: any = await request<{}>(`${baseUrl}/getList`, {
    method: "GET",
    params: params,
  });
  return result;
}

export async function getReportDetail(id: string) {
  const result: any = await request<{}>(`${baseUrl}/getReportDetail/${id}`, {
    method: "GET",
  });
  return result;
}
