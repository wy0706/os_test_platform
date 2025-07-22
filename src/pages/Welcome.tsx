import { BoxPlotTwoTone } from "@ant-design/icons";
import { GridContent, PageContainer } from "@ant-design/pro-components";
import { Card, Col, Row, Statistic } from "antd";
import React from "react";
import { Pie } from '@ant-design/plots';

const DemoPie = () => {
  const config = {
    data: [
      { type: '分类一', value: 27 },
      { type: '分类二', value: 25 },
      { type: '分类三', value: 18 },
      { type: '分类四', value: 15 },
      { type: '分类五', value: 10 },
      { type: '其他', value: 5 },
    ],
    angleField: 'value',
    colorField: 'type',
    label: {
      text: 'value',
      style: {
        fontWeight: 'bold',
      },
    },
    legend: {
      color: {
        title: false,
        position: 'right',
        rowPadding: 5,
      },
    },
  };
  return <Pie {...config} />;
};

const Welcome: React.FC = () => {
  return (
    <PageContainer>
      <GridContent>
        <Row gutter={[24, 24]}>
          <Col xl={8} lg={12} md={12} sm={12} xs={12}>
            <Card hoverable>
              <Statistic title="设备" value={`5`} prefix={<BoxPlotTwoTone />} />
            </Card>
          </Col>
          <Col xl={8} lg={12} md={12} sm={12} xs={12}>
            <Card hoverable>
              <Statistic
                title="测试用例"
                value={`50`}
                prefix={<BoxPlotTwoTone />}
              />
            </Card>
          </Col>
          <Col xl={8} lg={12} md={12} sm={12} xs={12}></Col>
          <Col xl={8} lg={12} md={12} sm={12} xs={12}>
            <Card hoverable>
              <Statistic
                title="未启动任务"
                value={`50`}
                prefix={<BoxPlotTwoTone />}
              />
            </Card>
          </Col>
          <Col xl={8} lg={12} md={12} sm={12} xs={12}>
            <Card hoverable>
              <Statistic
                title="执行中任务"
                value={`50`}
                prefix={<BoxPlotTwoTone />}
              />
            </Card>
          </Col>
          <Col xl={8} lg={12} md={12} sm={12} xs={12}>
            <Card hoverable>
              <Statistic
                title="已完成任务"
                value={`50`}
                prefix={<BoxPlotTwoTone />}
              />
            </Card>
          </Col>
          <Col xl={12} lg={12} md={12} sm={12} xs={12}>
            <Card hoverable>
              <div>
                <DemoPie />
              </div>
            </Card>
          </Col>
        </Row>
      </GridContent>
    </PageContainer>
  );
};

export default Welcome;
