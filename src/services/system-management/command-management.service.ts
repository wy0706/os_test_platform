import { request } from "@umijs/max";

const baseUrl = "/addcommand";
/**
 * 
 * @param params 
 * testcommand 测试命令，用于查询，支持模糊查询
 * creat_time 创建时间，用于查询，支持模糊查询

 * @returns 
 */
export async function getList(params: any) {
  const result: any = await request<{}>(`${baseUrl}/getList`, {
    method: "GET",
    params: params,
  });
  return result;
}
/**
 *
 * @param data
 * testcommand 命令名称

device_type 设备类型

active 是否有效

Inpara_type 输入参数类型

Inpara_uint 输入参数单位

outpara_type 输出参数类型

outpara_uint 输出参数单位

description 描述


 * @returns
 */

export async function createOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/create`, {
    method: "POST",
    data: data,
  });
  return result;
}

/**
 *
 * @param command_id 命令ID
 * @returns
 */
export async function getOne(command_id: any) {
  const result: any = await request<{}>(`${baseUrl}/getOneById`, {
    method: "GET",
    params: {
      command_id,
    },
  });
  return result;
}
/**
 *
 * @param data
 *  command_id 命令ID
     testcommand 命令名称
     device_type 设备类型
     active 是否有效
     device_type_id 设备类型编码
     Inpara_type 输入参数类型
     Inpara_uint 输入参数单位
     outpara_type 输出参数类型
     outpara_uint 输出参数单位
     description描述
 * @returns
 */
export async function updateOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/editinpar`, {
    method: "PUT",
    data: data,
  });
  return result;
}
/**
 *
 * @param command_id 命令ID
 * @returns
 */
export async function deleteOne(command_id: any) {
  const result: any = await request<{}>(`${baseUrl}/delete`, {
    method: "DELETE",
    params: {
      command_id,
    },
  });
  return result;
}
