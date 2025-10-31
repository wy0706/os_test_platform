import { FileTextOutlined, FolderOutlined } from "@ant-design/icons";
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
export const editTypeData: any = {
  0: "EditBox",
  1: "ComboList",
};
//  0:Float 1:int 2:bytes 10:Float[] 11:int[] 12:bytearray 43:str
export const dataTypeData: any = {
  0: "Float",
  1: "int",
  2: "bytes",
  10: "Float[]",
  11: "int[]",
  12: "bytearray",
  43: "str",
};

/**
 * 构建命令树数据
 * @param data 后端返回的命令分组数据
 * @returns 标准化的树结构 [{ title, key, children, disabled, ... }]
 */
export const buildCommandTreeData = (data: any[]): any[] => {
  if (!Array.isArray(data) || data.length === 0) return [];

  try {
    const transformed = data
      .map((group) => {
        const { id, name, command_list } = group || {};
        if (!name) return null; // 没有 name 的直接跳过

        // 生成子节点（命令项）
        const children = Array.isArray(command_list)
          ? command_list
              .filter((cmd) => cmd && cmd.command_name)
              .map((cmd) => ({
                title: cmd.command_name,
                key: cmd.command_name, // ✅ 使用命令名称作为唯一 key（名称唯一）
                id: cmd.command_id,
                icon: <FileTextOutlined />,
                ...cmd,
                level: 2,
                disabled: false, // 子节点可选
                selectable: true,
              }))
          : [];

        return {
          title: name,
          id,
          key: name, // ✅ 使用分组名称作为唯一 key
          icon: <FolderOutlined />,
          children,
          level: 1,
          disabled: true, // ✅ 父级禁用
          selectable: false, // ✅ 不可选
        };
      })
      .filter(Boolean);

    return transformed;
  } catch (error) {
    console.error("❌ buildCommandTreeData 转换失败:", error);
    return [];
  }
};

// 判断是否需要启用数组大小字段
export const shouldEnableArraySize = (dataType: number) => {
  return [10, 11, 12].includes(Number(dataType));
};
export const valueIsExist = (value: any) => {
  return value !== null && value !== undefined && value !== "";
};

export const toNum = (v: any): number | undefined =>
  v === null || v === undefined || v === "" ? undefined : Number(v);
export const parseArrayString = (arrayString: string) => {
  if (arrayString === undefined || arrayString === null) return [];

  const str = String(arrayString).trim();
  if (!str) return [];

  // 如果是 JSON 数组格式（例如 "[0,0,0,0]"）
  if (str.startsWith("[") && str.endsWith("]")) {
    try {
      const arr = JSON.parse(str);
      if (Array.isArray(arr)) {
        return arr.map((item) => String(item).trim());
      }
    } catch (e) {
      // 解析失败则继续往下走
    }
  }

  // 普通逗号分隔形式
  if (str.includes(",")) {
    return str
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  // 单个值
  return [str];
};
// 生成数组列的数据对象
export const generateArrayColumns = (values: string[], arraySize: number) => {
  const columns: any = {};
  for (let i = 0; i < arraySize; i++) {
    columns[`col${i}`] = values[i] || "";
  }
  return columns;
};

/**
 * 从数组对象中过滤字段
 * @param arr 源数组
 * @param keys 要操作的字段数组
 * @param mode 模式："pick" 保留指定字段；"omit" 去除指定字段（默认）
 * @returns 新数组
 */
export function filterFieldsFromArray<T extends Record<string, any>>(
  arr: T[],
  keys: (keyof T)[],
  mode: "pick" | "omit" = "omit"
): Partial<T>[] {
  if (!Array.isArray(arr)) return [];

  return arr.map((item) => {
    if (mode === "pick") {
      // 只保留指定字段
      const picked: Partial<T> = {};
      keys.forEach((key) => {
        if (key in item) picked[key] = item[key];
      });
      return picked;
    } else {
      // 去除指定字段
      const cloned: Partial<T> = { ...item };
      keys.forEach((key) => {
        if (key in cloned) delete cloned[key];
      });
      return cloned;
    }
  });
}
