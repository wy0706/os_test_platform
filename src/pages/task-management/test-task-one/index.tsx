import { PageContainer } from "@ant-design/pro-components";
import { history, useParams, useSearchParams } from "@umijs/max";
import { useSetState } from "ahooks";
import { Button, Tabs, type TabsProps } from "antd";
import React, { useEffect } from "react";
import ReportListTab from "./components/reportListTab";
import TaskTab from "./components/taskTab";
import { schemasTitle } from "./schemas";

const items: TabsProps["items"] = [
  {
    key: "1",
    label: "测试任务",
  },
  {
    key: "2",
    label: "测试报告",
  },
];
const Page: React.FC = () => {
  const [state, setState] = useSetState<any>({
    title: schemasTitle,
    tabActiveKey: "2",
  });

  const [searchParams] = useSearchParams();
  const params = useParams();
  useEffect(() => {
    const tab = searchParams.get("tab") || "1";
    console.log("params", params);
    setState((prev) => ({
      ...prev,
      tabActiveKey: tab,
    }));
  }, [searchParams]);

  const { tabActiveKey, title } = state;
  return (
    <PageContainer
      header={{
        ghost: true,
        extra: [
          <Button
            key="1"
            onClick={() => {
              history.back();
            }}
          >
            返回
          </Button>,
        ],
      }}
    >
      <Tabs
        activeKey={tabActiveKey}
        items={items}
        onChange={(key) => {
          setState({
            tabActiveKey: key,
          });
        }}
      />

      {tabActiveKey === "1" && <TaskTab />}
      {tabActiveKey === "2" && <ReportListTab />}
    </PageContainer>
  );
};

export default Page;
