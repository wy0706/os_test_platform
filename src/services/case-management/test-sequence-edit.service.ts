import { request } from "@umijs/max";

const baseUrl = "/api/caseManagement/testSequenceEdit";

enum BaseApi {
  TESTCOMMAND = "/testcommand", //测试流程
  TESTCONDITION = "/testcondition", //测试条件
  TESTRESULT = "/testresult", //测试结果
  TESTTEMP = "/testtemp", //临时变量
}

export async function getList(params: any) {
  const result: any = await request<{}>(`${baseUrl}/getList`, {
    method: "GET",
    params: params,
  });
  return result;
}

export async function createOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/createOne`, {
    method: "POST",
    data: data,
  });
  return result;
}

export async function getAll(params: any) {
  const result: any = await request<{}>(`${baseUrl}/getAll`, {
    method: "GET",
    params: params,
  });
  return result;
}

export async function getOne(id: any) {
  const result: any = await request<{}>(`${baseUrl}/getOne/${id}`, {
    method: "GET",
  });
  return result;
}

export async function updateOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/updateOne`, {
    method: "POST",
    data: data,
  });
  return result;
}

export async function deleteOne(id: any) {
  const result: any = await request<{}>(`${baseUrl}/deleteOne/${id}`, {
    method: "DELETE",
  });
  return result;
}

export async function deleteBatch(ids: any) {
  const result: any = await request<{}>(`${baseUrl}/deleteBatch`, {
    method: "DELETE",
    data: ids,
  });
  return result;
}
/**
 * 点编辑创建临时库
 *
 * sequence_id  测试序列ID
 */
export async function createTempLib(sequence_id: any) {
  const result: any = await request<{}>(`${BaseApi.TESTCOMMAND}/loadcmd`, {
    method: "POST",
    data: {
      sequence_id,
    },
  });
  return result;
}

// 获取命令树
export async function getCmdTreeList() {
  const result: any = await request<{}>(`${BaseApi.TESTCOMMAND}/getcmdtree`, {
    method: "GET",
  });
  return result;
}
/**
 * 获取测试流程列表
 */
export async function getCmdList() {
  const result: any = await request<{}>(`${BaseApi.TESTCOMMAND}/getList`, {
    method: "GET",
  });
  return result;
}
/**
 * 插入命令
 * @param data 
 * seq_id 当前命令的行号
  testcommand 测试命令
 * @returns 
 */
export async function insertCmd(data: any) {
  const result: any = await request<{}>(
    `${BaseApi.TESTCOMMAND}/insertcommand`,
    {
      method: "PUT",
      data: data,
    }
  );
  return result;
}
/**
 * 获取测试条件表
 */
export async function getConditonList() {
  const result: any = await request<{}>(
    `${BaseApi.TESTCONDITION}/getList
`,
    {
      method: "GET",
    }
  );
  return result;
}
/**
 * 获取测试结果表
 */
export async function getResultList() {
  const result: any = await request<{}>(`${BaseApi.TESTRESULT}/getList`, {
    method: "GET",
  });
  return result;
}
/**
 * 获取临时变量表list
 */
export async function getTempList() {
  const result: any = await request<{}>(`${BaseApi.TESTTEMP}/getList`, {
    method: "GET",
  });
  return result;
}
