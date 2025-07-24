import { AvatarDropdown, AvatarName, Footer } from "@/components";
import type { Settings as LayoutSettings } from "@ant-design/pro-components";
import { SettingDrawer } from "@ant-design/pro-components";
import "@ant-design/v5-patch-for-react-19";
import type { RequestConfig, RunTimeLayoutConfig } from "@umijs/max";
import { history } from "@umijs/max";
import defaultSettings from "../config/defaultSettings";
import { errorConfig } from "./requestErrorConfig";

const isDev = process.env.NODE_ENV === "development";
const loginPath = "/user/login";

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      // const msg = await queryCurrentUser({
      //   skipErrorHandler: true,
      // });
      const currentUser: any = {
        name: "admin",
        avatar:
          "https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png",
        resourceList: [
          { resourceCode: "equipmentManagement" },
          { resourceCode: "caseManagement" },
          { resourceCode: "systemManagement" },
          { resourceCode: "toolManagement" },
          { resourceCode: "taskManagement" },
          { resourceCode: "testExecution-edit" },
          { resourceCode: "testReport-edit" },
          { resourceCode: "testRequirement-edit" },
          { resourceCode: "testTask-edit" },
          { resourceCode: "testExecutionResult-edit" },
          { resourceCode: "equipmentLibrary-edit" },
          { resourceCode: "caseLibrary-edit" },
          { resourceCode: "userManagement-edit" },
          { resourceCode: "ideTool-edit" },
          { resourceCode: "testSequenceIntegration-edit" },
          { resourceCode: "testCase-edit" },
          { resourceCode: "operationLog-edit" },
          { resourceCode: "roleManagement-edit" },
          { resourceCode: "testSequence-edit" },
          { resourceCode: "loginLog-edit" },
          { resourceCode: "deployTool-edit" },
          { resourceCode: "permissionManagement-edit" },
        ],
      };
      // console.log(msg.data);
      return currentUser;
      // return msg.data;
    } catch (_error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  const { location } = history;
  if (
    ![loginPath, "/user/register", "/user/register-result"].includes(
      location.pathname
    )
  ) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout 运行时配置
export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  // 忽略特定 React warning（如 findDOMNode）
  if (isDev) {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("Warning: findDOMNode is deprecated")
      ) {
        return; // 忽略这个 warning
      }
      originalWarn(...args);
    };
  }

  return {
    // actionsRender: () => [
    //   <Question key="doc" />,
    //   <SelectLang key="SelectLang" />,
    // ],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown menu={true}>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      content: "nevc",
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    bgLayoutImgList: [
      {
        src: "https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr",
        left: 85,
        bottom: 100,
        height: "303px",
      },
      {
        src: "https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr",
        bottom: -68,
        right: -45,
        height: "303px",
      },
      {
        src: "https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr",
        bottom: 0,
        left: 0,
        width: "331px",
      },
    ],
    // links: isDev
    //   ? [
    //       <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
    //         <LinkOutlined />
    //         <span>OpenAPI 文档</span>
    //       </Link>,
    //     ]
    //   : [],
    menuHeaderRender: undefined,
    itemRender: (route) => <span>{route.breadcrumbName}</span>,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request: RequestConfig = {
  baseURL: "http://127.0.0.1:8000",
  ...errorConfig,
};
