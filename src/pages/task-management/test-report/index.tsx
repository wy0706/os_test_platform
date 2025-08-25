import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  DatabaseTwoTone,
  StopTwoTone,
} from "@ant-design/icons";
import { Pie } from "@ant-design/plots";
import {
  PageContainer,
  ProDescriptions,
  ProDescriptionsActionType,
} from "@ant-design/pro-components";
import { history, useParams, useSearchParams } from "@umijs/max";
import { useSetState } from "ahooks";
import { Button, Card, Col, Row } from "antd";
import React, { useEffect, useRef } from "react";
import ReportModal from "../components/reportModal";
import { reportDetail } from "./schemas";

const Page: React.FC = () => {
  const actionRef = useRef<ProDescriptionsActionType>();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const [state, setState] = useSetState<any>({
    title: "",
    reportModalOpen: false,
    entry: "", //从工作台进入还是从任务列表的测试报告列表进入
    data: [
      { type: "成功", value: 25 },
      { type: "失败", value: 12 },
      { type: "其他", value: 5 },
    ],
    total: 0,
    successValue: 0,
  });
  const { title, reportModalOpen, entry, data, total, successValue } = state;
  // const total = data.reduce((a, b) => a + (b?.value || 0), 0);
  const config = {
    data,
    scale: {
      color: {
        relations: [
          ["失败", "#f5222d"],
          ["成功", "#52c41a"],
          ["其他", "#8c8c8c"],
        ],
      },
    },
    angleField: "value",
    colorField: "type",
    innerRadius: 0.6,
    label: {
      text: "value",
      style: {
        fontWeight: "bold",
      },

      formatter: (text: any, item: any, index: number, data: any[]) => {
        return `${((item.value / total) * 100).toFixed(2)}%`;
      },
    },
    // tooltip: {
    //   formatter: (datum: any) => {
    //     console.log("datum", datum);

    //     const percent = ((datum.value / total) * 100).toFixed(2);
    //     return {
    //       name: datum.type,
    //       value: `${datum.value} (${percent}%)`,
    //     };
    //   },
    // },
    legend: {
      color: {
        title: false,
        position: "right",
        rowPadding: 5,
      },
    },
    annotations: [
      {
        type: "text",
        style: {
          text: `${successValue}%`,
          x: "50%",
          y: "50%",
          textAlign: "center",
          fontSize: 30,
          fontStyle: "bold",
        },
      },
    ],
  };

  const cardData = [
    {
      title: "用例总数",
      value: 244,
      icon: <DatabaseTwoTone twoToneColor="#1890ff" style={{ fontSize: 32 }} />,
      bg: "linear-gradient(135deg, #e6f7ff 0%, #91d5ff 100%)",
      color: "#1890ff",
      id: 1,
    },
    {
      title: "测试成功数",
      value: 15,
      icon: (
        <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 32 }} />
      ),
      bg: "linear-gradient(135deg, #e0ffe7 0%, #b7eb8f 100%)",
      color: "#52c41a",
      id: 2,
    },
    {
      title: "测试失败数",
      value: 5,
      icon: (
        <CloseCircleTwoTone twoToneColor="#f5222d" style={{ fontSize: 32 }} />
      ),
      bg: "linear-gradient(135deg, #ffe7e7 0%, #ffccc7 100%)",
      color: "#f5222d",
      id: 3,
    },
    {
      title: "未执行数",
      value: 10,
      icon: <StopTwoTone twoToneColor="#bfbfbf" style={{ fontSize: 32 }} />,
      bg: "linear-gradient(135deg, #f5f5f5 0%, #d9d9d9 100%)",
      color: "#bfbfbf",
      id: 4,
    },
  ];
  const iconBoxStyle = (bg: string) => ({
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: bg,
    marginRight: 20,
    boxShadow: "0 2px 8px rgba(24,144,255,0.08)",
  });
  useEffect(() => {
    console.log(params, searchParams.get("entry"));
    const tol = data.reduce((a: any, b: any) => a + (b?.value || 0), 0);
    const succ = data.find((item: any) => item.type === "成功")?.value || 0;
    const successPercent = ((succ / tol) * 100).toFixed(2);
    setState({
      entry: searchParams.get("entry"),
      total: tol,
      successValue: successPercent,
    });
  }, []);

  return (
    <PageContainer
      header={{
        ghost: true,
        extra: [
          <Button
            key="1"
            onClick={() => {
              console.log("entry", entry);
              if (entry == "home") {
                history.back();
              } else {
                history.push("/task-management/test-task-one/1?tab=2");
              }
            }}
          >
            返回
          </Button>,
        ],
      }}
    >
      <Card
        title="测试信息"
        style={{ marginBottom: "10px" }}
        variant="outlined"
      >
        <ProDescriptions
          column={2}
          bordered
          columns={reportDetail}
          actionRef={actionRef}
          request={async () => {
            return Promise.resolve({
              success: true,
              data: {
                id: 1,
                title: "项目名称 ",
                unity: "测试单位",
                sampleName: "样品名称",
                version: "V1.0",
                staff: "张九九",
                testDate: "2025-08-13",
                environment: "测试环境",
                basis: "测试依据",
                conclusion: "测试结论",
                reportDate: "2025-08-20",
              },
            });
          }}
        ></ProDescriptions>
      </Card>
      <div>
        <Row gutter={16}>
          <Col span={12}>
            {" "}
            <Card title="测试结果统计">
              <div style={{ width: "100%", height: "310px" }}>
                <Pie {...config} />
              </div>
            </Card>
          </Col>
          <Col span={12}>
            {" "}
            <Card title="测试结果详情" style={{ height: "100%" }}>
              <Row gutter={[16, 8]}>
                {cardData.map((item) => (
                  <Col span={24} key={item.title}>
                    <Card
                      onClick={() => {
                        setState({
                          reportModalOpen: true,
                        });
                      }}
                      hoverable
                      style={{
                        borderRadius: 18,
                        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                        transition: "box-shadow 0.2s, transform 0.2s",
                        cursor: "pointer",
                      }}
                      styles={{ body: { padding: "10px 24px" } }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div style={iconBoxStyle(item.bg)}>{item.icon}</div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column" as const,
                            alignItems: "flex-start",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: "#888",
                              marginBottom: 3,
                            }}
                          >
                            {item.title}
                          </div>
                          <div
                            style={{
                              fontSize: 24,
                              fontWeight: 600,
                              lineHeight: 1,
                              color: item.color,
                            }}
                          >
                            {item.value}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
      <ReportModal
        open={reportModalOpen}
        onCancel={() => {
          setState({ reportModalOpen: false });
        }}
      />
    </PageContainer>
  );
};

export default Page;
