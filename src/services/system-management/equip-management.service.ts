import { request } from "@umijs/max";

const baseUrl = "/app_hwc";

/**
 * 在系统管理界面里删除类别
 * @param group_id  仪器类别的代码
 */

export async function deleteTypeOne(group_id: any) {
  const result: any = await request<{}>(`${baseUrl}/hwcgroupdel`, {
    method: "POST",
    data: {
      group_id,
    },
  });
  return result;
}

/**
 *系统管理里设备类型名称的修改
 * @param data
 * group_index 设备类别的代码（代码固定）
  group_name 设备类别的名称（待修改）
 */

export async function updateTypeOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/hwcgroupmodify`, {
    method: "POST",
    data: data,
  });
  return result;
}

/**
 * 在系统管理界面里修改仪器的详细信息（或者新增）
 * @param data 
  group_id  类别的ID
  instr_id仪器的ID
  instr_model设备型号
  Interface设备接口
  modulesmax仪器最大通道
  defaultparas仪器默认参数
  apidll 仪器驱动程序
 */
export async function updateModelOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/hwcsysinstrmodify`, {
    method: "POST",
    data: data,
  });
  return result;
}
/**
 * 在系统管理界面里修改仪器的详细信息（或者新增）
 * @param data 
  group_id  仪器的ID
  instr_model设备型号
  Interface设备接口
  modulesmax仪器最大通道
  defaultparas仪器默认参数
  apidll 仪器驱动程序
 */
export async function addModelOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/hwcsysinstradd`, {
    method: "POST",
    data: data,
  });
  return result;
}

/**
 *
 * @param instr_id 系统管理里删除仪器
 * @returns
 */
export async function deleteModelOne(instr_id: any) {
  const result: any = await request<{}>(`${baseUrl}/hwcsysinstrdel`, {
    method: "POST",
    data: {
      instr_id,
    },
  });
  return result;
}

export async function uploadFile(ids: any) {
  const result: any = await request<{}>(`${baseUrl}/uploadapidll`, {
    method: "post",
    data: ids,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return result;
}
