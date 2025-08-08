import { ProColumns } from "@ant-design/pro-components";

// 设备配置接口
export interface DeviceConfig {
  id?: string;
  deviceType: string;
  deviceModel: string;
  interface: string;
  parameterConfig: string;
  isValid: boolean;
}

// 通道配置接口
export interface ChannelConfig {
  id?: string;
  deviceModel: string;
  channelNumber: string;
  assignedSerialNumber: string;
}

// 页面标题
export const schemasTitle = "外设导入";

// 设备配置表格列定义
export const deviceColumns: ProColumns<DeviceConfig>[] = [
  {
    title: "设备种类",
    dataIndex: "deviceType",
    key: "deviceType",
    width: 150,
    ellipsis: true,
    formItemProps: {
      rules: [{ required: true, message: "请输入设备种类" }],
    },
  },
  {
    title: "设备型号",
    dataIndex: "deviceModel",
    key: "deviceModel",
    width: 150,
    ellipsis: true,
    formItemProps: {
      rules: [{ required: true, message: "请输入设备型号" }],
    },
  },
  {
    title: "接口",
    dataIndex: "interface",
    key: "interface",
    width: 120,
    ellipsis: true,
    formItemProps: {
      rules: [{ required: true, message: "请输入接口信息" }],
    },
  },
  {
    title: "参数配置",
    dataIndex: "parameterConfig",
    key: "parameterConfig",
    width: 200,
    ellipsis: true,
    formItemProps: {
      rules: [{ required: true, message: "请输入参数配置" }],
    },
  },
  {
    title: "是否有效",
    dataIndex: "isValid",
    key: "isValid",
    width: 100,
    valueType: "select",
    valueEnum: {
      true: { text: "是", status: "Success" },
      false: { text: "否", status: "Error" },
    },
    formItemProps: {
      rules: [{ required: true, message: "请选择是否有效" }],
    },
  },
];

// 通道配置表格列定义
export const channelColumns: ProColumns<ChannelConfig>[] = [
  {
    title: "设备型号",
    dataIndex: "deviceModel",
    key: "deviceModel",
    width: 150,
    ellipsis: true,
    formItemProps: {
      rules: [{ required: true, message: "请输入设备型号" }],
    },
  },
  {
    title: "通道号",
    dataIndex: "channelNumber",
    key: "channelNumber",
    width: 120,
    ellipsis: true,
    formItemProps: {
      rules: [{ required: true, message: "请输入通道号" }],
    },
  },
  {
    title: "指定序号",
    dataIndex: "assignedSerialNumber",
    key: "assignedSerialNumber",
    width: 120,
    ellipsis: true,
    formItemProps: {
      rules: [{ required: true, message: "请输入指定序号" }],
    },
  },
];

// 设备配置表单schema
export const deviceFormSchema = [
  {
    title: "设备种类",
    dataIndex: "deviceType",
    formItemProps: {
      rules: [{ required: true, message: "请输入设备种类" }],
    },
  },
  {
    title: "设备型号",
    dataIndex: "deviceModel",
    formItemProps: {
      rules: [{ required: true, message: "请输入设备型号" }],
    },
  },
  {
    title: "接口",
    dataIndex: "interface",
    formItemProps: {
      rules: [{ required: true, message: "请输入接口信息" }],
    },
  },
  {
    title: "参数配置",
    dataIndex: "parameterConfig",
    formItemProps: {
      rules: [{ required: true, message: "请输入参数配置" }],
    },
  },
  {
    title: "是否有效",
    dataIndex: "isValid",
    valueType: "select",
    valueEnum: {
      true: { text: "是", status: "Success" },
      false: { text: "否", status: "Error" },
    },
    formItemProps: {
      rules: [{ required: true, message: "请选择是否有效" }],
    },
  },
];

// 通道配置表单schema
export const channelFormSchema = [
  {
    title: "设备型号",
    dataIndex: "deviceModel",
    formItemProps: {
      rules: [{ required: true, message: "请输入设备型号" }],
    },
  },
  {
    title: "通道号",
    dataIndex: "channelNumber",
    formItemProps: {
      rules: [{ required: true, message: "请输入通道号" }],
    },
  },
  {
    title: "指定序号",
    dataIndex: "assignedSerialNumber",
    formItemProps: {
      rules: [{ required: true, message: "请输入指定序号" }],
    },
  },
];

