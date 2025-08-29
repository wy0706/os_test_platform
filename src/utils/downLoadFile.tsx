import { request } from "@umijs/max";

/**
 * 下载文件
 * @param url 请求地址
 * @param params 请求参数
 * @param filename 下载保存的文件名
 */
export async function downloadFile(
  url: string,
  params: Record<string, any>,
  filename: string
) {
  const res = await request(url, {
    method: "GET",
    params,
    responseType: "blob",
  });
  // 处理返回的 blob
  const blob = new Blob([res]);
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(link.href);
}
