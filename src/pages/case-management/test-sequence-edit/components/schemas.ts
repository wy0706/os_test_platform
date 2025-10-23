export const schemas = {
  layoutType: "Form",
  rowProps: {
    gutter: [16, 16],
  },
  colProps: {
    span: 12,
  },
  grid: true,
};
// 数据类型
export const dataTypeOptions = [
  { value: 0, label: "Float" },
  { value: 1, label: "int" },
  { value: 2, label: "bytes" },
  {
    value: 10,
    label: "Float[]",
  },
  {
    value: 11,
    label: "int[]",
  },
  // {
  //   value: "bytearray",
  //   label: "bytearray",
  // },
  {
    value: 12,
    label: "bytearray",
  },
  { value: 43, label: "str" },
  // { value: "LineInVector", label: "LineInVector" },
  // {
  //   value: "LoadVector",
  //   label: "LoadVector",
  // },
];
// 精度
export const precisionOptions = [
  { value: 1, label: 1 },
  { value: 2, label: 2 },
  { value: 3, label: 3 },
  { value: 4, label: 4 },
  { value: 5, label: 5 },
  { value: 6, label: 6 },
];
// 可见
export const visibleOptions = [
  { value: "success", label: "✓" },
  { value: "error", label: "✗" },
];
// 单位
export const unitOptions = [
  { value: "mV", label: "mV" },
  { value: "V", label: "V" },
  { value: "kV", label: "kV" },
  { value: "mA", label: "mA" },
  { value: "A", label: "A" },
  { value: "mW", label: "mW" },
  { value: "W", label: "W" },
  { value: "kW", label: "kW" },
  { value: "mΩ", label: "mΩ" },
  { value: "Ω", label: "Ω" },
  { value: "kΩ", label: "kΩ" },
  { value: "MΩ", label: "MΩ" },
  { value: "Hz", label: "Hz" },
  { value: "kHz", label: "kHz" },
  { value: "MHz", label: "MHz" },
  { value: "ms", label: "ms" },
  { value: "s", label: "s" },
  { value: "V/A/W/", label: "V/A/W/" },
  { value: "%", label: "%" },
  { value: "℃", label: "℃" },
  { value: "r/min", label: "r/min" },
];

export const parseOptionString = (optionStr: string) => {
  if (!optionStr) return [];
  return optionStr.split(",").map((item) => {
    const [label, value] = item.split("=");
    return { label: label?.trim(), value: value?.trim() };
  });
};
