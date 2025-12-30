import { request } from "@umijs/max";

const baseUrl = "/tpfedit";

/**
 * 获取测试项目树结构
 *TST：测试项目的类型是Pre,UUT,还是POST
 * @param params
 * @returns
 */
export async function getTpfTree(params: any) {
  const result: any = await request<{}>(`${baseUrl}/tpfgettitree`, {
    method: "GET",
    params: params,
  });
  return result;
}
/**
 * 向测试程序中，插入测试项目
 * id ：待插入测试项目的ID
 * TST: Pre,UUT,POST
 *Seq ：插入测试项目的位置
 * @param data
 * @returns
 */
export async function insertOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpfinsertti`, {
    method: "POST",
    data: data,
  });
  return result;
}
/**
 * 页面切换(Pre UUT Post)获取列表
 * TST : Pre UUT Post
 * @param params
 * @returns
 */
export async function getList(params: any) {
  const result: any = await request<{}>(`${baseUrl}/tpftabsw`, {
    method: "GET",
    params: params,
  });
  return result;
}

/**
 * 编辑某条数据
 * id 项目id
 * TST 测试项目的类别，Pre,UUT,Post
 * Active 是否激活
 * RPTFlag 是否生成报告
 * Comments 备注
 * TIName 测试项目名称
 * @param data
 * @returns
 */
export async function updateOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpftiedit`, {
    method: "POST",
    data: data,
  });
  return result;
}
/**
 * 删除某条数据
 * id待删除项目的id
 * TST: Pre,UUT,POST
 * @param id
 * @returns
 */
export async function deleteOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpftidelete`, {
    method: "DELETE",
    data,
  });
  return result;
}

/**
 * 复制某条数据
 * id 测试项目的id
 * TST: Pre,UUT,POST
 * @param data
 * @returns
 */

export async function copyOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpfticopy`, {
    method: "POST",
    data: data,
  });
  return result;
}
/**
 * 粘贴某条数据
 * Seq粘贴的位置
 * TST: Pre,UUT,POST
 * method:0-复制粘贴，1-剪切粘贴
 * @param data
 * @returns
 */
export async function pasteOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpftipaste`, {
    method: "POST",
    data: data,
  });
  return result;
}
/**
 * 剪切某条数据
 * Seq 粘贴的位置
 * TST: Pre,UUT,POST
 * @param data
 * @returns
 */
export async function cutOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpfticut`, {
    method: "POST",
    data: data,
  });
  return result;
}

/**
 * 上移某条数据
 * id 测试项目的id
 * TST: Pre,UUT,POST
 * Seq 测试项目的排序
 * @param data
 * @returns
 */
export async function moveUpOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpftiMoveUp`, {
    method: "POST",
    data: data,
  });
  return result;
}
/**
 * 下移某条数据
 * id 测试项目的id
 * TST: Pre,UUT,POST
 * Seq 测试项目的排序
 * @param data
 * @returns
 */
export async function moveDownOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpftiMoveDown`, {
    method: "POST",
    data: data,
  });
  return result;
}
/**
 * 对应测试项目的测试条件的参数查询
 * id 测试项目的排序（SEQ）
 * TST 测试项目的类别，Pre,UUT,Post
 * @param params
 * @returns
 */
export async function getConList(params: any) {
  const result: any = await request<{}>(`${baseUrl}/tpfgetticon`, {
    method: "GET",
    params: params,
  });
  return result;
}
/**
 *  对应测试项目的测试结果的参数查询
 * id 测试项目的排序（SEQ）
 * TST 测试项目的类别，Pre,UUT,Post
 * @param params
 * @returns
 */
export async function getResultList(params: any) {
  const result: any = await request<{}>(`${baseUrl}/tpfgetres`, {
    method: "GET",
    params: params,
  });
  return result;
}
/**
 *
 * @param data 测试条件的值编辑
 * @returns
 */
export async function updateConditionOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpfconditionedit`, {
    method: "POST",
    data: data,
  });
  return result;
}

/**
 *
 * @param data 测试结果的值编辑
 * @returns
 */
export async function updateResultOne(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpfresultedit`, {
    method: "POST",
    data: data,
  });
  return result;
}
/**
 * 保存测试程序
 * filename 测试程序名称
 * method保存方式（0-新建保存，1-打开保存 2-打开另存为）
 * @param data
 * @returns
 */
export async function saveData(data: any) {
  const result: any = await request<{}>(`${baseUrl}/tpfsave`, {
    method: "POST",
    data: data,
  });
  return result;
}

// 保存操作的状态查询
/**
 * 存的几种情况说明：
1、临时表为空，提示信息：测试程序为空，不能保存！错误代码-1
2、新建保存，需要判断保存的时候，文件名称是否重复，method = 0,错误代码-2，如果文件名不重复，则保存成功，代码0。
3、打开保存，method = 1，如果程序已经发布，提示不可保存，提示内容：测试程序已经发布，如需修改请取消发布！，错误代码-3
4、打开另存为，method = 2,如果文件名重复，错误代码-2，提示字符串：“文件名重复，无法保存！”

 * @returns 
 */
export async function beforeSave() {
  const result: any = await request<{}>(`${baseUrl}/tpfsavestate`, {
    method: "GET",
  });
  return result;
}
/**编辑界面里点新建
 * 有正在编辑的文件，是否需要保存?返回代码1，如果临时表为空，返回代码0，返回字符串：succeed

 * @returns 
 */
export async function beforeAdd() {
  const result: any = await request<{}>(`${baseUrl}/tpfcreate2`, {
    method: "POST",
  });
  return result;
}
/**
 * 编辑界面里点返回
 * 在程序编辑的界面点返回按键，主要判断当前测试程序是否保存，如果已经保存，则直接返回，否则 code -1 ，弹出提示信息
 * @returns
 */
export async function beforeBack() {
  const result: any = await request<{}>(`${baseUrl}/tpfreturn`, {
    method: "POST",
  });
  return result;
}
