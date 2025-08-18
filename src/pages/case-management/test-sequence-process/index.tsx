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
import isEqual from "lodash/isEqual";
import React, { useEffect, useState } from "react";
import EditModal from "./components/editModal";
import PostPage from "./components/postPage";
import PrePage from "./components/prePage";
import UutPage from "./components/uutPage";
import "./index.less";
import { preTable } from "./schemas";
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
    isEditModalOpen: false,
    isEditAll: false, //是否编辑所有测试条件
  });
  const {
    title,
    tabLeftItems,
    leftTabActiveKey,
    tabRightItems,
    rightTabActiveKey,
    isEditAll,
    isEditModalOpen,
    editType,
    editValue,
  } = state;

  const [preTableData, setPreData] = useState(preTable);
  const [isDirty, setIsDirty] = useState(false); //是否修改
  const [searchParams] = useSearchParams();
  const params = useParams();

  // 初始数据记录（进入页面时存一份）
  const [initialData, setInitialData] = useState<any>({
    preTableData: [],
  });

  useEffect(() => {
    const initialPreData = params.id === "add" ? [] : preTable;
    setState({
      title: params.id === "add" ? "" : searchParams.get("name") || "",
      preTable: initialPreData,
    });
    // 同时设置实际使用的数据状态
    setPreData(initialPreData);
    // 设置初始数据用于脏数据检测
    setInitialData({
      preTableData: initialPreData,
    });
    // console.log("路由", params, "searchParams", searchParams.get("name"));
  }, []);
  // 检测是否修改
  useEffect(() => {
    const changed = !isEqual(preTableData, initialData.preTableData);
    setIsDirty(changed);
  }, [preTableData]);

  const handleGoBack = () => {
    console.log(isDirty);

    if (isDirty) {
      Modal.confirm({
        title: "文件已经改动是否需要保存 ?",
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

  const handleImport = () => {
    // message.info("导入功能");
  };
  const handleAdd = () => {};
  const handleSelfCheck = () => {};
  const handleExport = () => {
    // message.info("导出功能");
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

              <Button icon={<SaveOutlined />} onClick={handleExport}>
                保存
              </Button>
              <Button icon={<FileAddOutlined />} onClick={handleExport}>
                另存为
              </Button>
              {/* 复制   粘贴    剪切  */}
              <Button icon={<CheckCircleOutlined />} onClick={handleSelfCheck}>
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
                onChange={(key: any) => {
                  setState({ leftTabActiveKey: key });
                }}
              />
              <div style={{ padding: "10px" }}>
                {leftTabActiveKey == 1 && (
                  <PrePage
                    onChange={(data) => {
                      setPreData(data);
                    }}
                    data={preTableData}
                    onEdit={(values, type) => {
                      console.log(values, type);
                      setState({
                        isEditModalOpen: true,
                        editValue: { ...values },
                        editType: type,
                      });
                    }}
                  />
                )}
                {leftTabActiveKey == 2 && <UutPage />}
                {leftTabActiveKey == 3 && <PostPage />}
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

            <div>内容</div>
          </div>
        </div>
      </div>
      <EditModal
        open={isEditModalOpen}
        updateValue={editValue}
        type={editType}
        onCancel={() => {
          console.log(isEditModalOpen);
          setState({ isEditModalOpen: false });
        }}
        onOk={(values) => {
          console.log("valuds", values);
          setState({ isEditModalOpen: false });
        }}
      />
    </PageContainer>
  );
};

export default Page;
