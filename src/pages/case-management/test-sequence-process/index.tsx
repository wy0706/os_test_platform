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

type LeftTabKey = "Pre" | "UUT" | "Post";
type RightTabKey = "project" | "condition" | "result";

const Page: React.FC = () => {
  const [state, setState] = useSetState<any>({
    title: "",
    leftTabActiveKey: "UUT" as LeftTabKey,
    editValue: {},
    tabLeftItems: [
      { key: "Pre", label: "Pre测试" },
      { key: "UUT", label: "UUT测试" },
      { key: "Post", label: "Post测试" },
    ],
    tabRightItems: [
      { key: "project", label: "测试序列" },
      { key: "condition", label: "测试条件" },
      { key: "result", label: "测试结果" },
    ],
    rightTabActiveKey: "project" as RightTabKey,
    isEditAll: false, //是否编辑所有测试条件，用于请求右侧测试条件测试结果数据

    tabData: {
      Pre: [],
      UUT: [],
      Post: [],
    },
    // 判断tab数据是否已经请求过数据
    loaded: {
      Pre: false,
      UUT: false,
      Post: false,
    },
    selectedRowKeys: {
      Pre: -1,
      UUT: -1,
      Post: -1,
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

  const tabDataMap: Record<LeftTabKey, any> = {
    Pre: cloneDeep(preTable),
    UUT: cloneDeep(preTable),
    Post: cloneDeep(preTable),
  };

  const [searchParams] = useSearchParams();
  const params = useParams();

  // 初始化：只加载 UUT
  useEffect(() => {
    if (params.id !== "add") {
      handleTabChange("UUT");
    }

    const release =
      params.id === "add" ? false : searchParams.get("status") === "success";

    setState({
      title: params.id === "add" ? "" : searchParams.get("name") || "",
      isRelease: release,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleTabChange = async (key: LeftTabKey) => {
    setState({ leftTabActiveKey: key });

    if (params.id !== "add" && !loaded[key]) {
      try {
        // 后端接受 Pre / UUT / Post
        await getList({ tab: key });

        setState((prev) => ({
          tabData: {
            ...prev.tabData,
            [key]: tabDataMap[key] || [],
          },
          loaded: { ...prev.loaded, [key]: true },
          selectedRowKeys: {
            ...prev.selectedRowKeys,
            [key]: tabDataMap[key]?.length ? 0 : -1, // 默认选第一条
          },
        }));
      } catch (e) {
        // 失败也保证本地结构一致
        setState((prev) => ({
          tabData: {
            ...prev.tabData,
            [key]: tabDataMap[key] || [],
          },
          loaded: { ...prev.loaded, [key]: true },
          selectedRowKeys: {
            ...prev.selectedRowKeys,
            [key]: tabDataMap[key]?.length ? 0 : -1,
          },
        }));
      }
    }
  };

  const handleGoBack = () => {
    if (isRelease) {
      //如果已发布 不做任何操作直接返回
      history.push("/case-management/test-sequence-integration");
    } else {
      //如果未发布
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
      //如果未发布
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
    const activeKey: LeftTabKey = leftTabActiveKey;

    // 创建新的行数据
    const newRowData = {
      id: Date.now(), // 使用时间戳作为唯一ID
      status: "success",
      command: nodeKey,
      extention: "测试数据",
      title: ` ${nodeTitle}`,
    };

    // 在选中行下方插入新行
    const insertIndex = (selectedRowKeys?.[activeKey] ?? -1) + 1;
    const newTableData = [...(tabData?.[activeKey] || [])];

    newTableData.splice(insertIndex, 0, newRowData);

    // 更新序号
    newTableData.forEach((item, index) => {
      item.sequence = index + 1;
    });

    setState((prev) => ({
      tabData: {
        ...prev.tabData,
        [activeKey]: newTableData,
      },
      isDirty: true,
      selectedRowKeys: {
        ...prev.selectedRowKeys,
        [activeKey]: insertIndex,
      },
    }));

    message.success("插入成功");
  };

  const handleRun = () => {
    if (isRelease) {
      // 已发布可以直接跳转运行界面
      history.push("/case-management/case-run/add?status=all");
    } else {
      // 判断是否为空，为空提示数据为空
      const isAllEmpty = [tabData.Pre, tabData.UUT, tabData.Post].every(
        (tab) => tab.length === 0
      );

      if (isAllEmpty) {
        message.info("新建文件为空，无法运行");
        return;
      } else {
        if (isDirty) {
          // 不为空 如果是新建，保存数据后拿到id name等信息 跳转run页面
          if (params.id === "add") {
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
            程序编辑 &nbsp;{" "}
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

              <Button icon={<CheckCircleOutlined />} onClick={handleRun}>
                运行
              </Button>
            </Space>
            <Checkbox
              onChange={(e) => {
                setState({ isEditAll: e.target.checked });
              }}
            >
              编辑所有测试条件
            </Checkbox>{" "}
          </div>
        </Card>

        {/* 主要内容区域 */}
        <div className="main-content">
          <div className="table-panel">
            <div className="table-card">
              {/* 用 activeKey 受控，避免 defaultActiveKey 不跟随 state */}
              <Tabs
                activeKey={leftTabActiveKey}
                items={tabLeftItems}
                onChange={(k) => handleTabChange(k as LeftTabKey)}
              />

              <div style={{ padding: "10px" }}>
                {leftTabActiveKey === "Pre" && (
                  <PrePage
                    selectedRowIndex={selectedRowKeys.Pre}
                    treeSelectData={treeSelectedKeys}
                    onChange={(newData, newSelectedIndex) => {
                      setState((prev) => ({
                        tabData: { ...prev.tabData, Pre: newData },
                        selectedRowKeys: {
                          ...prev.selectedRowKeys,
                          Pre: newSelectedIndex,
                        },
                        isDirty: true,
                      }));
                    }}
                    data={tabData.Pre}
                  />
                )}

                {leftTabActiveKey === "UUT" && (
                  <UutPage
                    selectedRowIndex={selectedRowKeys.UUT}
                    treeSelectData={treeSelectedKeys}
                    onChange={(newData, newSelectedIndex) => {
                      setState((prev) => ({
                        tabData: { ...prev.tabData, UUT: newData },
                        selectedRowKeys: {
                          ...prev.selectedRowKeys,
                          UUT: newSelectedIndex,
                        },
                        isDirty: true,
                      }));
                    }}
                    data={tabData.UUT}
                  />
                )}

                {leftTabActiveKey === "Post" && (
                  <PostPage
                    selectedRowIndex={selectedRowKeys.Post}
                    treeSelectData={treeSelectedKeys}
                    onChange={(newData, newSelectedIndex) => {
                      setState((prev) => ({
                        tabData: { ...prev.tabData, Post: newData },
                        selectedRowKeys: {
                          ...prev.selectedRowKeys,
                          Post: newSelectedIndex,
                        },
                        isDirty: true,
                      }));
                    }}
                    data={tabData.Post}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="tree-panel">
            <Tabs
              activeKey={rightTabActiveKey}
              items={tabRightItems}
              onChange={(key) => {
                setState({ rightTabActiveKey: key as RightTabKey });
              }}
            />

            <div className="tree-panel-content">
              {rightTabActiveKey === "project" && (
                <TestProject
                  leftTab={leftTabActiveKey}
                  data={mockTreeData}
                  onInsertTreeNode={insertTreeNode}
                  onSelect={(keys, info) => {
                    setState({
                      treeSelectedKeys: keys as string[],
                      treeSelectedCommand: info.node.command,
                      treeSelectedNode: info.node,
                    });
                  }}
                />
              )}

              {rightTabActiveKey === "condition" && <TestCondition />}
              {rightTabActiveKey === "result" && <TestResult />}
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
              message.success("保存成功");
              switch (promptModalType) {
                case "back":
                  history.push("/case-management/test-sequence-integration");
                  return;
                case "add":
                  goAdd();
                // ⚠️ 原代码这里缺少 break，会继续落到 run。这里保持你原逻辑不动，但建议你确认是否需要 break。
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
