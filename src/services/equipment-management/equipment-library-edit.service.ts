import { request } from "@umijs/max";

const baseUrl = "/app_hwc";

/**
 * 查询仪器类别 右键Instrument
 *
 * @param {Object} params 请求参数
 * @param {string} params.route 该请求的访问路径，0-从设备管理，1-从系统管理
 * @param {string} params.group_id 当从系统管理请求时，可以通过单击某一类
 * @param {number} params.Instr_id 需要编辑一个仪器的信息的时候，需要点击仪器名称，请求仪器的基本参数，不筛选的时候，填 NULL
 */

export async function getInstrumentType(params: any) {
  const result: any = await request<{}>(`${baseUrl}/hwcgroupquery`, {
    method: "GET",
    params,
  });
  return result;
}
/**
 * 仪器查重创建查重
 *
 * @param {Object} params 请求参数
 * @param {string} params.type_code 仪器类别的typecode
 */
export async function createTypeOne(params: any) {
  const result: any = await request<{}>(`${baseUrl}/hwcgroupsel`, {
    method: "GET",
    params,
  });
  return result;
}
/**
 * 查询型号
 *
 * @param {Object} params 请求参数
 * @param {string} params.group_id 待查询的仪器类别ID
 * page_size
 * page_index
 */
export async function getInstrumentModal(params: any) {
  const result: any = await request<{}>(`${baseUrl}/hwcinstrquery`, {
    method: "GET",
    params,
  });
  return result;
}

/**
 * 型号查重创建查重
 *
 * @param {Object} params 请求参数
 * @param {string} params.instr_name 待查询的仪器型号
 */
export async function createModalOne(params: any) {
  const result: any = await request<{}>(`${baseUrl}/hwcinstrpara`, {
    method: "GET",
    params,
  });
  return result;
}
/**
 * 删除种类
 *
 * @param {string} type_code 待删除的仪器组别代号
 */
export async function deleteTypeOne(type_code: any) {
  const result: any = await request<{}>(`${baseUrl}/hwceditgroupdel`, {
    method: "GET",
    params: {
      type_code,
    },
  });
  return result;
}

/**
 * 删除型号
 * @param {string} instr_id 待删除的仪器型号的索引
 */
export async function deleteModalOne(instr_id: any) {
  const result: any = await request<{}>(`${baseUrl}/hwceditinstrdel`, {
    method: "GET",
    params: {
      instr_id,
    },
  });
  return result;
}
/**
 * 删除全部
 */

export async function deleteAllBatch() {
  const result: any = await request<{}>(`${baseUrl}/temphwcdelall`, {
    method: "GET",
  });
  return result;
}
/**
 * 点击左侧树，查询类型所有数据
 *
 * @param {Object} params 请求参数
 * @param {Int} params.type_code 非必填，如果填了，就返回当前类别的仪器清单
 * @param {Int} params.id 非必填，按照当前表格中的索引值，查看仪器信息
 */
export async function getAllTypeAndModal(params: any) {
  const result: any = await request<{}>(`${baseUrl}/temphwcquery`, {
    method: "GET",
    params,
  });
  return result;
}

/**
 * 修改型号和类型的数据
 *
 * @param {Object} params 请求参数
 * @param {Int} params.index 待设置参数的仪器在临时表中的index
 * @param {Int} params.paras 待设置参数的仪器的参数
 * @param {Int} params.is_active 待设置参数的仪器是否有效
 * @param {Int} params.useindex 待设置参数的仪器在当前类别中的序号
 */

export async function updateTypeAndModal(data: any) {
  const result: any = await request<{}>(`${baseUrl}/hwcinstrparamodify`, {
    method: "POST",
    data: data,
  });
  return result;
}
