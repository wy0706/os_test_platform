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
