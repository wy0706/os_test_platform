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
 * execution_file_id 测试序列id
 * @returns
 */

export async function getTestInfoList(execution_file_id: any) {
  const result: any = await request<{}>(`${baseUrl}/getTestiInfoList`, {
    method: "GET",
    params: { execution_file_id },
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
 * execution_file_id 当前测试序列id
 * @returns
 */
export async function getTestInfo(execution_file_id: any) {
  const result: any = await request<{}>(`${baseUrl}/GetTestInf`, {
    method: "GET",
    params: {
      execution_file_id,
    },
  });
  return result;
}
/**
 * 保存当前编辑测试信息
 * @param data
 * execution_file_id 文件id
 * ProjectName 项目名称
 * SampleName样品名称
 * Model 型号
 * TestOrg 测试单位
 * Tester 测试人员
 * Temperature 环境温度
 * Law 测试依据
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
 * @param execution_file_id  当前测试序列id
 * @returns
 */
export async function getReportInfo(execution_file_id: any) {
  const result: any = await request<{}>(`${baseUrl}/GetReportInf`, {
    method: "GET",
    params: { execution_file_id },
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
/**
 * 保存当前编辑报告信息
 * execution_file_id 文件id
 * ReportOperate报告操作方式
 * ReportSufx 报告后缀
 * ReportSufxflag 是否使能报告后缀
 * ReportServer 报告服务器
 * ReportServerflag 报告服务器是否使能
 * ReportModule报告模版
 * ReportModuleflag报告模版是否使能
 */

export async function updateReportOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/EditReportInf`, {
    method: "POST",
    data: data,
  });
  return result;
}
/**
 * 获取VECTOR列表
 * @param data
 * @returns
 */
export async function getVectorList() {
  const result: any = await request<{}>(`${baseUrl}/GetVectorList`, {
    method: "GET",
  });
  return result;
}
/**
 * 保存编辑vector状态信息
 * @param data
 * @returns
 */
export async function updateVectorOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/EditVector`, {
    method: "POST",
    data: data,
  });
  return result;
}
