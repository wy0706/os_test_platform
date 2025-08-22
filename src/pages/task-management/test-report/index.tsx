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
const cardStyle = {
  borderRadius: 18,
  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  transition: "box-shadow 0.2s, transform 0.2s",
  cursor: "pointer",
};
const infoBoxStyle = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "flex-start",
  justifyContent: "center",
};
const titleStyle = {
  fontSize: 14,
  fontWeight: 500,
  color: "#888",
  marginBottom: 6,
};
const valueStyle = {
  fontSize: 32,
  fontWeight: 900,
  lineHeight: 1.1,
};
const Page: React.FC = () => {
  const actionRef = useRef<ProDescriptionsActionType>();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const config = {
    data: [
      { type: "Success", value: 25 },
      { type: "Error", value: 27 },
      { type: "Other", value: 18 },
    ],
    scale: {
      color: {
        relations: [
          ["Error", "#f5222d"],
          ["Success", "#52c41a"],
          ["Other", "#8c8c8c"],
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
    },
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
          text: "25",
          x: "50%",
          y: "50%",
          textAlign: "center",
          fontSize: 40,
          fontStyle: "bold",
        },
      },
    ],
  };

  const [state, setState] = useSetState<any>({
    title: "",
    reportModalOpen: false,
    entry: "", //从工作台进入还是从任务列表的测试报告列表进入
  });
  const { title, reportModalOpen, entry } = state;
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
    width: 44,
    height: 44,
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
    setState({
      entry: searchParams.get("entry"),
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
              <div>
                <Pie {...config} />
              </div>
            </Card>
          </Col>
          <Col span={12}>
            {" "}
            <Card title="测试结果详情" style={{ height: "100%" }}>
              <Row gutter={[16, 16]}>
                {cardData.map((item) => (
                  <Col span={24} key={item.title}>
                    <Card
                      onClick={() => {
                        setState({
                          reportModalOpen: true,
                        });
                      }}
                      hoverable
                      style={cardStyle as React.CSSProperties}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div style={iconBoxStyle(item.bg)}>{item.icon}</div>
                        <div style={infoBoxStyle}>
                          <div style={titleStyle}>{item.title}</div>
                          <div style={{ ...valueStyle, color: item.color }}>
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
