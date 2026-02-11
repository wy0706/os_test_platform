import { getOne } from "@/services/log-management/test-log.service";
import { PageContainer, ProDescriptions } from "@ant-design/pro-components";
import { history, useParams } from "@umijs/max";
import { useSetState } from "ahooks";
import { Button, Card, message, Table, Tag } from "antd";
import React, { useEffect } from "react";

const ResultTag = ({ value }: { value?: string }) => {
  const v = (value || "").toUpperCase();
  if (v === "PASS" || v === "OK") return <Tag color="success">{value}</Tag>;
  if (v === "FAIL" || v === "NG") return <Tag color="error">{value}</Tag>;
  return <Tag>{value || "-"}</Tag>;
};

const Index: React.FC = () => {
  const [state, setState] = useSetState<any>({
    title: "测试日志详情",
    baseInfo: {},
    tables: [],
  });

  const params = useParams();
  const { title, baseInfo, tables } = state;

  const getDetails = async (id: any) => {
    const { code, data, message: msg } = await getOne(id);
    if (code === 0) {
      setState({
        baseInfo: data?.baseinfo || {},
        tables: data?.tables || [],
      });
    } else {
      message.error(msg || "获取详情失败");
      setState({ baseInfo: {}, tables: [] });
    }
  };

  useEffect(() => {
    getDetails(params.id);
  }, []);

  // 测试条件参数 columns
  const conditionColumns = [
    { title: "参数序号", dataIndex: "index", key: "index", width: 120 },
    { title: "参数名称", dataIndex: "conditionname", key: "conditionname" },
    { title: "参数值", dataIndex: "conditionvalue", key: "conditionvalue" },
  ];

  // 测试结果参数 columns
  const resultColumns = [
    { title: "参数序号", dataIndex: "index", key: "index", width: 120 },
    { title: "参数名称", dataIndex: "resultname", key: "resultname" },
    { title: "参数值", dataIndex: "resultvalue", key: "resultvalue" },
    { title: "判定下限", dataIndex: "resultspecmin", key: "resultspecmin" },
    { title: "判定上限", dataIndex: "resultspecmax", key: "resultspecmax" },
    {
      title: "判定结果",
      dataIndex: "result",
      key: "result",
      render: (v: string) => <ResultTag value={v} />,
    },
  ];

  return (
    <PageContainer
      title={title}
      header={{
        ghost: true,
        extra: [
          <Button
            type="primary"
            key="2"
            style={{ marginRight: 10 }}
            onClick={() => message.info("下载功能待开发，敬请期待！")}
          >
            下载
          </Button>,
          <Button key="1" onClick={() => history.back()}>
            返回
          </Button>,
        ],
      }}
    >
      <Card>
        <ProDescriptions
          title="基本信息"
          bordered
          column={2}
          size="small"
          style={{ marginBottom: 24 }}
          labelStyle={{ width: 150 }}
          columns={[
            { title: "序列名称", dataIndex: "SerialNo" },
            { title: "测试日志生成日期", dataIndex: "genDate" },
            { title: "测试日志名称", dataIndex: "testName" },
            { title: "任务创建日期", dataIndex: "createDate" },
            { title: "产品编号", dataIndex: "productNo" },
            { title: "测试环境", dataIndex: "hardware" },
          ]}
          dataSource={baseInfo}
        />

        {(tables || []).map((item: any, index: number) => {
          return (
            <Card
              key={`${item.tablename}-${index}`}
              title={`序列名称：${item.tablename || `序列${index + 1}`}`}
              style={{ marginBottom: 24 }}
            >
              {/* 顶部三行信息：执行结果/开始时间/耗时 */}
              <ProDescriptions
                bordered
                size="small"
                column={2}
                style={{ marginBottom: 16 }}
                labelStyle={{ width: 150 }}
                columns={[
                  {
                    title: "序列执行结果",
                    dataIndex: "ItemResult",
                    render: (_, record) => (
                      <ResultTag value={record?.ItemResult} />
                    ),
                  },
                  { title: "序列开始执行时间", dataIndex: "TestStartTime" },
                  { title: "序列执行耗时", dataIndex: "TestElpasedTime" },
                ]}
                dataSource={item}
              />

              {/* 测试条件参数 */}
              <div style={{ margin: "12px 0 8px", fontWeight: 600 }}>
                测试条件参数
              </div>
              <Table
                dataSource={item?.TestCondition || []}
                columns={conditionColumns}
                pagination={false}
                size="small"
                rowKey={(r: any, i) => (r?.index ?? i).toString()}
              />

              {/* 测试结果参数 */}
              <div style={{ margin: "12px 0 8px", fontWeight: 600 }}>
                测试结果参数
              </div>
              <Table
                dataSource={item?.TestResult || []}
                columns={resultColumns}
                pagination={false}
                size="small"
                rowKey={(r: any, i) => (r?.index ?? i).toString()}
              />
            </Card>
          );
        })}
      </Card>
    </PageContainer>
  );
};

export default Index;
