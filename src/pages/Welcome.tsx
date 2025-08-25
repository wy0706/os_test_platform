import { Pie } from "@ant-design/charts";
import {
  BookOutlined,
  FileDoneOutlined,
  HddOutlined,
  ProfileTwoTone,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { history } from "@umijs/max";
import { useSetState } from "ahooks";
import { Card, Col, Row } from "antd";
import React from "react";
import AddTaskModal from "./task-management/test-task/components/addModal";
import TaskListModal from "./task-management/test-task/components/taskListModal";
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

const titleStyle = {
  fontSize: 14,
  fontWeight: 500,
  color: "#888",
};

const cardStyle = {
  minHieht: 60,
  borderRadius: 18,
  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  transition: "box-shadow 0.2s, transform 0.2s",
  cursor: "pointer",
};

const cardBodyStyle = {
  padding: 18,
};

const Welcome: React.FC = () => {
  const [state, setState] = useSetState<any>({
    isNewTaskModalOpen: false,
    isTaskListModalOPen: false,
  });

  const { isNewTaskModalOpen, isTaskListModalOPen } = state;
  const handleFast = (item: any) => {
    console.log("item", item);
    // return;
    switch (item.key) {
      case "newTask":
        setState({
          isNewTaskModalOpen: true,
        });
        return;
      case "useCase":
        history.push("/case-management/case-library");
        return;
      case "testReport":
        setState({
          isTaskListModalOPen: true,
        });
        return;
      case "log":
        history.push("/log-management/test-log");
        return;
      default:
        return;
    }
  };

  const config = {
    data: [
      { type: "未开始", value: 27 },
      { type: "进行中", value: 25 },
      { type: "完成", value: 18 },
    ],
    scale: {
      color: {
        relations: [
          ["未开始", "#8c8c8c"],
          ["进行中", "#1890ff"],
          ["完成", "#52c41a"],
        ],
      },
    },
    angleField: "value",
    colorField: "type",
    // radius: 0.6, // 整体变小
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
          text: "27",
          x: "50%",
          y: "50%",
          textAlign: "center",
          fontSize: 40,
          fontStyle: "bold",
        },
      },
    ],
  };
  const recentVisits = [
    {
      id: "1",
      title: "微内核及根服务功能测试",
      date: "2025-08-12",
    },
    {
      id: "2",
      title: "微内核及根服务功能测试",
      date: "2025-08-13",
    },
    {
      id: "3",
      title: "微内核及根服务功能测试",
      date: "2025-08-14",
    },
    {
      id: "4",
      title: "微内核及根服务功能测试",
      date: "2025-08-15",
    },
  ];

  const taskData = [
    {
      id: "1",
      title: "总数",
      value: "25",
      color: "#595959",
      bg: "linear-gradient(135deg, #f5f5f5 0%, #d9d9d9 100%)",
    },
    {
      id: "2",
      title: "未开始",
      value: "23",
      color: "#8c8c8c",
      bg: "linear-gradient(135deg, #fafafa 0%, #d9d9d9 100%)",
    },
    {
      id: "3",
      title: "进行中",
      value: "2",
      color: "#1890ff",
      bg: "linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%)",
    },
    {
      id: "4",
      title: "完成",
      value: "0",
      color: "#52c41a",
      bg: "linear-gradient(135deg, #e0ffe7 0%, #b7eb8f 100%)",
    },
  ];
  const fastEntry = [
    {
      id: 1,
      key: "newTask",
      menu: "新建测试任务",
      icon: <ProfileTwoTone twoToneColor="#1890ff" style={{ fontSize: 32 }} />,
      bg: "linear-gradient(135deg, #e6f7ff 0%, #91d5ff 100%)",
    },
    {
      id: 2,
      key: "useCase",
      menu: "用例执行",
      icon: <HddOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
      bg: "linear-gradient(135deg, #e6f7ff 0%, #91d5ff 100%)",
    },
    {
      id: 3,
      key: "testReport",
      menu: "测试报告",

      icon: <FileDoneOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
      bg: "linear-gradient(135deg, #e6f7ff 0%, #91d5ff 100%)",
    },
    {
      id: 4,
      key: "log",
      menu: "测试日志",

      icon: <BookOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
      bg: "linear-gradient(135deg, #e6f7ff 0%, #91d5ff 100%)",
    },
  ];

  return (
    <PageContainer>
      <Card title="最近访问" style={{ marginBottom: "10px", padding: "15px" }}>
        <Row gutter={[24, 24]}>
          {recentVisits.map((item) => (
            <Col span={6} key={item.id}>
              <Card
                hoverable
                style={cardStyle}
                styles={{ body: cardBodyStyle }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#888",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  <div
                    style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}
                  >
                    {item.title}
                  </div>
                  <div>{item.date}</div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
      <Card title="任务统计" style={{ marginBottom: "10px", padding: "15px" }}>
        <Row gutter={[24, 24]}>
          {taskData.map((item) => (
            <Col span={6} key={item.id}>
              <Card
                hoverable
                style={cardStyle}
                styles={{ body: cardBodyStyle }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#888",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontWeight: 500,
                    fontSize: 14,
                  }}
                >
                  <div>{item.title}</div>
                  <div style={{ color: item.color }}>{item.value}</div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
      <Row gutter={[24, 36]}>
        <Col span={16}>
          <Card title="快捷入口" style={{ padding: "15px" }}>
            <Row gutter={[24, 24]}>
              {fastEntry.map((item) => (
                <Col span={12} key={item.id}>
                  <Card
                    hoverable
                    style={cardStyle}
                    styles={{ body: cardBodyStyle }}
                    onClick={() => handleFast(item)}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div style={iconBoxStyle(item.bg)}>{item.icon}</div>
                      <div style={titleStyle}>{item.menu}</div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title="任务总数/状态数"
            hoverable
            styles={{ body: cardBodyStyle }}
          >
            <div style={{ width: "100%", height: "236px" }}>
              <Pie {...config} autoFit />
            </div>
          </Card>
        </Col>
      </Row>
      {/* 新建任务 */}
      <AddTaskModal
        open={isNewTaskModalOpen}
        onCancel={() => {
          setState({ isNewTaskModalOpen: false });
        }}
        onOk={() => {
          setState({ isNewTaskModalOpen: false });
        }}
        type="add"
        entry="home"
      />
      {/* 测试报告 */}
      <TaskListModal
        open={isTaskListModalOPen}
        onCancel={() => {
          setState({
            isTaskListModalOPen: false,
          });
        }}
        onOk={(values) => {
          history.push(`/task-management/test-report/${values.id}?entry=home`);
          setState({
            isTaskListModalOPen: false,
          });
        }}
      />
    </PageContainer>
  );
};

export default Welcome;