// 端口
// 波特率
export const rateOption = [
  { value: "115200", label: "115200" },
  { value: "128000", label: "128000" },
  { value: "230400", label: "230400" },
  { value: "25600", label: "25600" },
  { value: "460800", label: "460800" },
  { value: "500000", label: "500000" },
  { value: "512000", label: "512000" },
  { value: "600000", label: "600000" },
];
// 数据位
export const dataBitsOption = [
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "7", label: "7" },
  { value: "8", label: "8" },
];

// 停止位
export const stopBitsOption = [
  { value: "1", label: "1" },
  { value: "1.5", label: "1.5" },
  { value: "2", label: "2" },
];

// 奇偶校验
export const parityOption = [
  { value: "None", label: "None" },
  { value: "Odd", label: "Odd" },
  { value: "Even", label: "Even" },
  { value: "Mark", label: "Mark" },
  { value: "Space", label: "Space" },
];

//CAN  仲裁波特率
export const arbitrationOption = [
  {
    value: "1.0",
    label: "1.0 Kbps",
  },
  {
    value: "800",
    label: "800 Kbps",
  },
  {
    value: "666",
    label: "666 Kbps",
  },
  {
    value: "500",
    label: "500 Kbps",
  },
  {
    value: "400",
    label: "400 Kbps",
  },
  {
    value: "300",
    label: "300 Kbps",
  },
  {
    value: "250",
    label: "250 Kbps",
  },
  {
    value: "200",
    label: "200 Kbps",
  },
  {
    value: "150",
    label: "150 Kbps",
  },
  {
    value: "125",
    label: "125 Kbps",
  },
  {
    value: "100",
    label: "100 Kbps",
  },
  {
    value: "83",
    label: "83 Kbps",
  },
  {
    value: "50",
    label: "50 Kbps",
  },
  {
    value: "33",
    label: "33 Kbps",
  },
  {
    value: "20",
    label: "20 Kbps",
  },
  {
    value: "10",
    label: "10 Kbps",
  },
];
//CAN  数据域波特率

export const domainOption = [
  {
    value: "10.0",
    label: "10.0 Kbps",
  },
  {
    value: "8.0",
    label: "8.0 Kbps",
  },
  {
    value: "6.7",
    label: "6.7 Kbps",
  },
  {
    value: "4.0",
    label: "4.0 Kbps",
  },
  {
    value: "3.0",
    label: "3.0 Kbps",
  },
  {
    value: "2.0",
    label: "2.0 Kbps",
  },
  {
    value: "1.5",
    label: "1.5 Kbps",
  },
  {
    value: "1.0",
    label: "1.0 Kbps",
  },
  {
    value: "800",
    label: "800 Kbps",
  },
  {
    value: "666",
    label: "666 Kbps",
  },
  {
    value: "500",
    label: "500 Kbps",
  },
  {
    value: "400",
    label: "400 Kbps",
  },
  {
    value: "300",
    label: "300 Kbps",
  },
  {
    value: "250",
    label: "250 Kbps",
  },
  {
    value: "200",
    label: "200 Kbps",
  },
  {
    value: "150",
    label: "150 Kbps",
  },
  {
    value: "125",
    label: "125 Kbps",
  },
  {
    value: "100",
    label: "100 Kbps",
  },
  {
    value: "50",
    label: "50 Kbps",
  },
  {
    value: "20",
    label: "20 Kbps",
  },
  {
    value: "10",
    label: "10 Kbps",
  },
];

export const COMOptions = Array.from({ length: 30 }, (_, i) => `COM${i + 1}`);
export const linRateOption = [
  {
    value: "38400",
    label: "38400",
  },
  {
    value: "19200",
    label: "19200",
  },
  {
    value: "14400",
    label: "14400",
  },
  {
    value: "9600",
    label: "9600",
  },
  {
    value: "4800",
    label: "4800",
  },
  {
    value: "2400",
    label: "2400",
  },
];
export const spaceOptions = Array.from({ length: 17 }, (_, i) => {
  const num = i + 10;
  return {
    label: String(num),
    value: num,
  };
});
