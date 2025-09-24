import { request } from "@umijs/max";

const baseUrl1 = "/testModule";

const baseUrl2 = "/testCase";
// 获取测试模块列表
export async function getList(params: any) {
  const result: any = await request<{}>(`${baseUrl1}/getList`, {
    method: "GET",
    params: params,
  });
  return result;
}
// 创建测试模块
export async function createOne(data: any) {
  const result: any = await request<{}>(`${baseUrl1}/create`, {
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

// export async function getOne(id: any) {
//   const result: any = await request<{}>(`${baseUrl}/getOne/${id}`, {
//     method: "GET",
//   });
//   return result;
// }
// 编辑测试模块
export async function updateOne(data: any) {
  const result: any = await request<{}>(`${baseUrl1}/edit`, {
    method: "POST",
    data: data,
  });
  return result;
}
// 删除测试模块
export async function deleteOne(module_id: any) {
  const result: any = await request<{}>(`${baseUrl1}/delete`, {
    method: "DELETE",
    data: { module_id },
  });
  return result;
}

// 获取测试用例列表
export async function getCaseList(params: any) {
  const result: any = await request<{}>(`${baseUrl2}/getList`, {
    method: "GET",
    params: params,
  });
  return result;
}

// 创建测试用例
export async function createCase(data: any) {
  const result: any = await request<{}>(`${baseUrl2}/create`, {
    method: "POST",
    data: data,
  });
  return result;
}
// 编辑测试用例
export async function updateCase(data: any) {
  const result: any = await request<{}>(`${baseUrl2}/edit`, {
    method: "POST",
    data: data,
  });
  return result;
}
// 删除测试用例
export async function deleteCase(case_id: any) {
  const result: any = await request<{}>(`${baseUrl2}/delete`, {
    method: "DELETE",
    data: { case_id },
  });
  return result;
}
// 获取测试用例详情
export async function getCaseDetail(tc_id: any) {
  const result: any = await request<{}>(`${baseUrl2}/getOneById`, {
    method: "GET",
    params: { tc_id },
  });
  return result;
}
// 获取测试模块下拉选项
export async function getModuleOptions() {
  const result: any = await request<{}>(`${baseUrl1}/getTcmTree`, {
    method: "GET",
  });
  return result;
}
