/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(
  initialState: { currentUser?: API.CurrentUser } | undefined,
) {
  const { currentUser } = initialState ?? {};
  const tmp: any = { resourceList: [], ...currentUser };
  const access: any = {};
  if(tmp.resourceList){
    tmp.resourceList.map((item: any) => {
      access[item.resourceCode] = true;
    });
  }
  return access;
  // return {
  //   canAdmin: currentUser && currentUser.access === 'admin',
  // };
}
