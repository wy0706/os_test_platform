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
