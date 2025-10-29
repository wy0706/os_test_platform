import { request } from "@umijs/max";

enum BaseApi {
  TESTCOMMAND = "/testcommand", //测试流程
  TESTCONDITION = "/testcondition", //测试条件
  TESTRESULT = "/testresult", //测试结果
  TESTTEMP = "/testtemp", //临时变量
  TESTSEQUENCE = "/testsequence", //测试序列
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
 * 删除命令行 seq_id命令序列编号
 */

export async function deleteCmd(seq_id: any) {
  const result: any = await request<{}>(`${BaseApi.TESTCOMMAND}/delete`, {
    method: "DELETE",
    data: {
      seq_id,
    },
  });
  return result;
}
/**
 *  命令行上移
 * seq_id 当前命令的行号
 * testcommand 测试命令
 */
export async function moveUpCmd(data: any) {
  const result: any = await request<{}>(`${BaseApi.TESTCOMMAND}/moveUp`, {
    method: "POST",
    data: data,
  });
  return result;
}

/**
 * 命令行下移
 * seq_id 当前命令的行号
 * testcommand 测试命令
 */
export async function moveDownCmd(data: any) {
  const result: any = await request<{}>(`${BaseApi.TESTCOMMAND}/moveDown`, {
    method: "POST",
    data: data,
  });
  return result;
}
/**
 * 编辑测试流程
 * seq_id 命令序列编号
 * label 标签
 * active 是否有效，1有效，0无效
 * comment 解释
 */

export async function updateOneCmd(data: any) {
  const result: any = await request<{}>(`${BaseApi.TESTCOMMAND}/edit`, {
    method: "PUT",
    data: data,
  });
  return result;
}
/**
 * 获取命令注释
 * testcommand 测试命令
 */
export async function getCommentOne(testcommand: any) {
  const result: any = await request<{}>(
    `${BaseApi.TESTCOMMAND}/command_comment`,
    {
      method: "GET",
      params: {
        testcommand,
      },
    }
  );
  return result;
}

/**
 * 获取输入参数列表
 * testcommand 测试命令
 */

export async function getInParaList(testcommand: any) {
  const result: any = await request<{}>(`${BaseApi.TESTCOMMAND}/inparaList`, {
    method: "GET",
    params: {
      testcommand,
    },
  });
  return result;
}

/**
 * 获取输出参数列表
 * testcommand 测试命令
 */
export async function getOutParaList(testcommand: any) {
  const result: any = await request<{}>(`${BaseApi.TESTCOMMAND}/outparaList`, {
    method: "GET",
    params: {
      testcommand,
    },
  });
  return result;
}
/**
 * 编辑输入参数
 * seq_id 当前命令的行号
 * testcommand 测试命令
 * inputparams 输入参数：输入参数值或变量，使用字符串逗号隔离表示多个参数
 */
export async function editInPara(data: any) {
  const result: any = await request<{}>(`${BaseApi.TESTCOMMAND}/editinpara`, {
    method: "PUT",
    data: data,
  });
  return result;
}
/**
 *编辑输出参数
 * seq_id 当前命令的行号
 * testcommand 测试命令
 * outputparams 输出参数：输入参数值或变量，使用字符串逗号隔离表示多个参数
 */
export async function editOutPara(data: any) {
  const result: any = await request<{}>(`${BaseApi.TESTCOMMAND}/editoutpara`, {
    method: "PUT",
    data: data,
  });
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
 * 测试条件插入变量
 * condition_id 测试条件编号
 */
export async function createOneCondition(condition_id: any) {
  const result: any = await request<{}>(
    `${BaseApi.TESTCONDITION}/insertvariable`,
    {
      method: "PUT",
      data: {
        condition_id,
      },
    }
  );
  return result;
}

/**
 * 测试条件上移变量
 * condition_id 测试条件编号
 */

export async function moveUpCondition(data: any) {
  const result: any = await request<{}>(`${BaseApi.TESTCONDITION}/moveup`, {
    method: "POST",
    data: data,
  });
  return result;
}

/**
 * 测试条件下移变量
 * condition_id  测试条件编号
 */
export async function moveDownCondition(data: any) {
  const result: any = await request<{}>(`${BaseApi.TESTCONDITION}/moveDown`, {
    method: "POST",
    data: data,
  });
  return result;
}
/**
 * 测试条件删除变量
 * condition_id测试条件编号
 */

export async function deleteConditon(condition_id: any) {
  const result: any = await request<{}>(`${BaseApi.TESTCONDITION}/delete`, {
    method: "DELETE",
    data: {
      condition_id,
    },
  });
  return result;
}

/**
 * 编辑测试条件参数
 * condition_id测试条件编号
 * extension_name 扩展名
 * variable_name 变量名
 * data_type 数据类型
 * edit_type 编辑类型
 * min_value 最小值
 * max_value 最大值
 * default_value 默认值
 * precision 精度
 * array_size 数组大小
 * unit 单位
 * visibility  可见性，true 表示可见，false 表示不可见
 *
 */

export async function updateOneCondition(data: any) {
  const result: any = await request<{}>(`${BaseApi.TESTCONDITION}/editinpar`, {
    method: "PUT",
    data: data,
  });
  return result;
}
/**
 * 编辑枚举参数
 * condition_id测试条件编号
 * enum 枚举字符串
 */
export async function updateOneEnum(data: any) {
  const result: any = await request<{}>(`${BaseApi.TESTCONDITION}/editenum`, {
    method: "PUT",
    data: data,
  });
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
 * 测试结果上移变量
 * result_id 测试结果编号
 */

export async function moveUpResult(data: any) {
  const result: any = await request<{}>(`${BaseApi.TESTRESULT}/moveup`, {
    method: "POST",
    data: data,
  });
  return result;
}

/**
 *  测试结果下移变量
 * result_id 测试结果编号
 */
export async function moveDownResult(data: any) {
  const result: any = await request<{}>(`${BaseApi.TESTRESULT}/moveDown`, {
    method: "POST",
    data: data,
  });
  return result;
}

/**
 * 测试结果插入变量
 *result_id 测试结果编号
 */
export async function createOneResult(result_id: any) {
  const result: any = await request<{}>(
    `${BaseApi.TESTRESULT}/insertvariable`,
    {
      method: "PUT",
      data: {
        result_id,
      },
    }
  );
  return result;
}

/**
 *  测试结果删除变量
 * result_id 测试结果编号
 */

export async function deleteResult(result_id: any) {
  const result: any = await request<{}>(`${BaseApi.TESTRESULT}/delete`, {
    method: "DELETE",
    data: {
      result_id,
    },
  });
  return result;
}
/**
 * 测试结果编辑
 * @param data
 * result_id 测试结果编号
 * extension_name 扩展名
 * variable_name  变量名
 * data_type 数据类型
 *min_lmt_Low 最小值下限
 *min_Def 最小值默认值
 *max_Def 最大值默认值
 * max_lmt_Low 最大值下限
 * min_lmt_Upp 最小值上限
 * max_lmt_Upp  最大值上限
 * precision 精度
 * array_size 数组大小
 * unit 单位
 * visibility   可见性，1 表示可见，0 表示不可见
 * @returns
 */

export async function updateOneResult(data: any) {
  const result: any = await request<{}>(`${BaseApi.TESTRESULT}/editoutpar`, {
    method: "PUT",
    data: data,
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
/**
 * 临时变量上移
 */
export async function moveUpTemp(data: any) {
  const result: any = await request<{}>(`${BaseApi.TESTTEMP}/moveup`, {
    method: "POST",
    data: data,
  });
  return result;
}

/**
 * 临时变量下移
 */
export async function moveDownTemp(data: any) {
  const result: any = await request<{}>(`${BaseApi.TESTTEMP}/moveDown`, {
    method: "POST",
    data: data,
  });
  return result;
}
/**
 * 临时变量插入
 */
export async function createOneTemp(temp_id: any) {
  const result: any = await request<{}>(`${BaseApi.TESTTEMP}/insertvariable`, {
    method: "PUT",
    data: {
      temp_id,
    },
  });
  return result;
}
/**
 * 临时变量删除
 */
export async function deleteTemp(temp_id: any) {
  const result: any = await request<{}>(`${BaseApi.TESTTEMP}/delete`, {
    method: "DELETE",
    data: {
      temp_id,
    },
  });
  return result;
}

/**
 * 编辑临时变量
 * temp_id 临时变量编号
 * extension_name 扩展名
 * variable_name 变量名
 * data_type 数据类型
 * array_size 数组大小
 * unit 单位
 */
export async function updateOneTemp(data: any) {
  const result: any = await request<{}>(`${BaseApi.TESTTEMP}/editinpar`, {
    method: "PUT",
    data: data,
  });
  return result;
}

/**
 * 配置序列错误检查
 */
export async function getErrorCheck() {
  const result: any = await request<{}>(`${BaseApi.TESTSEQUENCE}/errorcheck`, {
    method: "POST",
  });
  return result;
}

/**
 * 保存
 * sequence_name 待保存文件名称
 * TST 三阶段测试，包括pre/uut/post
 * tc_title 关联测试用例标题，发送用例ID和用例名称，是一组数据表现形式：【{id：，title:},{}】
 * tigroup 测试序列类
 */

export async function saveData(data: any) {
  const result: any = await request<{}>(
    `${BaseApi.TESTSEQUENCE}/sequencesave`,
    {
      method: "POST",
      data,
    }
  );
  return result;
}
/**
 *界面中 新建和返回的处理
 */
export async function setNewOrBack() {
  const result: any = await request<{}>(`${BaseApi.TESTSEQUENCE}/new`, {
    method: "POST",
  });
  return result;
}
