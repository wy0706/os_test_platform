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
import React, { useEffect, useMemo, useRef } from "react";
import RunModal from "../components/runModal";
import PostPage, { TablePageRef } from "./components/postPage";
import PrePage from "./components/prePage";
import SaveModal from "./components/saveModal";
import TestCondition from "./components/testCondition";
import TestProject from "./components/testProject";
import TestResult from "./components/testResult";
import UutPage from "./components/uutPage";
import "./index.less";
import { mockTreeData } from "./schemas";

type LeftTabKey = "Pre" | "UUT" | "Post";
type RightTabKey = "project" | "condition" | "result";
type SelectedProject = { key: string; title: string; id: string } | null;

type TabMeta = {
  isDirty: boolean;
  isEmpty: boolean;
};

const Page: React.FC = () => {
  const [state, setState] = useSetState<any>({
    title: "",
    leftTabActiveKey: "UUT" as LeftTabKey,
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
    isEditAll: false,

    selectedProject: null as SelectedProject,

    tabMeta: {
      Pre: { isDirty: false, isEmpty: true },
      UUT: { isDirty: false, isEmpty: true },
      Post: { isDirty: false, isEmpty: true },
    } as Record<LeftTabKey, TabMeta>,

    isRelease: "",

    isRunModalOpen: false,
    isPromptModalOpen: false,
    promptModalTitle: "",
    promptModalType: "back",
    isSaveModalOpen: false,
    saveModalType: "",

    selectedRowByTab: {
      Pre: null,
      UUT: null,
      Post: null,
    } as Record<LeftTabKey, any>,

    // ✅ 每个左侧Tab下各自保存一份右侧树的选中keys，用于右侧tab切换后恢复高亮
    rightTreeSelectedKeys: {
      Pre: [],
      UUT: [],
      Post: [],
    } as Record<LeftTabKey, React.Key[]>,
  });

  const {
    title,
    tabLeftItems,
    leftTabActiveKey,
    tabRightItems,
    rightTabActiveKey,
    isEditAll,
    selectedProject,
    tabMeta,
    isRelease,
    isRunModalOpen,
    isPromptModalOpen,
    promptModalTitle,
    promptModalType,
    isSaveModalOpen,
    saveModalType,
  } = state;

  const activeTreeSelectedKeys = useMemo(() => {
    return state.rightTreeSelectedKeys?.[leftTabActiveKey] || [];
  }, [state.rightTreeSelectedKeys, leftTabActiveKey]);

  const [searchParams] = useSearchParams();
  const params = useParams();

  const preRef = useRef<TablePageRef>(null);
  const uutRef = useRef<TablePageRef>(null);
  const postRef = useRef<TablePageRef>(null);

  const handleSelectionChange = (tab: LeftTabKey, row: any | null) => {
    setState((prev: any) => ({
      selectedRowByTab: {
        ...prev.selectedRowByTab,
        [tab]: row,
      },
    }));
  };

  const activeSelectedRow = useMemo(() => {
    return state.selectedRowByTab?.[leftTabActiveKey] || null;
  }, [state.selectedRowByTab, leftTabActiveKey]);

  const activeRef = useMemo(() => {
    if (leftTabActiveKey === "Pre") return preRef;
    if (leftTabActiveKey === "UUT") return uutRef;
    return postRef;
  }, [leftTabActiveKey]);

  useEffect(() => {
    const release =
      params.id === "add" ? false : searchParams.get("status") === "success";

    setState({
      title: params.id === "add" ? "" : searchParams.get("name") || "",
      isRelease: release,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleTabChange = (key: LeftTabKey) => {
    setState({
      leftTabActiveKey: key,
      // ✅ 左侧Tab切换：不清空右侧树选择（因为每个tab保存一份 keys）
      // selectedProject: null,
    });
  };

  const anyDirty = useMemo(() => {
    return tabMeta.Pre.isDirty || tabMeta.UUT.isDirty || tabMeta.Post.isDirty;
  }, [tabMeta]);

  const allEmpty = useMemo(() => {
    return tabMeta.Pre.isEmpty && tabMeta.UUT.isEmpty && tabMeta.Post.isEmpty;
  }, [tabMeta]);

  const handleGoBack = () => {
    if (isRelease) {
      history.push("/case-management/test-sequence-integration");
      return;
    }
    if (anyDirty) {
      setState({
        isPromptModalOpen: true,
        promptModalType: "back",
        promptModalTitle:
          params.id === "add"
            ? "新建文件需要保存吗 ？"
            : "文件已经改动，需要保存吗 ？",
      });
      return;
    }
    history.push("/case-management/test-sequence-integration");
  };

  const goAdd = () => {
    history.push("/case-management/test-sequence-process/add");
    window.location.reload();
  };

  const handleAdd = () => {
    if (isRelease) {
      setState({ isRunModalOpen: true });
      return;
    }
    if (anyDirty) {
      setState({
        isPromptModalOpen: true,
        promptModalType: "add",
        promptModalTitle:
          params.id === "add"
            ? "新建文件需要保存吗 ？"
            : "文件已经改动，需要保存吗 ？",
      });
      return;
    }
    goAdd();
  };

  const handleSave = (type: string) => {
    if (isRelease) {
      message.info("文件已发布，不可更改 ！");
      return;
    }
    if (!anyDirty) {
      message.info("没有改动，无需保存 ！");
      return;
    }
    setState({
      isSaveModalOpen: true,
      saveModalType: type,
    });
  };

  const handleRun = () => {
    if (isRelease) {
      history.push("/case-management/case-run/add?status=all");
      return;
    }

    if (allEmpty) {
      message.info("新建文件为空，无法运行");
      return;
    }

    if (anyDirty) {
      if (params.id === "add") {
        history.push("/case-management/case-run/1?status=all&name=os测试.tpf");
      } else {
        setState({
          isPromptModalOpen: true,
          promptModalType: "run",
          promptModalTitle: "文件已经改动，需要保存吗 ？",
        });
      }
      return;
    }

    history.push("/case-management/case-run/1?status=all&name=os测试.tpf");
  };

  const handleInsertFromTree = (
    nodeKey: any,
    nodeTitle: string,
    nodeId: string
  ) => {
    activeRef.current?.insertFromTree?.({
      key: nodeKey,
      title: nodeTitle,
      id: nodeId,
    });
  };

  const handleTabMetaChange = (tab: LeftTabKey, meta: TabMeta) => {
    setState((prev: any) => ({
      tabMeta: {
        ...prev.tabMeta,
        [tab]: meta,
      },
    }));
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
              checked={isEditAll}
              onChange={(e) => setState({ isEditAll: e.target.checked })}
            >
              编辑所有测试条件
            </Checkbox>
          </div>
        </Card>

        <div className="main-content">
          <div className="table-panel">
            <div className="table-card">
              <Tabs
                activeKey={leftTabActiveKey}
                items={tabLeftItems}
                onChange={(k) => handleTabChange(k as LeftTabKey)}
              />

              <div style={{ padding: "10px" }}>
                {leftTabActiveKey === "Pre" && (
                  <PrePage
                    ref={preRef}
                    onSelectionChange={handleSelectionChange}
                    tab="Pre"
                    recordId={params.id as string}
                    isRelease={!!isRelease}
                    selectedProject={selectedProject}
                    onMetaChange={handleTabMetaChange}
                  />
                )}

                {leftTabActiveKey === "UUT" && (
                  <UutPage
                    ref={uutRef}
                    tab="UUT"
                    recordId={params.id as string}
                    onSelectionChange={handleSelectionChange}
                    isRelease={!!isRelease}
                    selectedProject={selectedProject}
                    onMetaChange={handleTabMetaChange}
                  />
                )}

                {leftTabActiveKey === "Post" && (
                  <PostPage
                    ref={postRef}
                    tab="Post"
                    recordId={params.id as string}
                    onSelectionChange={handleSelectionChange}
                    isRelease={!!isRelease}
                    selectedProject={selectedProject}
                    onMetaChange={handleTabMetaChange}
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

                // ✅ 如果你希望切到 condition/result 时强制清空插入（恢复初始状态），打开下面注释
                // if (key !== "project") {
                //   setState({ selectedProject: null });
                // }
              }}
            />

            <div className="tree-panel-content">
              {rightTabActiveKey === "project" && (
                <TestProject
                  leftTab={leftTabActiveKey}
                  data={mockTreeData}
                  selectedKeys={activeTreeSelectedKeys}
                  onInsertTreeNode={handleInsertFromTree}
                  onSelect={(keys, info) => {
                    const node: any = info?.node;
                    const nextKeys = (keys || []).map((k: any) => String(k));

                    // ✅ 保存当前tab的树选中keys，用于右侧tab切换回来恢复高亮
                    setState((prev: any) => ({
                      rightTreeSelectedKeys: {
                        ...prev.rightTreeSelectedKeys,
                        [leftTabActiveKey]: nextKeys,
                      },
                    }));

                    // ✅ 非叶子/空选中：清空 selectedProject（插入置灰）
                    if (!node || nextKeys.length === 0 || node.level !== 3) {
                      setState({ selectedProject: null });
                      return;
                    }

                    // ✅ 叶子 level=3：selectedProject 有值（插入可用）
                    setState({
                      selectedProject: {
                        key: String(node.key || ""),
                        title: String(node.title || ""),
                        id: String(node.ids || ""),
                      },
                    });
                  }}
                />
              )}

              {rightTabActiveKey === "condition" && (
                <TestCondition
                  TST={leftTabActiveKey}
                  selectedRow={activeSelectedRow}
                  isAll={isEditAll}
                />
              )}

              {rightTabActiveKey === "result" && (
                <TestResult
                  TST={leftTabActiveKey}
                  selectedRow={activeSelectedRow}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <RunModal
        open={isRunModalOpen}
        onCancel={() => setState({ isRunModalOpen: false })}
        onOk={() => {
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
              setState({ isPromptModalOpen: false });

              switch (promptModalType) {
                case "back":
                  history.push("/case-management/test-sequence-integration");
                  return;
                case "add":
                  goAdd();
                  return;
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
              setState({ isPromptModalOpen: false });

              switch (promptModalType) {
                case "back":
                  history.push("/case-management/test-sequence-integration");
                  return;
                case "add":
                  goAdd();
                  return;
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
      />

      <SaveModal
        open={isSaveModalOpen}
        type={saveModalType}
        onOk={() => {
          setState({ isSaveModalOpen: false });
          history.push("/case-management/test-sequence-integration");
        }}
        onCancel={() => setState({ isSaveModalOpen: false })}
      />
    </PageContainer>
  );
};

export default Page;
