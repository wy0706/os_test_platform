export const schemasTitle: any = {
  label: "序列编辑",
  value: "testSequenceEdit",
};

export const schemasColumns: any = [
  {
    title: "名称",
    dataIndex: "title",
    ellipsis: true,
    sorter: true,
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    ellipsis: true,
    sorter: true,
  },
];

export const schemasForm: any = {
  layoutType: "Form",
  rowProps: {
    gutter: [16, 16],
  },
  colProps: {
    span: 12,
  },
  grid: true,
  columns: [
    {
      title: "名称",
      dataIndex: "title",
      formItemProps: {
        rules: [
          {
            required: true,
            message: "此项为必填项",
          },
        ],
      },
    },

    {
      title: "创建时间",
      dataIndex: "createTime",
      formItemProps: {
        rules: [
          {
            required: true,
            message: "此项为必填项",
          },
        ],
      },
    },
  ],
};

export const schemasDescriptions: any = [
  {
    title: "名称",
    key: "title",
    dataIndex: "title",
    copyable: true,
    ellipsis: true,
  },
  {
    title: "创建时间",
    key: "createTime",
    dataIndex: "createTime",
    copyable: true,
    ellipsis: true,
  },
];

// 模拟 测试流程数据
export const mockProcessData = [
  {
    id: 1,
    configType: "配置",
    status: "error",
    command: "ReadESR_Acw",
    inputParams: "sendcom_0",
    outputParams: "sendstring",
    description: "设置ESR 232字符串终止符",
    tag: "COM",
  },
  {
    id: 2,
    configType: "配置",
    command: "ReadESR_Irl",
    inputParams: "1,sendcom",
    status: "success",
    outputParams: "readstring",
    tag: "1",
    description: "写入ESR 232字符串格式",
  },
  {
    id: 3,
    configType: "配置",
    tag: "",
    command: "ReadESR_232_ResponseStringData",
    inputParams: "1,10000",
    status: "success",
    outputParams: "readstring",
    description: "读取ESR 232响应字符串数据",
  },
  {
    id: 4,
    configType: "配置",
    command: "ReadESR_Data",
    inputParams: "ESR_Acw_Index, ESR_Test_Items",
    status: "error",
    outputParams: "ESR_Acw_I",
    tag: "",
    description: "设置ESR ACW测试",
  },
  {
    id: 5,
    configType: "读取",
    command: "SetESR_Acw",
    inputParams: "Index, Count",
    status: "success",
    outputParams: "Data[]",
    tag: "",
    description: "读取ESR数据",
  },
];
export const mockTreeData = [
  {
    title: "testCommand",
    key: "testCommand",

    children: [
      {
        title: "AC_SOURCE",
        key: "AC_SOURCE",

        children: [
          {
            title: "ReadESR_232_ResponseStringData",
            key: "ReadESR_232_ResponseStringData",
          },
        ],
      },

      {
        title: "RS232 Device",

        key: "RS232_Device",

        children: [
          {
            title: "ReadESR_Acw",
            key: "ReadESR_Acw",
          },
          {
            title: "ReadESR_Data",
            key: "ReadESR_Data",
          },
          {
            title: "ReadESR_Go",
            key: "ReadESR_Go",
          },
          {
            title: "ReadESR_Col",
            key: "ReadESR_Col",
          },
          {
            title: "ReadESR_Ir",
            key: "ReadESR_Ir",
          },
          {
            title: "ReadESR_Irl",
            key: "ReadESR_Irl",
          },
          {
            title: "ReadESR_StepResult",
            key: "ReadESR_StepResult",
          },
          {
            title: "ReadESR_TestResult",
            key: "ReadESR_TestResult",
          },
          {
            title: "ReadESR_TestState",
            key: "ReadESR_TestState",
          },
          {
            title: "SetESR_Acw",
            key: "SetESR_Acw",
          },
          {
            title: "SetESR_ACVTestData",
            key: "SetESR_ACVTestData",
          },
          {
            title: "SetESR_Data",
            key: "SetESR_Data",
          },
          {
            title: "SetESR_Dec",
            key: "SetESR_Dec",
          },
        ],
      },
      {
        title: "FSK",
        key: "FSK",
        children: [
          {
            title: "ReadESR_Acw111",
            key: "ReadESR_Acw111",
          },
        ],
      },
    ],
  },
];
//测试条件数据
export const mockConditionsData = [
  {
    id: 1,
    key: 1,
    extensionName: "输入电压",
    variableName: "供电典型值",
    dataType: "Float",
    editType: "EditBox",
    minValue: 0.0,
    maxValue: 20000.0,
    defaultValue: 5.0,
    precision: 0.2,
    project: "",
    arraySize: 1,
    unit: "V",
    visible: "error",
  },
  {
    id: 2,
    key: 2,
    extensionName: "CAN报文",
    variableName: "CAN_MSG",
    dataType: "bytearray",
    editType: "EditBox",
    minValue: "0, 0, 0, 0, ff, ff, ff, ff",
    maxValue: "0, 5, 0, 5, 0, 0, 0, 0",
    defaultValue: "0, 5, 0, 5, 0, 0, 0, 0",
    precision: 0.2,
    project: "",
    arraySize: 6,
    unit: "",
    visible: "success",
  },
  {
    id: 3,
    key: 3,
    extensionName: "CAN通道使能",
    variableName: "CAN通道",
    dataType: "int[]",
    editType: "EditBox",
    minValue: "0, 0",
    maxValue: "1, 1",
    defaultValue: "1, 1",
    precision: 0.2,
    project: "",
    arraySize: 2,
    unit: "",
    visible: "success",
  },
  {
    id: 4,
    key: 4,
    extensionName: "设置电子负载",
    variableName: "",
    dataType: "int",
    editType: "EditBox",
    minValue: 1,
    maxValue: 4,
    defaultValue: 3,
    precision: 0.2,
    project: "aa=1,ff=2,cc=3,dd=4",
    arraySize: 1,
    unit: "V/A/W",
    visible: "error",
  },
  {
    id: 5,
    key: 6,
    extensionName: "设置电子负载",
    variableName: "",
    dataType: "int[]",
    editType: "ComboList",
    minValue: 0.0,
    maxValue: 20000.0,
    defaultValue: 10000.0,
    precision: 0.2,
    project: "aa=1,ff=2,cc=3,dd=4",
    arraySize: 1,
    unit: "V/A/W",
    visible: "error",
  },
];
// 测试结束
export const mockResultTable = [
  {
    id: 1,
    extensionName: "",
    variableName: "CAN4发送命令",
    dataType: "Float",
    editType: "EditBox",
    minOffValue: "0, 0, 0, 0, ff, ff, ff, ff",
    minHighValue: "0, 5, 0, 5, 0, 0, 0, 0",
    minDefaultValue: "0, 5, 0, 5, 0, 0, 0, 0",
    maxOffValue: "0, 0, 0, 0, ff, ff, ff, ff",
    maxHighValue: "0, 5, 0, 5, 0, 0, 0, 0",
    maxDefaultValue: "0, 5, 0, 5, 0, 0, 0, 0",
    precision: 0.2,
    arraySize: 1,
    unit: "V",
    visible: "error",
  },
  {
    id: 2,
    extensionName: "",
    variableName: "CAN4命令相应",
    dataType: "bytearray",
    editType: "EditBox",

    minOffValue: "0, 0, 0, 0, ff, ff, ff, ff",
    minHighValue: "0, 5, 0, 5, 0, 0, 0, 0",
    minDefaultValue: "0, 5, 0, 5, 0, 0, 0, 0",
    maxOffValue: "0, 0, 0, 0, ff, ff, ff, ff",
    maxHighValue: "0, 5, 0, 5, 0, 0, 0, 0",
    maxDefaultValue: "0, 5, 0, 5, 0, 0, 0, 0",

    precision: 0.2,
    arraySize: 6,
    unit: "",
    visible: "success",
  },
  {
    id: 3,
    extensionName: "",
    variableName: "接收成功标志",
    dataType: "int[]",
    editType: "EditBox",
    minOffValue: "1, 3",
    minHighValue: "2,3",
    minDefaultValue: "1,3",
    maxOffValue: "3,5",
    maxHighValue: "20000,67",
    maxDefaultValue: "10000,34",
    defaultValue: "1, 1",
    precision: 0.2,
    arraySize: 2,
    unit: "",
    visible: "success",
  },
  {
    id: 4,
    extensionName: "",
    variableName: "电子负载电波",
    dataType: "Float",
    editType: "EditBox",
    minOffValue: 0.0,
    minHighValue: 0.0,
    minDefaultValue: "0",
    maxOffValue: 0.0,
    maxHighValue: 20000.0,
    maxDefaultValue: 10000.0,
    precision: 0.2,
    arraySize: 1,
    unit: "V/A/W",
    visible: "error",
  },
];
// 临时变量
export const mockTempTable = [
  {
    id: 1,
    extensionName: "",
    variableName: "flag",
    dataType: "Float",
    arraySize: 1,
    unit: "V",
    visible: "error",
  },
  {
    id: 2,
    extensionName: "",
    variableName: "上拉电阻临时变量",
    dataType: "bytearray",
    arraySize: 6,
    unit: "",
    visible: "success",
  },
];
