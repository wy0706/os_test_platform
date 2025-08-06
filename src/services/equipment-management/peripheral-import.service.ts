import { request } from "@umijs/max";

export interface PeripheralImportData {
  treeData: any[];
  deviceConfigData: any[];
  channelConfigData: any[];
  selectedDevice: string;
}

export interface SaveFileResponse {
  success: boolean;
  message: string;
  downloadUrl?: string;
  fileName?: string;
}

export interface LoadFileResponse {
  success: boolean;
  message: string;
  data?: PeripheralImportData;
}

/**
 * 保存文件到本地
 * @param data 要保存的数据
 * @param fileName 文件名（可选）
 * @returns Promise<SaveFileResponse>
 */
export async function saveFileToLocal(
  data: PeripheralImportData,
  fileName?: string
): Promise<SaveFileResponse> {
  return request("/api/peripheral-import/save", {
    method: "POST",
    data: {
      ...data,
      fileName: fileName || `peripheral-import-${new Date().getTime()}.json`,
    },
  });
}

/**
 * 从本地加载文件
 * @param file 文件对象
 * @returns Promise<LoadFileResponse>
 */
export async function loadFileFromLocal(file: File): Promise<LoadFileResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return request("/api/peripheral-import/load", {
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

/**
 * 导出为Excel文件
 * @param data 要导出的数据
 * @returns Promise<SaveFileResponse>
 */
export async function exportToExcel(
  data: PeripheralImportData
): Promise<SaveFileResponse> {
  return request("/api/peripheral-import/export-excel", {
    method: "POST",
    data,
  });
}

/**
 * 导出为XML文件
 * @param data 要导出的数据
 * @returns Promise<SaveFileResponse>
 */
export async function exportToXML(
  data: PeripheralImportData
): Promise<SaveFileResponse> {
  return request("/api/peripheral-import/export-xml", {
    method: "POST",
    data,
  });
}
