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
import React, { useEffect, useRef } from "react";

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
type PromptSource = "back" | "add" | "run" | null;

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
  const recordId = params.id as string;

  const preRef = useRef<PreRef>(null);
  const uutRef = useRef<UutRef>(null);
  const postRef = useRef<PostRef>(null);

  const [state, setState] = useSetState<any>({
    title: "",
    leftTabActiveKey: "UUT" as LeftTabKey,
    rightTabActiveKey: "project" as RightTabKey,
    isEditAll: false,

    // 右侧树：每个左侧Tab单独保存选中keys（切换右侧tab回来可恢复高亮）
    rightTreeSelectedKeys: {
      Pre: [],
      UUT: [],
      Post: [],
    } as Record<LeftTabKey, React.Key[]>,

    // 当前左侧tab选中的树节点（只在测试序列tab用，插入依赖它）
    selectedProject: null as null | { key: string; title: string; id: string },

    // 每个左侧tab表格选中的行（TestCondition/TestResult 依赖）
    selectedRowByTab: {
      Pre: null,
      UUT: null,
      Post: null,
    } as Record<LeftTabKey, any>,

    // Prompt（是否保存）
    isPromptModalOpen: false,
    promptModalTitle: "",
    promptSource: null as PromptSource,

    // SaveModal（保存/另存为）
    isSaveModalOpen: false,
    saveModalType: "" as "save" | "saveAs" | "",
    saveModalSource: null as Exclude<PromptSource, "run"> | null,

    // 运行弹窗
    isRunModalOpen: false,

    // loading
    addLoading: false,
    saveLoading: false,
    saveAsLoading: false,
    backLoading: false,

    // 新建弹窗
    addModalOpen: false,
  });

  const {
    title,
    leftTabActiveKey,
    rightTabActiveKey,
    isEditAll,
    selectedProject,
    rightTreeSelectedKeys,
    selectedRowByTab,

    isPromptModalOpen,
    promptModalTitle,
    promptSource,

    isSaveModalOpen,
    saveModalType,
    saveModalSource,

    isRunModalOpen,

    addLoading,
    saveLoading,
    saveAsLoading,
    backLoading,

    addModalOpen,
  } = state;

  const activeSelectedRow = selectedRowByTab[leftTabActiveKey];
  const activeTreeKeys = rightTreeSelectedKeys[leftTabActiveKey] || [];

  const getActiveRef = () => {
    if (leftTabActiveKey === "Pre") return preRef;
    if (leftTabActiveKey === "UUT") return uutRef;
    return postRef;
  };

  const goList = () =>
    history.push("/case-management/test-sequence-integration");

  const goAdd = () => {
    history.push("/case-management/test-sequence-process/add");
    window.location.reload();
  };

  // 只读取文件名（不再处理 isRelease）
  useEffect(() => {
    setState({
      title: recordId === "add" ? "" : searchParams.get("name") || "",
    });
  }, [recordId, searchParams, setState]);

  /** 关闭提示保存弹窗（防止 source 残留） */
  const closePrompt = () => {
    setState({
      isPromptModalOpen: false,
      promptSource: null,
      promptModalTitle: "",
    });
  };

  /** 关闭保存弹窗（统一清理状态） */
  const closeSaveModal = () => {
    setState({
      isSaveModalOpen: false,
      saveModalType: "",
      saveModalSource: null,
    });
  };

  /** 左侧 tab 切换 */
  const handleLeftTabChange = (key: LeftTabKey) => {
    setState({ leftTabActiveKey: key });
  };

  /** 右侧 tab 切换 */
  const handleRightTabChange = (key: RightTabKey) => {
    setState({ rightTabActiveKey: key });
  };

  /** 子页面选中行回传 */
  const handleSelectionChange = (tab: LeftTabKey, row: any | null) => {
    setState((prev: any) => ({
      selectedRowByTab: { ...prev.selectedRowByTab, [tab]: row },
    }));
  };

  /** 插入：把树节点传给当前 tab 页面 */
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

  /** 打开“是否保存”提示框 */
  const openPrompt = (source: Exclude<PromptSource, null>, msg?: string) => {
    setState({
      isPromptModalOpen: true,
      promptSource: source,
      promptModalTitle: msg || "文件已经改动，需要保存吗？",
    });
  };

  /**
   * 保存（保存 / 另存为）
   * - 新建：beforeSave 决定是否弹 SaveModal
   * - 编辑：save 直接调用 saveData，saveAs 弹 SaveModal
   */
  const handleSave = async (type: "save" | "saveAs") => {
    try {
      if (type === "save") setState({ saveLoading: true });
      else setState({ saveAsLoading: true });

      // 新建文件：beforeSave 判断
      if (recordId === "add") {
        const { code, data, message: msg } = await beforeSave();
        if (code !== 0) {
          message.error(msg || "操作失败");
          return;
        }

        const { tpfname, method } = data || {};

        // method == -1：后端要求弹保存框
        if (String(method) === "-1") {
          if (type === "save") {
            setState({
              isSaveModalOpen: true,
              saveModalType: "save",
              saveModalSource: null,
            });
          } else {
            message.info("请先保存文件，再进行另存为操作！");
          }
          return;
        }

        // 可直接保存
        if (type === "save") {
          const { code: c2, message: m2 } = await saveData({
            method: 1,
            filename: tpfname,
          });
          if (c2 !== 0) {
            message.error(m2 || "操作失败");
            return;
          }
          message.success(m2 || "操作成功");
          return;
        }

        // saveAs：弹另存为
        setState({
          isSaveModalOpen: true,
          saveModalType: "saveAs",
          saveModalSource: null,
        });
        return;
      }

      // 编辑文件：saveAs 弹框；save 直接保存
      if (type === "saveAs") {
        setState({
          isSaveModalOpen: true,
          saveModalType: "saveAs",
          saveModalSource: null,
        });
        return;
      }

      const { code, message: msg } = await saveData({
        method: 1,
        filename: title,
      });
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");
    } finally {
      setState({ saveLoading: false, saveAsLoading: false });
    }
  };

  /**
   * 返回：后端判断是否需要提示保存
   */
  const handleGoBack = async () => {
    try {
      setState({ backLoading: true });
      const { code, message: msg } = await beforeBack();

      if (code === 0) {
        goList();
        return;
      }
      // ✅ 防止后端返回 number/string 混用
      if (String(code) === "-1") {
        openPrompt("back", msg);
        return;
      }
      message.error(msg || "操作失败");
    } finally {
      setState({ backLoading: false });
    }
  };

  /**
   * 新建：后端判断是否需要提示保存
   */
  const handleAdd = async () => {
    try {
      setState({ addLoading: true });
      const { code, message: msg } = await beforeAdd();

      if (code === 0) {
        setState({ addModalOpen: true });
        return;
      }
      if (code === 1) {
        openPrompt("add", msg);
        return;
      }
      message.error(msg || "操作失败");
    } finally {
      setState({ addLoading: false });
    }
  };

  const handleRun = () => {
    setState({ isRunModalOpen: true });
  };

  /**
   * PromptModal 点“是”：执行保存，再根据 source 继续动作
   * - 新建：method==-1 则打开 SaveModal，并把 saveModalSource 记录下来
   */
  const handlePromptSaveAndNext = async () => {
    const source = promptSource;
    closePrompt();

    const { code, data, message: msg } = await beforeSave();
    if (code !== 0) {
      message.error(msg || "操作失败");
      return;
    }

    const { method, tpfname } = data || {};

    // 新建：可能需要弹保存框
    if (recordId === "add") {
      if (String(method) === "-1") {
        setState({
          isSaveModalOpen: true,
          saveModalType: "save",
          saveModalSource: source === "run" ? null : source,
        });
        return;
      }

      const { code: c2, message: m2 } = await saveData({
        method: 1,
        filename: tpfname,
      });
      if (c2 !== 0) {
        message.error(m2 || "操作失败");
        return;
      }

      message.success(m2 || "操作成功");
      if (source === "add") setState({ addModalOpen: true });
      if (source === "back") goList();
      return;
    }

    // 编辑保存
    const { code: c3, message: m3 } = await saveData({
      method: 1,
      filename: title,
    });
    if (c3 !== 0) {
      message.error(m3 || "操作失败");
      return;
    }

    message.success(m3 || "操作成功");
    if (source === "add") setState({ addModalOpen: true });
    if (source === "back") goList();
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
          <Button key="back" onClick={handleGoBack} loading={backLoading}>
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
                    recordId={recordId}
                    selectedProject={selectedProject}
                    onSelectionChange={handleSelectionChange}
                  />
                )}

                {leftTabActiveKey === "UUT" && (
                  <UutPage
                    ref={uutRef}
                    recordId={recordId}
                    selectedProject={selectedProject}
                    onSelectionChange={handleSelectionChange}
                  />
                )}

                {leftTabActiveKey === "Post" && (
                  <PostPage
                    ref={postRef}
                    recordId={recordId}
                    selectedProject={selectedProject}
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

                    // 保存每个左侧tab的树选中 keys
                    setState((prev: any) => ({
                      rightTreeSelectedKeys: {
                        ...prev.rightTreeSelectedKeys,
                        [leftTabActiveKey]: nextKeys,
                      },
                    }));

                    // 非 level=3 视为无效选中：清空 selectedProject（插入按钮置灰）
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

      {/* 运行弹窗 */}
      <RunModal
        open={isRunModalOpen}
        id="-2"
        onCancel={() => setState({ isRunModalOpen: false })}
        onOk={() => {
          setState({ isRunModalOpen: false });
          history.push(`/case-management/case-run/-2?status=all&name=${title}`);
        }}
      />

      {/* 返回/新建提示保存 */}
      <Modal
        title={promptModalTitle}
        open={isPromptModalOpen}
        onCancel={closePrompt}
        footer={[
          <Button
            key="save"
            type="primary"
            style={{ marginRight: 10 }}
            onClick={handlePromptSaveAndNext}
          >
            是
          </Button>,
          <Button
            key="nosave"
            danger
            style={{ marginRight: 10 }}
            onClick={() => {
              const source = promptSource;
              closePrompt();
              if (source === "add") setState({ addModalOpen: true });
              if (source === "back") goList();
            }}
          >
            否
          </Button>,
          <Button key="cancel" onClick={closePrompt}>
            取消
          </Button>,
        ]}
      />

      {/* 保存/另存为弹窗 */}
      <SaveModal
        open={isSaveModalOpen}
        type={saveModalType}
        id={recordId}
        onOk={() => {
          const source = saveModalSource;
          const type = saveModalType;
          closeSaveModal();

          // 保存弹窗来源只处理 back/add（run 不走这里）
          if (source === "add") {
            goAdd();
            return;
          }
          if (source === "back") {
            goList();
            return;
          }

          // 独立另存为：完成后回列表
          if (type === "saveAs") {
            goList();
          }
        }}
        onCancel={closeSaveModal}
      />

      {/* 新建弹窗 */}
      <RunSequenceModal
        open={addModalOpen}
        onCancel={() => setState({ addModalOpen: false })}
        type="add"
        onOk={() => goAdd()}
      />
    </PageContainer>
  );
};

export default Page;
