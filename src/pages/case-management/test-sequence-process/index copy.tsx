import {
  beforeAdd,
  beforeBack,
  beforeSave,
  saveData,
} from "@/services/case-management/test-sequence-process.service";
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
import RunSequenceModal from "../components/runSequenceModal";
import SaveModal from "./components/saveModal";
import TestCondition from "./components/testCondition";
import TestProject from "./components/testProject";
import TestResult from "./components/testResult";

import PostPage, { TablePageRef as PostRef } from "./components/postPage";
import PrePage, { TablePageRef as PreRef } from "./components/prePage";
import UutPage, { TablePageRef as UutRef } from "./components/uutPage";

import "./index.less";

type LeftTabKey = "Pre" | "UUT" | "Post";
type RightTabKey = "project" | "condition" | "result";
type TabMeta = { isDirty: boolean; isEmpty: boolean };

const LEFT_TABS = [
  { key: "Pre", label: "Pre测试" },
  { key: "UUT", label: "UUT测试" },
  { key: "Post", label: "Post测试" },
];

const RIGHT_TABS = [
  { key: "project", label: "测试序列" },
  { key: "condition", label: "测试条件" },
  { key: "result", label: "测试结果" },
];

const Page: React.FC = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();

  const preRef = useRef<PreRef>(null);
  const uutRef = useRef<UutRef>(null);
  const postRef = useRef<PostRef>(null);

  const [state, setState] = useSetState<any>({
    title: "",
    leftTabActiveKey: "UUT" as LeftTabKey,
    rightTabActiveKey: "project" as RightTabKey,
    isEditAll: false,
    isRelease: false,

    // ✅ 右侧树：每个左侧Tab单独保存选中keys（切换右侧tab回来可恢复高亮）
    rightTreeSelectedKeys: {
      Pre: [],
      UUT: [],
      Post: [],
    } as Record<LeftTabKey, React.Key[]>,

    // ✅ 当前左侧tab选中的树节点（只在测试序列tab用，插入依赖它）
    selectedProject: null as null | { key: string; title: string; id: string },

    // ✅ 每个左侧tab表格选中的行（TestCondition/TestResult 依赖）
    selectedRowByTab: {
      Pre: null,
      UUT: null,
      Post: null,
    } as Record<LeftTabKey, any>,

    // ✅ 三页是否dirty/empty（用于返回/新建/运行提示）
    tabMeta: {
      Pre: { isDirty: false, isEmpty: true },
      UUT: { isDirty: false, isEmpty: true },
      Post: { isDirty: false, isEmpty: true },
    } as Record<LeftTabKey, TabMeta>,

    // 弹窗
    isRunModalOpen: false,
    isPromptModalOpen: false,
    promptModalTitle: "",
    promptModalType: "back", // back | add | run
    isSaveModalOpen: false,
    saveModalType: "",
    addLoading: false,
    saveLoading: false,
    saveAsLoading: false,
    filename: "",
    addModalOpen: false,
    btnType: null,
  });

  const {
    title,
    leftTabActiveKey,
    rightTabActiveKey,
    isEditAll,
    isRelease,
    selectedProject,
    rightTreeSelectedKeys,
    selectedRowByTab,
    tabMeta,
    addLoading,
    saveLoading,
    saveAsLoading,
    isRunModalOpen,
    isPromptModalOpen,
    promptModalTitle,
    promptModalType,
    isSaveModalOpen,
    saveModalType,
    filename,
    addModalOpen,
    btnType,
  } = state;

  const recordId = params.id as string;

  const anyDirty = useMemo(() => {
    return tabMeta.Pre.isDirty || tabMeta.UUT.isDirty || tabMeta.Post.isDirty;
  }, [tabMeta]);

  const allEmpty = useMemo(() => {
    return tabMeta.Pre.isEmpty && tabMeta.UUT.isEmpty && tabMeta.Post.isEmpty;
  }, [tabMeta]);

  const activeSelectedRow = selectedRowByTab[leftTabActiveKey];
  const activeTreeKeys = rightTreeSelectedKeys[leftTabActiveKey] || [];

  const getActiveRef = () => {
    if (leftTabActiveKey === "Pre") return preRef;
    if (leftTabActiveKey === "UUT") return uutRef;
    return postRef;
  };
  // 最终需要删除release
  useEffect(() => {
    const release =
      recordId === "add" ? false : searchParams.get("status") == "success";

    setState({
      title: recordId === "add" ? "" : searchParams.get("name") || "",
      isRelease: release,
    });
  }, [recordId]);

  /** ✅ 左侧 tab 切换 */
  const handleLeftTabChange = (key: LeftTabKey) => {
    setState({
      leftTabActiveKey: key,
      // ✅ 切换左侧tab时，保留右侧树选中keys（每tab独立存储）
      // ✅ selectedProject 也会由 TestProject onSelect 再次更新
    });
  };

  /** ✅ 右侧 tab 切换 */
  const handleRightTabChange = (key: RightTabKey) => {
    setState({ rightTabActiveKey: key });
  };

  /** ✅ UUT/Pre/Post 页面选中行回传 */
  const handleSelectionChange = (tab: LeftTabKey, row: any | null) => {
    setState((prev: any) => ({
      selectedRowByTab: {
        ...prev.selectedRowByTab,
        [tab]: row,
      },
    }));
  };

  /** ✅ 子页面 meta 回传 */
  const handleTabMetaChange = (tab: LeftTabKey, meta: TabMeta) => {
    setState((prev: any) => ({
      tabMeta: {
        ...prev.tabMeta,
        [tab]: meta,
      },
    }));
  };

  /** ✅ 插入：把树节点传给当前 tab 页面 */
  const handleInsertFromTree = (
    nodeKey: string,
    nodeTitle: string,
    nodeId: string
  ) => {
    getActiveRef().current?.insertFromTree?.({
      key: nodeKey,
      title: nodeTitle,
      id: nodeId,
    });
  };

  const goList = () =>
    history.push("/case-management/test-sequence-integration");

  const goAdd = () => {
    history.push(`/case-management/test-sequence-process/add`);
    window.location.reload();
  };

  const handleGoBack = async () => {
    try {
      setState({ saveLoading: true });
      const { code, message: msg } = await beforeBack();
      if (code === 0) {
        goList();
        return;
      } else if (code === 1) {
        setState({
          isPromptModalOpen: true,
          promptModalType: "back",
          promptModalTitle: msg || "文件已经改动，需要保存吗？",
        });
      } else {
        message.error(msg || "操作失败");
        return;
      }
    } finally {
      setState({ saveLoading: false });
    }
  };
  // 新建
  const handleAdd = async () => {
    try {
      setState({ addLoading: true });
      const { code, message: msg } = await beforeAdd();
      if (code === 0) {
        // 可以新建
        setState({ addModalOpen: true });
        return;
      } else if (code === 1) {
        setState({
          isPromptModalOpen: true,
          promptModalType: "add",
          promptModalTitle: msg || "文件已经改动，需要保存吗？",
        });
      } else {
        message.error(msg || "操作失败");
        return;
      }
    } finally {
      setState({ addLoading: false });
    }
  };
  // 保存/另存为
  const handleSave = async (type: string) => {
    try {
      if (type === "save") {
        setState({ saveLoading: true });
      } else {
        setState({ saveAsLoading: true });
      }
      // 如果是新建保存
      if (recordId === "add") {
        const { code, data, message: msg } = await beforeSave();
        if (code !== 0) {
          message.error(msg || "操作失败");
          return;
        }
        const { tpfname, method } = data || {};
        if (method == "-1") {
          if (type === "save") {
            setState({
              isSaveModalOpen: true,
              saveModalType: type,
            });
          } else {
            message.info("请先保存文件，再进行另存为操作！");
          }
        } else {
          if (type === "save") {
            const { code, message: msg } = await saveData({
              method: 1,
              filename: tpfname,
            });
            if (code !== 0) {
              message.error(msg || "操作失败");
              return;
            }
            message.success(msg || "操作成功");
          } else {
            setState({
              isSaveModalOpen: true,
              saveModalType: type,
            });
          }
        }
      } else {
        if (type === "saveAs") {
          setState({
            isSaveModalOpen: true,
            saveModalType: type,
          });
        } else {
          const { code, message: msg } = await saveData({
            method: 1, // 编辑保存 method=1
            filename: title,
          });
          if (code !== 0) {
            message.error(msg || "操作失败");
            return;
          }
          message.success(msg || "操作成功");
        }
      }
    } finally {
      setState({ saveLoading: false, saveAsLoading: false });
    }
  };

  const handleRun = () => {
    setState({ isRunModalOpen: true });
  };

  return (
    <PageContainer
      header={{
        title: (
          <div>
            程序编辑 &nbsp;
            {title && <span style={{ color: "#6c757d" }}>【 {title} 】</span>}
          </div>
        ),
        ghost: true,
        extra: [
          <Button key="back" onClick={handleGoBack}>
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
              <Button
                loading={addLoading}
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                新建
              </Button>
              <Button
                icon={<SaveOutlined />}
                onClick={() => handleSave("save")}
                loading={saveLoading}
              >
                保存
              </Button>
              <Button
                icon={<FileAddOutlined />}
                loading={saveAsLoading}
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
          {/* 左侧表格 */}
          <div className="table-panel">
            <div className="table-card">
              <Tabs
                activeKey={leftTabActiveKey}
                items={LEFT_TABS}
                onChange={(k) => handleLeftTabChange(k as LeftTabKey)}
              />

              <div style={{ padding: 10 }}>
                {leftTabActiveKey === "Pre" && (
                  <PrePage
                    ref={preRef}
                    tab="Pre"
                    recordId={recordId}
                    isRelease={!!isRelease}
                    selectedProject={selectedProject}
                    onMetaChange={handleTabMetaChange}
                    onSelectionChange={handleSelectionChange}
                  />
                )}
                {leftTabActiveKey === "UUT" && (
                  <UutPage
                    ref={uutRef}
                    tab="UUT"
                    recordId={recordId}
                    isRelease={!!isRelease}
                    selectedProject={selectedProject}
                    onMetaChange={handleTabMetaChange}
                    onSelectionChange={handleSelectionChange}
                  />
                )}
                {leftTabActiveKey === "Post" && (
                  <PostPage
                    ref={postRef}
                    tab="Post"
                    recordId={recordId}
                    isRelease={!!isRelease}
                    selectedProject={selectedProject}
                    onMetaChange={handleTabMetaChange}
                    onSelectionChange={handleSelectionChange}
                  />
                )}
              </div>
            </div>
          </div>

          {/* 右侧 */}
          <div className="tree-panel">
            <Tabs
              activeKey={rightTabActiveKey}
              items={RIGHT_TABS}
              onChange={(key) => handleRightTabChange(key as RightTabKey)}
            />

            <div className="tree-panel-content">
              {rightTabActiveKey === "project" && (
                <TestProject
                  leftTab={leftTabActiveKey}
                  selectedKeys={activeTreeKeys}
                  onInsertTreeNode={handleInsertFromTree}
                  onSelect={(keys, info) => {
                    const node: any = info?.node;
                    const nextKeys = (keys || []).map((k: any) => String(k));
                    setState((prev: any) => ({
                      rightTreeSelectedKeys: {
                        ...prev.rightTreeSelectedKeys,
                        [leftTabActiveKey]: nextKeys,
                      },
                    }));

                    // ✅ 只有 level=3 才算有效选中，否则清空 selectedProject（插入按钮置灰）
                    if (!node || nextKeys.length === 0 || node.level !== 3) {
                      setState({ selectedProject: null });
                      return;
                    }

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

      {/* 弹窗：发布状态新建 */}
      <RunModal
        open={isRunModalOpen}
        id="-1"
        onCancel={() => setState({ isRunModalOpen: false })}
        onOk={() => {
          setState({ isRunModalOpen: false });
          history.push(`/case-management/case-run/-1?status=all&name=${title}`);
        }}
      />

      {/* 弹窗：返回/新建提示保存 */}
      <Modal
        title={promptModalTitle}
        open={isPromptModalOpen}
        onCancel={() =>
          setState({ isPromptModalOpen: false, promptModalType: null })
        }
        footer={[
          <Button
            key="save"
            type="primary"
            style={{ marginRight: 10 }}
            onClick={async () => {
              setState({ isPromptModalOpen: false });
              // 判断是新建保存还是编辑保存， 如果是新建保存 ，需要弹出保存弹框，如果是编辑保存直接保存
              const { code, data, message: msg } = await beforeSave();
              if (code !== 0) {
                message.error(msg || "操作失败");
                return;
              }
              const { method, tpfname } = data || {};
              if (recordId == "add") {
                if (method == "-1") {
                  setState({
                    isSaveModalOpen: true,
                    saveModalType: "save",
                    btnType: "add",
                  });
                } else {
                  const { code, message: msg } = await saveData({
                    method: 1, // 编辑保存 method=1
                    filename: tpfname,
                  });
                  if (code !== 0) {
                    message.error(msg || "操作失败");
                    return;
                  }
                  if (promptModalType === "add") {
                    // 成功后弹出新建弹窗
                    setState({ addModalOpen: true });
                  } else if (promptModalType === "back") {
                    goList();
                  }
                }
              } else {
                // 调用保存接口
                const { code, message: msg } = await saveData({
                  method: 1, // 编辑保存 method=1
                  filename: title,
                });
                if (code !== 0) {
                  message.error(msg || "操作失败");
                  return;
                }
                if (promptModalType === "add") {
                  // 成功后弹出新建弹窗
                  setState({ addModalOpen: true });
                } else if (promptModalType === "back") {
                  goList();
                }
              }
            }}
          >
            是
          </Button>,
          <Button
            key="nosave"
            danger
            style={{ marginRight: 10 }}
            onClick={() => {
              setState({ isPromptModalOpen: false });
              if (promptModalType === "add") {
                //点击否，弹出新建框
                setState({ addModalOpen: true });
              } else if (promptModalType === "back") {
                goList();
              }
            }}
          >
            否
          </Button>,
          <Button
            key="cancel"
            onClick={() =>
              setState({
                isPromptModalOpen: false,
                promptModalType: null,
                btnType: null,
              })
            }
          >
            取消
          </Button>,
        ]}
      />

      {/* 保存弹窗 */}
      <SaveModal
        open={isSaveModalOpen}
        type={saveModalType}
        id={recordId}
        onOk={() => {
          setState({ isSaveModalOpen: false });
          if (btnType === "add") {
            //表示点新建 提醒保存数据，保存成功后跳转新建
            setState({ btnType: null });
            goAdd();
            return;
          }
          if (saveModalType === "saveAs") {
            // 另存为成功后返回列表
            goList();
            return;
          }
        }}
        onCancel={() =>
          setState({ isSaveModalOpen: false, btnType: null, saveModalType: "" })
        }
      />
      {/* 新建 */}
      <RunSequenceModal
        open={addModalOpen}
        onCancel={() => {
          setState({ addModalOpen: false });
        }}
        type={"add"}
        onOk={() => {
          goAdd();
        }}
      />
    </PageContainer>
  );
};

export default Page;
