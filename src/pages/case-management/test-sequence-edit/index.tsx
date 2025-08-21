import React, { useEffect } from "react";

import { getList } from "@/services/task-management/test-requirement.service";
import {
  BarsOutlined,
  BookOutlined,
  CloseCircleOutlined,
  FileAddOutlined,
  FunctionOutlined,
  NodeIndexOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { history, useParams, useSearchParams } from "@umijs/max";
import { useSetState } from "ahooks";
import { Button, Card, message, Modal, Space, Tabs } from "antd";
import PromptModal from "../components/promptModal";
import RunModal from "../components/runModal";
import AddModal from "../test-sequence/components/addModal";
import Conditions from "./components/conditions";
import Process from "./components/process";
import ResultPage from "./components/result";
import TemporaryVariables from "./components/temporaryVariables";
import "./index.less";
import {
  mockConditionsData,
  mockProcessData,
  mockResultTable,
  mockTempTable,
} from "./schemas";

const Page: React.FC = () => {
  const [state, setState] = useSetState<any>({
    title: "",
    tabActiveKey: "1",
    isPromptModalOpen: false, //
    isRunModalOpen: false, //
    tabItems: [
      {
        key: "1",
        label: "测试流程",
        icon: <NodeIndexOutlined />,
      },
      {
        key: "2",
        label: "测试条件",
        icon: <BarsOutlined />,
      },
      {
        key: "3",
        label: "测试结束", //测试结果
        icon: <BookOutlined />,
      },
      {
        key: "4",
        label: "临时变量",
        icon: <FunctionOutlined />,
      },
    ],

    tabData: {
      tab1: [],
      tab2: [],
      tab3: [],
      tab4: [],
    }, // 判断tab数据是否已经请求过数据
    loaded: {
      tab1: false,
      tab2: false,
      tab3: false,
      tab4: false,
    },
    selectedRowKeys: {
      tab1: -1,
      tab2: -1,
      tab3: -1,
      tab4: -1,
    },
    selectTreeData: [],
    selectedCommand: "",
    isDirty: false,
    isRelease: false, //是否为已发布
    promptModalType: "save", //save saveAs
    autoId: null,
    isSaveAsModalOpen: false, //另存为
    addModalType: "",
  });
  const {
    title,
    tabActiveKey,
    tabItems,
    isPromptModalOpen,
    isRunModalOpen,
    isDirty,
    tabData,
    selectedRowKeys,
    loaded,
    selectedCommand,
    isRelease,
    promptModalType,
    autoId,
    isSaveAsModalOpen,
    addModalType,
  } = state;
  const tabDataMap: Record<string, any> = {
    tab1: mockProcessData,
    tab2: mockConditionsData,
    tab3: mockResultTable,
    tab4: mockTempTable,
  };
  const params = useParams();
  const [searchParams] = useSearchParams();
  // 初始化：只加载 tab1
  useEffect(() => {
    if (params.id !== "add") {
      handleTabChange("1");
    }
    let release =
      params.id === "add"
        ? false
        : searchParams.get("status") === "success"
        ? true
        : false;

    setState({
      title: params.id === "add" ? "" : searchParams.get("name") || "",
      isRelease: release,
      autoId: params.id,
    });
  }, [params.id]);

  const handleTabChange = async (key: string) => {
    setState({ tabActiveKey: key });

    if (params.id !== "add" && !state.loaded[`tab${key}`]) {
      try {
        // 假设 getList 接口可以根据 key 获取不同数据
        await getList({ tab: key });
        setState((prev) => ({
          tabData: {
            ...prev.tabData,
            [`tab${key}`]: tabDataMap[`tab${key}`] || [],
          },
          loaded: { ...prev.loaded, [`tab${key}`]: true },
          selectedRowKeys: {
            ...prev.selectedRowKeys,
            [`tab${key}`]: tabDataMap[`tab${key}`]?.length ? 0 : -1, // 默认选第一条
          },
        }));
      } catch (e) {
        setState((prev) => ({
          tabData: {
            ...prev.tabData,
            [`tab${key}`]: tabDataMap[`tab${key}`] || [],
          },
          loaded: { ...prev.loaded, [`tab${key}`]: true },
          selectedRowKeys: {
            ...prev.selectedRowKeys,
            [`tab${key}`]: tabDataMap[`tab${key}`]?.length ? 0 : -1, // 默认选第一条
          },
        }));
      }
    }
  };
  const goList = () => {
    history.push("/case-management/test-sequence");
  };
  const handleGoBack = () => {
    if (isRelease) {
      goList();
      return;
    }
    const hasData = hasNonEmptyTab(tabData);
    const showPrompt = (type: "add" | "edit") => {
      setState({
        promptModalType: type,
        isPromptModalOpen: true,
      });
    };

    if (autoId == "add") {
      // 新增页面
      hasData ? showPrompt("add") : goList();
    } else {
      // 编辑页面
      isDirty ? showPrompt("edit") : goList();
    }
  };

  const handleErrorCheck = () => {
    // 如果均检查正确
    // Modal.info({
    //   title: "流程完整性检查！",
    //   content: "所有有效参数均设置正确！",
    // okText: "确定",
    // });
    // 如果检查有误，展示错误信息
    Modal.error({
      title: "以下参数设置错误，请重新设置",
      content: (
        <div>
          0)测试流程表:第2行,第1个输入参数未设置1)测试条件表:2)测试结果表:3)临时变量表:
        </div>
      ),
      okText: "确定",
    });
  };
  const goAdd = () => {
    history.push("/case-management/test-sequence-edit/add");
    window.location.reload();
  };
  const handleAdd1 = () => {
    if (isRelease) {
      goAdd();
      return;
    } else {
      // 已修改
      if (isDirty) {
        Modal.confirm({
          title: "提示",
          content:
            "您正在编辑一个测试项目，如果当前编辑的测试项目尚未保存，新建后当前数据将丢失，确定要打开另一个测试项目吗",
          onOk() {
            setState({
              isSaveAsModalOpen: true, //先填写新建Modal，再跳转新建页面
              addModalType: "add",
            });
          },
        });
        return;
      }

      setState({
        addModalType: "add",
        isSaveAsModalOpen: true,
      });
      // message.info("需要确认 点击新建后是否需要先弹出 新建弹框");
    }
  };
  const handleAdd = () => {
    // 已发布 弹出新建Modal
    if (isRelease) {
      setState({
        isSaveAsModalOpen: true,
        addModalType: "add",
      });
      return;
    }
    // 已修改，弹确认框
    if (isDirty) {
      Modal.confirm({
        title: "提示",
        content:
          "您正在编辑一个测试项目，如果当前编辑的测试项目尚未保存，新建后当前数据将丢失，确定要打开另一个测试项目吗",
        onOk: () =>
          setState({
            isSaveAsModalOpen: true, // 弹出新建Modal
            addModalType: "add",
          }),
      });
      return;
    }

    // 未修改，直接打开新建Modal
    setState({
      addModalType: "add",
      isSaveAsModalOpen: true,
    });
  };
  const handleExport = () => {};
  const handleSelfCheck = () => {};
  const hasNonEmptyTab = (data: Record<string, any[]>): boolean => {
    return Object.values(data).some((arr) => arr.length > 0);
  };
  const handleSaveAs = () => {
    setState({ isSaveAsModalOpen: true, addModalType: "save" });
  };
  const handleSave = () => {
    // 已发布直接提示
    if (isRelease) {
      Modal.confirm({
        title: "提示",
        content:
          "此测试项目已存在，且已发布，不能保存！如需保存，请选择”另存为“重新命名后保存；无需保存，请选择”取消“",
        okText: "另存为",
        onOk: () => setState({ isSaveAsModalOpen: true }),
      });
      return;
    }
    const hasData = hasNonEmptyTab(tabData);
    if (autoId === "add" && !hasData) {
      message.info("您尚未创建流程，无需保存");
      return;
    }
    if (autoId !== "add" && isDirty) {
      // 这里填写保存逻辑
      console.log("执行保存操作");
    }
  };
  return (
    <PageContainer
      header={{
        title: (
          <div>
            序列编辑 &nbsp;{" "}
            {title && <span style={{ color: "#6c757d" }}>【 {title} 】</span>}
          </div>
        ),
        ghost: true,
        extra: [
          <Button key="1" onClick={handleGoBack}>
            返回
          </Button>,
        ],
      }}
    >
      <div className="test-sequence-edit">
        {/* 操作栏 */}
        <Card className="operation-bar">
          <Space className="operation-buttons">
            <Button icon={<PlusOutlined />} onClick={handleAdd}>
              新建
            </Button>
            <Button icon={<SaveOutlined />} onClick={handleSave}>
              保存
            </Button>
            <Button icon={<FileAddOutlined />} onClick={handleSaveAs}>
              另存为
            </Button>
            <Button icon={<CloseCircleOutlined />} onClick={handleErrorCheck}>
              错误检查
            </Button>
            <Button
              icon={<PlayCircleOutlined />}
              onClick={() => {
                setState({ isRunModalOpen: true });
              }}
            >
              运行
            </Button>
          </Space>
        </Card>

        {/* 主要内容区域 */}
        <div className="test-content" style={{ paddingLeft: 10 }}>
          <Tabs
            defaultActiveKey={tabActiveKey}
            items={tabItems}
            onChange={handleTabChange}
          />

          <div
            className="main-info
          "
          >
            {tabActiveKey == 1 && (
              <Process
                data={tabData.tab1}
                selectedRowIndex={selectedRowKeys.tab1}
                onChange={(newData, newSelectedIndex) => {
                  setState((prev) => ({
                    tabData: { ...prev.tabData, tab1: newData },
                    selectedRowKeys: {
                      ...prev.selectedRowKeys,
                      tab1: newSelectedIndex,
                    },
                    isDirty: true,
                  }));
                }}
              />
            )}
            {tabActiveKey == 2 && (
              <Conditions
                data={tabData.tab2}
                selectedRowIndex={selectedRowKeys.tab2}
                onChange={(newData, newSelectedIndex) => {
                  setState((prev) => ({
                    tabData: { ...prev.tabData, tab2: newData },
                    selectedRowKeys: {
                      ...prev.selectedRowKeys,
                      tab2: newSelectedIndex,
                    },
                    isDirty: true,
                  }));
                }}
              />
            )}
            {tabActiveKey == 3 && (
              <ResultPage
                data={tabData.tab3}
                selectedRowIndex={selectedRowKeys.tab3}
                onChange={(newData, newSelectedIndex) => {
                  setState((prev) => ({
                    tabData: { ...prev.tabData, tab3: newData },
                    selectedRowKeys: {
                      ...prev.selectedRowKeys,
                      tab3: newSelectedIndex,
                    },
                    isDirty: true,
                  }));
                }}
              />
            )}
            {tabActiveKey == 4 && (
              <TemporaryVariables
                data={tabData.tab4}
                selectedRowIndex={selectedRowKeys.tab4}
                onChange={(newData, newSelectedIndex) => {
                  setState((prev) => ({
                    tabData: { ...prev.tabData, tab4: newData },
                    selectedRowKeys: {
                      ...prev.selectedRowKeys,
                      tab4: newSelectedIndex,
                    },
                    isDirty: true,
                  }));
                }}
              />
            )}
          </div>
        </div>
      </div>
      {/* 另存为 */}
      <AddModal
        open={isSaveAsModalOpen}
        type={addModalType}
        onCancel={() => {
          setState({
            isSaveAsModalOpen: false,
          });
        }}
        onOk={() => {
          setState({
            isSaveAsModalOpen: false,
          });
          console.log("addModalType", addModalType);

          // 1、如果是另存为：这里需要确认点击确认后是关闭当前序列编辑页面返回列表还是其他操作
          // 2、如果是新建 这里需要跳转到新建页面 goAdd()
          if (addModalType == "add") {
            goAdd();
          } else {
          }
        }}
      />
      {/* 运行 */}
      <RunModal
        open={isRunModalOpen}
        onCancel={() => {
          setState({ isRunModalOpen: false });
        }}
        onOk={() => {
          setState({
            isRunModalOpen: false,
          });
          // 这里需要判断是新建还是编辑，新建情况下 需要保存后获取id正在进行跳转
          // 编辑正常也是需要更新数据保存后再进行跳转
          history.push(
            `/case-management/case-run/${params.id}?status=all&name=${title}`
          );
          // 确认后跳转到运行页
        }}
      />

      <PromptModal
        open={isPromptModalOpen}
        type={promptModalType}
        onCancel={() => {
          setState({
            isPromptModalOpen: false,
          });
        }}
        onNo={() => {
          setState({
            isPromptModalOpen: false,
          });
          goList();
        }}
        onOk={() => {
          setState({
            isPromptModalOpen: false,
          });
        }}
      />
    </PageContainer>
  );
};

export default Page;
