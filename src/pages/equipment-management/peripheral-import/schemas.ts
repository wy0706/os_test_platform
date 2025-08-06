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
