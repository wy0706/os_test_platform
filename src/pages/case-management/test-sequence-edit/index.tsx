import React, { useEffect, useState } from "react";

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
import isEqual from "lodash/isEqual";
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
    processTable: [],
    conditionsTable: [],
    resultTable: [],
    tempTable: [],
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
    conditionsTable,
    resultTable,
    tempTable,
  } = state;
  const [isDirty, setIsDirty] = useState(false); //是否修改
  const [processTableData, setProcessData] = useState(processTable);
  const [conditionsTableData, setConditionsData] = useState(conditionsTable);
  const [resultTableData, setResultData] = useState(resultTable);
  const [tempTableData, setTempData] = useState(tempTable);
  const params = useParams();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const initialProcessData = params.id === "add" ? [] : mockProcessData;
    const initialConditionsData = params.id === "add" ? [] : mockConditionsData;
    const initialResultData = params.id === "add" ? [] : mockResultTable;
    const initialTempData = params.id === "add" ? [] : mockTempTable;
    setState({
      title: searchParams.get("name"),
      processTable: initialProcessData,
      conditionsTable: initialConditionsData,
      resultTable: initialResultData,
      tempTable: initialTempData,
    });

    // 同时设置实际使用的数据状态
    setProcessData(initialProcessData);
    setConditionsData(initialConditionsData);
    setResultData(initialResultData);
    setTempData(initialTempData);

    // 设置初始数据用于脏数据检测
    setInitialData({
      processTableData: initialProcessData,
      conditionsTableData: initialConditionsData,
      resultTableData: initialResultData,
      tempTableData: initialTempData,
    });

    // console.log("路由", params, "searchParams", searchParams.get("name"));
  }, []);
  // 初始数据记录（进入页面时存一份）
  const [initialData, setInitialData] = useState<any>({
    processTableData: [],
    conditionsTableData: [],
    resultTableData: [],
    tempTableData: [],
  });

  // 检测是否修改
  useEffect(() => {
    const changed =
      !isEqual(processTableData, initialData.processTableData) ||
      !isEqual(conditionsTableData, initialData.conditionsTableData) ||
      !isEqual(resultTableData, initialData.resultTableData) ||
      !isEqual(tempTableData, initialData.tempTableData);
    setIsDirty(changed);
  }, [
    processTableData,
    conditionsTableData,
    resultTableData,
    tempTableData,
    initialData,
  ]);

  const handleGoBack = () => {
    console.log(isDirty);

    if (isDirty) {
      Modal.confirm({
        title: "当前编辑的测试项目已修改，请选择是否保存?",
        okText: "保存",
        cancelText: "不保存",
        onOk: () => {
          message.success("保存成功");
          history.back();
        },
        onCancel: () => {
          history.back();
        },
      });
    } else {
      history.back();
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
            <Button icon={<PlusOutlined />} onClick={handleAdd}>
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
            onChange={(key: any) => {
              setState({ tabActiveKey: key });
            }}
          />

          <div
            className="main-info
          "
          >
            {tabActiveKey == 1 && (
              <Process
                data={processTableData}
                onChange={(data) => {
                  setProcessData(data);
                  // 同时更新state中的数据，保持同步
                  setState({ processTable: data });
                }}
              />
            )}
            {tabActiveKey == 2 && (
              <Conditions
                data={conditionsTableData}
                onChange={(data) => {
                  setConditionsData(data);
                  // 同时更新state中的数据，保持同步
                  setState({ conditionsTable: data });
                }}
              />
            )}
            {tabActiveKey == 3 && (
              <ResultPage
                data={resultTableData}
                onChange={(data) => {
                  setResultData(data);
                  // 同时更新state中的数据，保持同步
                  setState({ resultTable: data });
                }}
              />
            )}
            {tabActiveKey == 4 && (
              <TemporaryVariables
                data={tempTableData}
                onChange={(data) => {
                  setTempData(data);
                  // 同时更新state中的数据，保持同步
                  setState({ tempTable: data });
                }}
              />
            )}
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
          // 这里需要判断是新建还是编辑，新建情况下 需要保存后获取id正在进行跳转
          // 编辑正常也是需要更新数据保存后再进行跳转
          history.push(
            `/case-management/case-run/${params.id}?status=all&name=${title}`
          );
          // 确认后跳转到运行页
        }}
      />
    </PageContainer>
  );
};

export default Page;
