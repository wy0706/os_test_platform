import isBooleanFn from "is-boolean-object";

export const isNumber = (value: any): value is number =>
  typeof value === "number";
export const isString = (value: any): value is string =>
  typeof value === "string";
export const isArray = (value: any): value is any[] => Array.isArray(value);
export const isUndefined = (value: any): value is undefined =>
  typeof value === "undefined";
export const isFunction = (value: any): value is Function =>
  typeof value === "function";
export const isBoolean = (value: any): value is Boolean => isBooleanFn(value);
export const isNull = (value: any): value is null =>
  Object.prototype.toString.call(value) === "[object Null]";
export function uniqueBySet(source: any[]) {
  return Array.from(new Set(source));
}
// 获取到角色后转换成符合的格式
export const transformRolePermissions = (
  rolePermissions: Record<string | number, string[]>
) => {
  return Object.fromEntries(
    Object.entries(rolePermissions).map(([role, perms]) => {
      const obj: Record<string, string> = {};
      perms.forEach((p) => {
        const [key, value] = p.split("-");
        obj[key] = value;
      });
      return [role, obj];
    })
  );
};
/**
 * 将形如 ["key-value", ...] 的数组转成 {key: value} 对象
 * @param {Array<string>} arr - 需要转换的数组
 * @param {string} separator - 分隔符，默认 '-'
 * @returns {Object} 转换后的对象
 */
export function arrayToObject(arr: any[], separator = "-") {
  // 不是数组直接返回空对象
  if (!isArray(arr)) {
    console.warn("参数必须是数组");
    return {};
  }
  return arr.reduce((acc, cur) => {
    // 只处理字符串
    if (typeof cur === "string") {
      const parts = cur.split(separator);
      // 确保有 key 和 value
      if (parts.length >= 2) {
        const [key, value] = parts;
        acc[key] = value;
      }
    }
    return acc;
  }, {});
}

/**
 * 给指定 level 的 key 添加前缀
 * @param {Array} data - 原始树形数据
 * @param {number} targetLevel - 要添加前缀的层级
 * @param {string} prefix - 要添加的前缀
 * @returns {Array} 新的树形数据
 */
export function addPrefixToLevelKey(data: any, targetLevel: any, prefix: any) {
  return data.map((item: any) => {
    // 递归处理子节点
    if (item.children) {
      item.children = addPrefixToLevelKey(item.children, targetLevel, prefix);
    }

    // 判断是否是目标层级
    if (item.level === targetLevel) {
      item.key = `${prefix}${item.key}`;
    }

    return item;
  });
}
export function isEmptyObject(obj: any) {
  return !obj || Object.keys(obj).length === 0;
}
