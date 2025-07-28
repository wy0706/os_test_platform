import {
  CheckCircleTwoTone,
  DatabaseTwoTone,
  PlayCircleTwoTone,
  ProfileTwoTone,
  StopTwoTone,
} from "@ant-design/icons";
import { Pie } from "@ant-design/plots";
import { GridContent, PageContainer } from "@ant-design/pro-components";
import { Card, Col, Row } from "antd";
import React from "react";

const cardData = [
  {
    title: "设备",
    value: 5,
    icon: <DatabaseTwoTone twoToneColor="#52c41a" style={{ fontSize: 32 }} />,
    bg: "linear-gradient(135deg, #e0ffe7 0%, #b7eb8f 100%)",
    color: "#52c41a",
  },
  {
    title: "测试用例",
    value: 5,
    icon: <ProfileTwoTone twoToneColor="#1890ff" style={{ fontSize: 32 }} />,
    bg: "linear-gradient(135deg, #e6f7ff 0%, #91d5ff 100%)",
    color: "#1890ff",
  },
  {
    title: "未启动任务",
    value: 10,
    icon: <StopTwoTone twoToneColor="#bfbfbf" style={{ fontSize: 32 }} />,
    bg: "linear-gradient(135deg, #f5f5f5 0%, #d9d9d9 100%)",
    color: "#bfbfbf",
  },
  {
    title: "执行中任务",
    value: 2,
    icon: <PlayCircleTwoTone twoToneColor="#1890ff" style={{ fontSize: 32 }} />,
    bg: "linear-gradient(135deg, #e6f7ff 0%, #91d5ff 100%)",
    color: "#1890ff",
  },
  {
    title: "已完成任务",
    value: 15,
    icon: (
      <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 32 }} />
    ),
    bg: "linear-gradient(135deg, #e0ffe7 0%, #b7eb8f 100%)",
    color: "#52c41a",
  },
];

const DemoPie = () => {
  const config = {
    data: [
      { type: "未启动", value: 27 },
      { type: "执行中", value: 25 },
      { type: "只完成", value: 18 },
    ],
    angleField: "value",
    colorField: "type",
    color: ["#bfbfbf", "#448ef7", "#72c240"],

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
  };
  return <Pie {...config} />;
};

const iconBoxStyle = (bg: string) => ({
  width: 56,
  height: 56,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background: bg,
  marginRight: 20,
  boxShadow: "0 2px 8px rgba(24,144,255,0.08)",
});
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

const cardStyle = {
  minHeight: 110,
  borderRadius: 18,
  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  transition: "box-shadow 0.2s, transform 0.2s",
  cursor: "pointer",
};

const cardBodyStyle = {
  padding: 24,
};

const Welcome: React.FC = () => {
  return (
    <PageContainer title="">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 24 }}>
          欢迎使用自动化测试平台
        </h2>
        {/* <div>一站式管理测试用例、设备与任务，提升测试效率</div> */}
      </div>
      {/* 欢迎使用自动化测试平台 */}
      {/* 一站式管理测试用例、设备与任务，提升测试效率 */}
      <GridContent>
        {/* 第一行：设备、测试用例 + 空占位卡片 */}
        <Row gutter={[32, 32]} style={{ marginBottom: 0 }}>
          {cardData.slice(0, 2).map((item) => (
            <Col
              xl={8}
              lg={8}
              md={8}
              sm={24}
              xs={24}
              key={item.title}
              style={{ marginBottom: 32 }}
            >
              <Card
                hoverable
                style={cardStyle as React.CSSProperties}
                styles={{ body: cardBodyStyle }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 8px 32px rgba(24,144,255,0.15)";
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-4px)";
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 4px 24px rgba(0,0,0,0.06)";
                  (e.currentTarget as HTMLDivElement).style.transform = "none";
                }}
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
          {/* 空占位卡片 */}
          <Col
            xl={8}
            lg={8}
            md={8}
            sm={24}
            xs={24}
            style={{ marginBottom: 32 }}
          >
            <Card
              hoverable={false}
              style={{
                minHeight: 110,
                borderRadius: 18,
                boxShadow: "none",
                background: "transparent",
                cursor: "default",
                border: "none",
              }}
              styles={{ body: { padding: 24 } }}
            />
          </Col>
        </Row>
        {/* 第二行：未启动任务、执行中任务、已完成任务 */}
        <Row gutter={[32, 32]}>
          {cardData.slice(2).map((item) => (
            <Col
              xl={8}
              lg={8}
              md={8}
              sm={24}
              xs={24}
              key={item.title}
              style={{ marginBottom: 32 }}
            >
              <Card
                hoverable
                style={cardStyle as React.CSSProperties}
                styles={{ body: cardBodyStyle }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 8px 32px rgba(24,144,255,0.15)";
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-4px)";
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 4px 24px rgba(0,0,0,0.06)";
                  (e.currentTarget as HTMLDivElement).style.transform = "none";
                }}
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
        <Row>
          <Col xl={12} lg={12} md={12} sm={24} xs={24}>
            <Card hoverable>
              <DemoPie />
            </Card>
          </Col>
        </Row>
      </GridContent>
    </PageContainer>
  );
};

export default Welcome;
