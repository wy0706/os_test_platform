import React, { useEffect } from "react";

import {
  BarsOutlined,
  BookOutlined,
  CloseCircleOutlined,
  FileAddOutlined,
  FunctionOutlined,
  Loading3QuartersOutlined,
  NodeIndexOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { history, useParams, useSearchParams } from "@umijs/max";
import { useSetState } from "ahooks";
import { Button, Card, Modal, Space, Tabs } from "antd";
import RunModal from "../components/runModal";
import AddModal from "../test-sequence/components/addModal";
import Conditions from "./components/conditions";
import Process from "./components/process";
import ResultPage from "./components/result";
import TemporaryVariables from "./components/temporaryVariables";

import "./index.less";
import { mockProcessData } from "./schemas";
const Page: React.FC = () => {
  const [state, setState] = useSetState<any>({
    title: "",
    tabActiveKey: "1",
    processTable: [],
    isSaveModalOpen: false, //
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
  });
  const {
    title,
    tabActiveKey,
    processTable,
    tabItems,
    isSaveModalOpen,
    isRunModalOpen,
  } = state;
  const params = useParams();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    setState({
      title: searchParams.get("name"),
      processTable: params.id === "add" ? [] : mockProcessData,
    });
    console.log("路由", params, "searchParams", searchParams.get("name"));
  }, []);
  const handleGoBack = () => {
    history.back();
  };
  const tabChange = (key: any) => {
    setState({ tabActiveKey: key });
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
  const handleSaveAs = () => {
    setState({ isSaveModalOpen: true });
  };
  const handleAdd = () => {};
  const handleExport = () => {};
  const handleSelfCheck = () => {};
  return (
    <PageContainer
      header={{
        title: (
          <div>
            序列编辑 &nbsp; <span style={{ color: "#999" }}>【 {title} 】</span>
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
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建
            </Button>
            <Button icon={<SaveOutlined />} onClick={handleExport}>
              保存
            </Button>
            <Button icon={<FileAddOutlined />} onClick={handleSaveAs}>
              另存为
            </Button>
            <Button icon={<CloseCircleOutlined />} onClick={handleErrorCheck}>
              错误检查
            </Button>
            <Button
              icon={<Loading3QuartersOutlined />}
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
            onChange={tabChange}
          />

          <div
            className="main-info
          "
          >
            {tabActiveKey == 1 && (
              <Process
                data={processTable}
                onMoveRow={(index, data) => {
                  console.log(
                    "onMoveRow",
                    index,
                    data,
                    "processTable",
                    processTable
                  );
                }}
                onSaveData={(data) => {
                  console.log("onSaveData", data, "processTable", processTable);
                }}
                onAddRow={(index, data) => {
                  console.log(
                    "onAddRow",
                    index,
                    data,
                    "processTable",
                    processTable
                  );
                }}
              />
            )}
            {tabActiveKey == 2 && <Conditions />}
            {tabActiveKey == 3 && <ResultPage />}
            {tabActiveKey == 4 && <TemporaryVariables />}
          </div>
        </div>
      </div>
      {/* 另存为 */}
      <AddModal
        open={isSaveModalOpen}
        type="save"
        onCancel={() => {
          setState({
            isSaveModalOpen: false,
          });
        }}
        onOk={() => {
          setState({
            isSaveModalOpen: false,
          });
          // 这里需要确认点击确认后是关闭当前序列编辑页面返回列表还是其他操作
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
          // 确认后跳转到运行页
        }}
      />
    </PageContainer>
  );
};

export default Page;
