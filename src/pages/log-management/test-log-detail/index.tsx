import { getList } from "@/services/log-management/test-log.service";
import { PageContainer, ProDescriptions } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Card, Table } from "antd";
import React, { useEffect } from "react";
const Index: React.FC = () => {
  const [state, setState] = useSetState<any>({
    title: "测试日志详情",
    baseInfo: {},
    tables: {}, // 用对象存所有表格
  });

  const { title, baseInfo, tables } = state;

  useEffect(() => {
    requestData();
  }, []);

  const requestData = async () => {
    try {
      const { code, data } = await getList({ id: 1 });
      if (code === 0) {
        const { baseInfo, ...otherTables } = data;
        setState({
          baseInfo,
          tables: otherTables,
        });
      }
    } catch (error) {
      setState({
        baseInfo: {
          testName1: "测试日志名称",
          testName2: "2025-09-25",
          testName: "任务A",
          createDate: "2025-09-25 14:30",
          productNo: "NO-123456",
          hardware: "硬件环境X",
        },
        tables: {
          table1: [
            {
              order: 0,
              type: "send",
              varName: "TestCondition---ShowName+CallName",
              result: "\\",
              startTime: "2025-09-25 14:31:00",
            },
            {
              order: 1,
              type: "receive",
              varName:
                "TestConditionResult---ShowName+CallName---MinValue,MaxValue",
              result: "极限最大值/最小值判断",
              startTime: "2025-09-25 14:32:00",
            },
          ],
          table2: [
            {
              order: 0,
              type: "send",
              varName: "第二个序列变量",
              result: "通过",
              startTime: "2025-09-25 14:40:00",
            },
          ],
        },
      });
    }
  };
  const columns = [
    {
      title: "变量执行序号",
      dataIndex: "order",
      key: "order",
    },
    {
      title: "发送或接收",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "变量名",
      dataIndex: "varName",
      key: "varName",
    },
    {
      title: "变量执行结果",
      dataIndex: "result",
      key: "result",
    },
    {
      title: "序列开始执行时间",
      dataIndex: "startTime",
      key: "startTime",
    },
  ];

  return (
    <PageContainer
      title={title}
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
      <Card>
        <ProDescriptions
          title="基本信息"
          bordered
          column={2}
          size="small"
          style={{ marginBottom: 24 }}
          labelStyle={{ width: 150 }}
          columns={[
            { title: "测试日志名称", dataIndex: "testName1" },
            { title: "测试日志生成日期", dataIndex: "testName2" },
            { title: "任务名称", dataIndex: "testName" },
            { title: "任务创建日期", dataIndex: "createDate" },
            { title: "产品编号", dataIndex: "productNo" },
            { title: "测试环境", dataIndex: "hardware" },
          ]}
          dataSource={baseInfo}
        />
        {/* 动态渲染表格 */}
        {/* {Object.keys(tables).map((key, index) => {
          const dataSource = tables[key];
          return (
            <Card
              key={key}
              title={`序列名称${index + 1}`}
              style={{ marginBottom: 24 }}
            >
              <Table
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                size="small"
                rowKey={(record, i: any) => i.toString()}
              />
              <div style={{ marginTop: 8 }}>{`序列${index + 1}测试结果`}</div>
            </Card>
          );
        })} */}

        {Object.keys(tables).map((key, index) => {
          const dataSource = tables[key];
          // 把当前表格所有 result 合并成一句话（去空值，可自行改成换行显示）
          const combinedResult =
            dataSource
              ?.map((r: any) => r?.result)
              .filter(Boolean)
              .join("；") || "—";

          return (
            <Card
              key={key}
              title={`序列名称${index + 1}`}
              style={{ marginBottom: 24 }}
            >
              <Table
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                size="small"
                rowKey={(_, i) => i!.toString()}
                summary={(pageData) => {
                  const totalCols = columns.length;
                  return (
                    <Table.Summary fixed>
                      <Table.Summary.Row>
                        {/* 左侧放标签 */}
                        <Table.Summary.Cell index={0}>
                          序列测试结果
                        </Table.Summary.Cell>
                        {/* 右侧合并为一个大单元格 */}
                        <Table.Summary.Cell index={1} colSpan={totalCols - 1}>
                          {combinedResult}
                        </Table.Summary.Cell>
                        {/* 把被合并掉的“虚位”补齐（colSpan=0 隐藏） */}
                        {Array.from({ length: totalCols - 2 }).map((_, i) => (
                          <Table.Summary.Cell
                            key={i}
                            index={i + 2}
                            colSpan={0}
                          />
                        ))}
                      </Table.Summary.Row>
                    </Table.Summary>
                  );
                }}
              />
            </Card>
          );
        })}
      </Card>
    </PageContainer>
  );
};

export default Index;
