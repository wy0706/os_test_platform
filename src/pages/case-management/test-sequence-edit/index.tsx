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
import { Button, Card, Space, Tabs } from "antd";
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
        children: <Conditions />,
      },
      {
        key: "3",
        label: "测试结束", //测试结果
        icon: <BookOutlined />,
        children: <ResultPage />,
      },
      {
        key: "4",
        label: "临时变量",
        icon: <FunctionOutlined />,
        children: <TemporaryVariables />,
      },
    ],
  });
  const { title, tabActiveKey, processTable, tabItems } = state;
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
            <Button icon={<FileAddOutlined />} onClick={handleExport}>
              另存为
            </Button>
            <Button icon={<CloseCircleOutlined />}>错误检查</Button>
            <Button icon={<Loading3QuartersOutlined />}>运行</Button>
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
            {tabActiveKey == 1 && <Process data={processTable} />}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Page;
