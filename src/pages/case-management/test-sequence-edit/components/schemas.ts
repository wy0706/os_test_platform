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

// 仅支持三种格式：[{a:1},{b:2}] / [["a",1],["b","2"]] / [{key:"a",value:1}]
export const formatEnum = (raw: unknown): string => {
  if (!Array.isArray(raw) || raw.length === 0) return "-";

  const pairs: Array<[string, unknown]> = [];

  for (const it of raw as unknown[]) {
    if (Array.isArray(it)) {
      if (it.length >= 2) {
        const k = String(it[0]);
        if (k) pairs.push([k, (it as any[])[1]]);
      }
      continue;
    }

    if (it && typeof it === "object") {
      const obj = it as Record<string, unknown>;
      if ("key" in obj && "value" in obj) {
        const k = String((obj as any).key ?? "");
        if (k) pairs.push([k, (obj as any).value]);
      } else {
        const k = Object.keys(obj)[0];
        if (k) pairs.push([String(k), obj[k]]);
      }
      continue;
    }

    // 其它形态忽略
  }

  if (pairs.length === 0) return "-";
  return pairs.map(([k, v]) => `${k}=${v as any}`).join(", ");
};
const isNumeric = (v: any) => /^-?\d+(\.\d+)?$/.test(String(v).trim());
// 仅支持三种数组格式 → [{label, value}]
export const enumToOptions = (
  raw: unknown
): Array<{ label: string; value: any }> => {
  if (!Array.isArray(raw)) return [];
  const opts: Array<{ label: string; value: any }> = [];
  for (const it of raw as unknown[]) {
    if (Array.isArray(it) && it.length >= 2) {
      const label = String(it[0]);
      const vStr = String((it as any[])[1]);
      const value = isNumeric(vStr) ? Number(vStr) : (it as any[])[1];
      if (label) opts.push({ label, value });
      continue;
    }
    if (it && typeof it === "object") {
      const obj = it as Record<string, any>;
      if ("key" in obj && "value" in obj) {
        const label = String(obj.key ?? "");
        const vStr = String(obj.value);
        const value = isNumeric(vStr) ? Number(vStr) : obj.value;
        if (label) opts.push({ label, value });
      } else {
        const k = Object.keys(obj)[0];
        if (k) {
          const label = String(k);
          const vStr = String(obj[k]);
          const value = isNumeric(vStr) ? Number(vStr) : obj[k];
          opts.push({ label, value });
        }
      }
      continue;
    }
  }
  return opts;
};
