import {
  getErrorCheck,
  saveData,
  setNewOrBack,
} from "@/services/case-management/test-sequence-edit.service";
import React, { useEffect } from "react";

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
import { isArray } from "lodash";
import PromptModal from "../components/promptModal";
import RunModal from "../components/runModal";
import AddModal from "../test-sequence/components/addModal";
import Conditions from "./components/conditions";
import Process from "./components/process";
import ResultPage from "./components/result";
import TemporaryVariables from "./components/temporaryVariables";
import "./index.less";

const Page: React.FC = () => {
  const [state, setState] = useSetState<any>({
    title: "",
    tabActiveKey: "1",
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
        label: "测试结果", //测试结果
        icon: <BookOutlined />,
      },
      {
        key: "4",
        label: "临时变量",
        icon: <FunctionOutlined />,
      },
    ],
    isDirty: false,
    isRelease: false, //是否为已发布
    isPromptModalOpen: false, //
    promptModalType: null, // 2）如果文件为未发布且已经改动 code：1  message：文件已经改动，需要保存吗？文件流程为空  code：2  ，message：尚未创建测试流程
    autoId: null,
    isSaveAsModalOpen: false, //另存为
    addModalType: "",
    selectedId: null,
    errorCheckLoading: false,
    addLoading: false,
    saveLoading: false,
    saveAsLoading: false,
    sequenceName: null, //文件名
    infoMsg: null,
    selectedKeeper: {
      process: { id: null as number | null, index: -1 },
      conditions: { id: null as number | null, index: -1 },
      result: { id: null as number | null, index: -1 },
      temp: { id: null as number | null, index: -1 },
    },
  });
  const {
    title,
    tabActiveKey,
    tabItems,
    isPromptModalOpen,
    isRunModalOpen,
    isDirty,
    isRelease,
    promptModalType,
    autoId,
    isSaveAsModalOpen,
    addModalType,
    selectedId,
    errorCheckLoading,
    addLoading,
    saveLoading,
    saveAsLoading,
    sequenceName,
    infoMsg,
  } = state;

  const params = useParams();
  const [searchParams] = useSearchParams();
  const updateSelected = (
    tab: "process" | "conditions" | "result" | "temp",
    id: number | null,
    index: number
  ) => {
    setState((prev: any) => ({
      selectedKeeper: {
        ...prev.selectedKeeper,
        [tab]: { id, index },
      },
    }));
  };
  useEffect(() => {
    handleTabChange("1");
    let release =
      params.id === "add"
        ? false
        : searchParams.get("status") === "True"
        ? true
        : false;
    const group = searchParams.get("group");
    const sequence = searchParams.get("sequence");

    setState({
      title: params.id === "add" ? "" : `${group} / ${sequence}`,
      isRelease: release,
      autoId: params.id,
      selectedId: searchParams.get("selectedId"),
      sequenceName: sequence,
    });
  }, [params.id]);

  const handleTabChange = (key: string) => {
    setState({ tabActiveKey: key });
  };

  const goList = () => {
    history.push(`/case-management/test-sequence?id=${selectedId}`);
  };

  const handleGoBack = async () => {
    if (!sequenceName || sequenceName.trim() === "") {
      message.info("序列名称不能为空");
      return;
    }
    const { code, message: msg } = await setNewOrBack({
      sequence_name: sequenceName,
    });
    if (code === 0) {
      goList();
      return;
    } else if (code === 1 || code === 2) {
      setState({
        promptModalType: code,
        isPromptModalOpen: true,
        infoMsg: msg || null,
      });
    } else {
      message.error(msg || "操作失败");
      setState({
        infoMsg: null,
      });
    }
  };

  const handleErrorCheck = async () => {
    // 如果均检查正确
    try {
      setState({ errorCheckLoading: true });
      const { code, data, message: msg } = await getErrorCheck();

      if (code !== 0) {
        // 如果检查有误，展示错误信息
        Modal.error({
          title: "以下参数设置错误，请重新设置",
          content:
            data && isArray(data) ? (
              data.map((item) => <div key={item}>{item}</div>)
            ) : (
              <div>{data || "-"}</div>
            ),
          okText: "确定",
        });
        return;
      }
      Modal.info({
        title: "流程完整性检查！",
        content: "所有有效参数均设置正确！",
        okText: "确定",
      });
    } catch (error) {
    } finally {
      setState({ errorCheckLoading: false });
    }
  };
  const goAdd = (group: any, sequence: any) => {
    history.push(
      `/case-management/test-sequence-edit/add?group=${group}&sequence=${sequence}&selectedId=${selectedId}`
    );
    window.location.reload();
  };
  // 新建
  const handleAdd = async () => {
    try {
      setState({
        addLoading: true,
      });

      if (!sequenceName || sequenceName.trim() === "") {
        message.info("序列名称不能为空");
        return;
      }
      const { code, message: msg } = await setNewOrBack({
        sequence_name: sequenceName,
      });
      if (code === 0) {
        //文件已保存支持新建，直接弹出新建Modal
        setState({
          addModalType: "add",
          isSaveAsModalOpen: true,
        });
      } else if (code === 1) {
        //文件已改动，且未保存
        Modal.confirm({
          title: "提示",
          content: msg
            ? `${msg} 如果当前编辑的测试项目尚未保存，新建后当前数据将丢失，确定要打开另一个测试项目吗？`
            : "您正在编辑一个测试项目，如果当前编辑的测试项目尚未保存，新建后当前数据将丢失，确定要打开另一个测试项目吗？",
          onOk: () => {
            setState({
              addModalType: "add",
              isSaveAsModalOpen: true,
            });
          },
        });
        return;
      } else {
        message.error(msg || "操作失败");
      }
    } catch (e) {
    } finally {
      setState({
        addLoading: false,
      });
    }
  };
  // 另存为
  const handleSaveAs = async () => {
    try {
      setState({
        saveAsLoading: true,
      });
      await saveAndErrorCheck();
      setState({ isSaveAsModalOpen: true, addModalType: "saveAs" });
    } catch (e) {
    } finally {
      setState({
        saveAsLoading: false,
      });
    }
  };

  const hasAlreadyExists = (text?: string) => {
    Modal.confirm({
      title: "提示",
      content: text
        ? `${text} 无需保存，请选择 "取消" `
        : `此测试项目已存在，且已发布，不能保存！如需保存，请选择 "另存为" 重新命名后保存；无需保存，请选择 "取消" `,
      okText: "另存为",
      onOk: () => {
        handleSaveAs();
      },
    });
  };
  const saveRequest = async (type?: string) => {
    if (!sequenceName || sequenceName.trim() === "") {
      message.info("序列名称不能为空");
      return;
    }
    const { code, message: msg } = await saveData({
      sequence_name: sequenceName,
    });
    if (code === 1) {
      hasAlreadyExists(msg); // 已发布
      return;
    } else if (code === 0) {
      message.success("保存成功");

      type === "JUMP" && goList(); //返回上一页
    } else {
      message.error(msg || "保存失败");
    }
  };
  // 保存
  const handleSave = async () => {
    // 已发布直接提示
    if (state.isRelease) {
      hasAlreadyExists();
      return;
    }

    try {
      setState({
        saveLoading: true,
      });
      await saveAndErrorCheck();
      await saveRequest();
    } catch (e) {
    } finally {
      setState({
        saveLoading: false,
      });
    }
  };
  const saveAndErrorCheck = async () => {
    const { code, data, message: msg } = await getErrorCheck();
    if (code !== 0) {
      // 如果检查有误，展示错误信息
      Modal.error({
        title: "以下参数设置错误，请重新设置",
        content:
          data && isArray(data) ? (
            data.map((item) => <div key={item}>{item}</div>)
          ) : (
            <div>{data || "-"}</div>
          ),
        okText: "确定",
      });
      throw new Error("参数校验失败");
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
            <Button
              icon={<PlusOutlined />}
              onClick={handleAdd}
              loading={addLoading}
            >
              新建
            </Button>
            <Button
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saveLoading}
            >
              保存
            </Button>
            <Button
              icon={<FileAddOutlined />}
              onClick={handleSaveAs}
              loading={saveAsLoading}
            >
              另存为
            </Button>
            <Button
              icon={<CloseCircleOutlined />}
              loading={errorCheckLoading}
              onClick={handleErrorCheck}
            >
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
            activeKey={tabActiveKey}
            items={tabItems}
            onChange={handleTabChange}
          />

          <div className="main-info">
            {tabActiveKey === "1" && (
              <Process
                selectedId={state.selectedKeeper.process.id}
                onSelectedChange={(id, idx) =>
                  updateSelected("process", id, idx)
                }
              />
            )}
            {tabActiveKey === "2" && (
              <Conditions
                selectedId={state.selectedKeeper.conditions.id}
                onSelectedChange={(id, idx) =>
                  updateSelected("conditions", id, idx)
                }
              />
            )}
            {tabActiveKey === "3" && (
              <ResultPage
                selectedId={state.selectedKeeper.result.id}
                onSelectedChange={(id, idx) =>
                  updateSelected("result", id, idx)
                }
              />
            )}
            {tabActiveKey === "4" && (
              <TemporaryVariables
                selectedId={state.selectedKeeper.temp.id}
                onSelectedChange={(id, idx) => updateSelected("temp", id, idx)}
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
        currentNode={selectedId}
        onOk={(values) => {
          // 1、如果是另存为：这里需要确认点击确认后是关闭当前序列编辑页面返回列表还是其他操作
          // 2、如果是新建 这里需要跳转到新建页面 goAdd()
          setState({
            isSaveAsModalOpen: false,
          });
          if (addModalType == "saveAs") {
            goList();
          } else {
            // 新建 这里需要跳转到新建页面 goAdd()
            const { tigroup, sequence_name } = values;
            const group = tigroup || "-";
            const sequence = sequence_name || "-";
            goAdd(group, sequence);
          }
        }}
      />
      {/* 运行 */}
      <RunModal
        open={isRunModalOpen}
        onCancel={() => {
          setState({ isRunModalOpen: false });
        }}
        id="-1"
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
        title={infoMsg}
        onCancel={() => {
          setState({
            isPromptModalOpen: false,
            infoMsg: null,
          });
        }}
        onNo={() => {
          // 不保存直接返回
          setState({
            isPromptModalOpen: false,
            infoMsg: null,
          });
          goList();
        }}
        onOk={async () => {
          if (promptModalType === 1) {
            //需要保存，先检查错误后保存再跳转
            try {
              await saveAndErrorCheck();
              saveRequest("JUMP");
            } catch {
            } finally {
              setState({
                isPromptModalOpen: false,
                infoMsg: null,
              });
            }
          } else if (promptModalType === 2) {
            goList();
          }
        }}
      />
    </PageContainer>
  );
};

export default Page;
