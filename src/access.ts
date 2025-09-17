/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(
  initialState: { currentUser?: API.CurrentUser } | undefined
) {
  const { currentUser } = initialState ?? {};

  console.log("currentUser", currentUser);

  const tmp: any = { resourceList: [], ...currentUser };
  console.log("access", tmp);

  const access: any = {};
  if (tmp.resourceList) {
    tmp.resourceList.map((item: any) => {
      access[item.resourceCode] = true;
    });
  }
  return access;
}
