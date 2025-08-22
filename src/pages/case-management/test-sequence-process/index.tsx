import { getList } from "@/services/task-management/test-requirement.service";
import {
  CheckCircleOutlined,
  FileAddOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { history, useParams, useSearchParams } from "@umijs/max";
import { useSetState } from "ahooks";
import { Button, Card, Checkbox, message, Modal, Space, Tabs } from "antd";
import cloneDeep from "lodash/cloneDeep";
import React, { useEffect } from "react";
import RunModal from "../components/runModal";
import PostPage from "./components/postPage";
import PrePage from "./components/prePage";
import SaveModal from "./components/saveModal";
import TestCondition from "./components/testCondition";
import TestProject from "./components/testProject";
import TestResult from "./components/testResult";
import UutPage from "./components/uutPage";
import "./index.less";
import { mockTreeData, preTable } from "./schemas";
const Page: React.FC = () => {
  const [state, setState] = useSetState<any>({
    title: "",
    leftTabActiveKey: 1,
    editType: "", //pre 、uut 、post
    editValue: {},
    tabLeftItems: [
      {
        key: "1",
        label: "Pre测试",
      },
      {
        key: "2",
        label: "UUT测试",
      },
      {
        key: "3",
        label: "Post测试",
      },
    ],
    tabRightItems: [
      {
        key: "1",
        label: "测试项目",
      },
      {
        key: "2",
        label: "测试条件",
      },
      {
        key: "3",
        label: "测试结果",
      },
    ],
    rightTabActiveKey: 1,
    isEditAll: false, //是否编辑所有测试条件
    tabData: {
      tab1: [],
      tab2: [],
      tab3: [],
    },
    // 判断tab数据是否已经请求过数据
    loaded: {
      tab1: false,
      tab2: false,
      tab3: false,
    },
    selectedRowKeys: {
      tab1: -1,
      tab2: -1,
      tab3: -1,
    },
    isDirty: false,
    projectTreeData: [],
    projectExpandedKeys: [],
    treeSelectedKeys: [],
    treeSelectedCommand: "",
    treeSelectedNode: {},
    copyValue: {},
    isRelease: "", //是否为已发布 ，只有编辑状态才有
    isRunModalOpen: false,
    isPromptModalOpen: false,
    promptModalTitle: "",
    promptModalType: "back", //back（表示返回列表） 和add（表示进入新增页面），run（表示进入运行界面）
    isSaveModalOpen: false,
    saveModalType: "", //保存和另存为  save saveAs
  });
  const {
    title,
    tabLeftItems,
    leftTabActiveKey,
    tabRightItems,
    rightTabActiveKey,
    isEditAll,
    tabData,
    isDirty,
    loaded,
    projectTreeData,
    projectExpandedKeys,
    selectedRowKeys,
    treeSelectedKeys,
    treeSelectedCommand,
    treeSelectedNode,
    copyValue,
    isRelease,
    isRunModalOpen,
    isPromptModalOpen,
    promptModalTitle,
    promptModalType,
    isSaveModalOpen,
    saveModalType,
  } = state;
  const tabDataMap: Record<string, any> = {
    tab1: cloneDeep(preTable),
    tab2: cloneDeep(preTable),
    tab3: cloneDeep(preTable),
  };
  const [searchParams] = useSearchParams();
  const params = useParams();
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
    console.log("release", release);

    setState({
      title: params.id === "add" ? "" : searchParams.get("name") || "",
      isRelease: release,
    });
  }, [params.id]);
  const handleTabChange = async (key: string) => {
    setState({ leftTabActiveKey: key });
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

  const handleGoBack = () => {
    console.log(isDirty, isRelease);
    if (isRelease) {
      //如果已发布 不做任何操作直接返回
      history.push("/case-management/test-sequence-integration");
    } else {
      //r如果未发布
      if (isDirty) {
        setState({
          isPromptModalOpen: true,
          promptModalType: "back",
          promptModalTitle:
            params.id === "add"
              ? "新建文件需要保存吗 ？"
              : "文件已经改动，需要保存吗 ？",
        });
      } else {
        history.push("/case-management/test-sequence-integration");
      }
    }
  };

  const handleAdd = () => {
    if (isRelease) {
      // 新建弹框直接如果已发布
      setState({
        isRunModalOpen: true,
      });
    } else {
      //r如果未发布
      if (isDirty) {
        setState({
          isPromptModalOpen: true,
          promptModalType: "add",
          promptModalTitle:
            params.id === "add"
              ? "新建文件需要保存吗 ？"
              : "文件已经改动，需要保存吗 ？",
        });
      }
    }
  };

  // 保存
  const handleSave = (type: string) => {
    if (isRelease) {
      //如果已发布不能保存和另存为
      message.info("文件已发布，不可更改 ！");
    } else {
      if (isDirty) {
        setState({
          isSaveModalOpen: true,
          saveModalType: type,
        });
      } else {
        message.info("测试项目为空，不能保存 ！");
      }
    }
  };

  const goAdd = () => {
    history.push("/case-management/test-sequence-process/add");
    window.location.reload();
  };
  // 通用插入函数，供双击和按钮点击使用
  const insertTreeNode = (nodeKey: string, nodeTitle: string) => {
    console.log(nodeKey, nodeTitle);
    // if (tableData.length > 299) {
    //   message.warning("表格中的命令数量已达到最大限度，不可插入");
    //   return;
    // }
    // 创建新的行数据
    const newRowData = {
      id: Date.now(), // 使用时间戳作为唯一ID
      status: "success",
      command: nodeKey,
      extention: "测试数据",
      title: ` ${nodeTitle}`,
    };
    // 在选中行下方插入新行
    const insertIndex =
      leftTabActiveKey == 1
        ? selectedRowKeys.tab1 + 1
        : leftTabActiveKey == 2
        ? selectedRowKeys.tab2 + 1
        : selectedRowKeys.tab3 + 1;
    const newTableData =
      leftTabActiveKey == 1
        ? [...tabData.tab1]
        : leftTabActiveKey == 2
        ? [...tabData.tab2]
        : [...tabData.tab3];
    newTableData.splice(insertIndex, 0, newRowData);

    // 更新序号
    newTableData.forEach((item, index) => {
      item.sequence = index + 1;
    });

    let obj = {
      [leftTabActiveKey == 1
        ? "tab1"
        : leftTabActiveKey == 2
        ? "tab2"
        : "tab3"]: newTableData,
    };
    console.log("obj", obj);

    setState((prev) => ({
      tabData: {
        ...prev.tabData,
        [leftTabActiveKey == 1
          ? "tab1"
          : leftTabActiveKey == 2
          ? "tab2"
          : "tab3"]: newTableData,
      },
      isDirty: true,
    }));
    // 选中新插入的行
    console.log("insertIndex", insertIndex);

    setState((prev) => ({
      selectedRowKeys: {
        ...prev.selectedRowKeys,
        [leftTabActiveKey == 1
          ? "tab1"
          : leftTabActiveKey == 2
          ? "tab2"
          : "tab3"]: insertIndex,
      },
    }));
    // message.success(`已在第${insertIndex + 1}行插入: ${nodeTitle}`);
    message.success("插入成功");
  };

  const handleRun = () => {
    if (isRelease) {
      // 已发布可以直接跳转运行界面/case-management/case-run/2?status=all&name=123
      history.push("/case-management/case-run/add?status=all");
    } else {
      // 判断是否为空，为空提示数据为空
      const isAllEmpty = [tabData.tab1, tabData.tab2, tabData.tab3].every(
        (tab) => tab.length === 0
      );
      if (isAllEmpty) {
        message.info("新建文件为空，无法运行");
        return;
      } else {
        if (isDirty) {
          // 不为空 如果是新建，保存数据后拿到id name等信息 跳转run页面
          if (params.id === "add") {
            //
            history.push(
              "/case-management/case-run/1?status=all&name=os测试.tpf"
            );
          } else {
            // 不为空  如果是更改，提示是否先更改，再跳转页面
            setState({
              isPromptModalOpen: true,
              promptModalType: "run",
              promptModalTitle: "文件已经改动，需要保存吗 ？",
            });
          }
        } else {
          history.push(
            "/case-management/case-run/1?status=all&name=os测试.tpf"
          );
        }
      }
    }
  };
  return (
    <PageContainer
      header={{
        title: (
          <div>
            用例执行 &nbsp;{" "}
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
      <div className="test-sequence-process">
        {/* 操作栏 */}
        <Card className="operation-bar">
          <div
            className="operation"
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Space className="operation-buttons">
              <Button icon={<PlusOutlined />} onClick={handleAdd}>
                新建
              </Button>

              <Button
                icon={<SaveOutlined />}
                onClick={() => handleSave("save")}
              >
                保存
              </Button>
              <Button
                icon={<FileAddOutlined />}
                onClick={() => handleSave("saveAs")}
              >
                另存为
              </Button>
              {/* 复制   粘贴    剪切  */}
              <Button icon={<CheckCircleOutlined />} onClick={handleRun}>
                运行
              </Button>
            </Space>
            <Checkbox checked={isEditAll}>编辑所有测试条件</Checkbox>{" "}
          </div>
        </Card>

        {/* 主要内容区域 */}
        <div className="main-content">
          <div className="table-panel">
            <div className="table-card">
              <Tabs
                defaultActiveKey={leftTabActiveKey}
                items={tabLeftItems}
                onChange={handleTabChange}
              />
              <div style={{ padding: "10px" }}>
                {leftTabActiveKey == 1 && (
                  <PrePage
                    selectedRowIndex={selectedRowKeys.tab1}
                    treeSelectData={treeSelectedKeys}
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
                    data={tabData.tab1}
                  />
                )}
                {leftTabActiveKey == 2 && (
                  <UutPage
                    selectedRowIndex={selectedRowKeys.tab2}
                    treeSelectData={treeSelectedKeys}
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
                    data={tabData.tab2}
                  />
                )}
                {leftTabActiveKey == 3 && (
                  <PostPage
                    selectedRowIndex={selectedRowKeys.tab3}
                    treeSelectData={treeSelectedKeys}
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
                    data={tabData.tab3}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="tree-panel">
            <Tabs
              defaultActiveKey={rightTabActiveKey}
              items={tabRightItems}
              onChange={(key: any) => {
                setState({ rightTabActiveKey: key });
              }}
              // tabBarExtraContent={<Checkbox>编辑所有测试条件</Checkbox>}
            />

            <div className="tree-panel-content">
              {rightTabActiveKey == 1 && (
                <TestProject
                  data={mockTreeData}
                  onInsertTreeNode={insertTreeNode}
                  onSelect={(keys, info) => {
                    console.log(keys, info);

                    setState({
                      treeSelectedKeys: keys as string[],
                      treeSelectedCommand: info.node.command,
                      treeSelectedNode: info.node,
                    });
                  }}
                />
              )}
              {rightTabActiveKey == 2 && <TestCondition />}
              {rightTabActiveKey == 3 && <TestResult />}
            </div>
          </div>
        </div>
      </div>
      <RunModal
        open={isRunModalOpen}
        onCancel={() => {
          setState({ isRunModalOpen: false });
        }}
        onOk={(values) => {
          console.log(values);
          setState({ isRunModalOpen: false });
          goAdd();
        }}
      />

      <Modal
        title={promptModalTitle}
        open={isPromptModalOpen}
        onCancel={() => setState({ isPromptModalOpen: false })}
        footer={[
          <Button
            key="save"
            type="primary"
            style={{ marginRight: "10px" }}
            onClick={() => {
              console.log("保存");
              // 保存数据后再跳转新建页面
              message.success("保存成功");
              switch (promptModalType) {
                case "back":
                  history.push("/case-management/test-sequence-integration");
                  return;
                case "add":
                  goAdd();
                case "run":
                  history.push(
                    "/case-management/case-run/1?status=all&name=os测试.tpf"
                  );
                  return;
                default:
                  return;
              }
            }}
          >
            是
          </Button>,
          <Button
            key="nosave"
            danger
            onClick={() => {
              console.log("不保存");
              switch (promptModalType) {
                case "back":
                  history.push("/case-management/test-sequence-integration");
                  return;
                case "add":
                  goAdd();
                case "run":
                  history.push(
                    "/case-management/case-run/1?status=all&name=os测试.tpf"
                  );
                  return;
                default:
                  return;
              }
            }}
            style={{ marginRight: "10px" }}
          >
            否
          </Button>,
          <Button
            key="cancel"
            onClick={() => setState({ isPromptModalOpen: false })}
          >
            取消
          </Button>,
        ]}
      ></Modal>
      <SaveModal
        open={isSaveModalOpen}
        type={saveModalType}
        onOk={(values) => {
          console.log("values", values);
          setState({ isSaveModalOpen: false });
          // 保存成功后跳转到列表
          history.push("/case-management/test-sequence-integration");
        }}
        onCancel={() => {
          setState({ isSaveModalOpen: false });
        }}
      />
    </PageContainer>
  );
};

export default Page;
