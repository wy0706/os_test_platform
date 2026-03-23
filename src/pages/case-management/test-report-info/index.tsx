import {
  getList,
  getReportDetail,
} from "@/services/case-management/test-report-info.service";
import {
  PageContainer,
  ProDescriptions,
  ProDescriptionsActionType,
  ProTable,
} from "@ant-design/pro-components";
import { history, useParams, useSearchParams } from "@umijs/max";
import { useSetState } from "ahooks";
import { Button, Card, Col, Empty, Row } from "antd";
import React, { useEffect, useRef } from "react";
import { reportDetail, schemasTable } from "./schemas";

const Page: React.FC = () => {
  const actionRef = useRef<any>();
  const actionInfoRef = useRef<ProDescriptionsActionType>();
  const [searchParams] = useSearchParams();
  const params = useParams();

  const [state, setState] = useSetState<any>({
    title: "",
    reportModalOpen: false,
    entry: "",
    data: [
      { type: "成功", value: 25 },
      { type: "失败", value: 12 },
      { type: "其他", value: 5 },
    ],
    total: 0,
    successValue: 0,
    columns: schemasTable,
    selectedRowKeys: [],
    selectedRow: null,
    reportInfo: {}, // 右侧报告详情
  });

  const { entry, columns, selectedRowKeys, selectedRow, reportInfo } = state;

  useEffect(() => {
    if (selectedRow?.id) {
      loadReportDetail(selectedRow.id);
    } else {
      setState({
        reportInfo: {},
      });
    }
  }, [selectedRow]);

  const requestData: any = async (...args: any) => {
    try {
      const res = await getList({ params: args[0], sort: args[1] });
      return res;
    } catch {
      return {
        data: [
          {
            id: "1",
            title: "测试数据",
            detail: 1,
            title3: "张三",
            title4: "测试数据",
            createTime: "2025-07-30",
            status: 1,
          },
          {
            id: "2",
            title: "测试数据2",
            detail: 1,
            title3: "李四",
            title4: "测试数据",
            createTime: "2025-07-30",
            status: 2,
          },
          {
            id: "3",
            title: "测试数据3",
            detail: 1,
            title3: "王五",
            title4: "测试数据",
            createTime: "2025-07-30",
            status: 1,
          },
        ],
        total: 3,
        success: true,
      };
    }
  };

  const loadReportDetail = async (id: string) => {
    try {
      const res = await getReportDetail(id);

      setState({
        reportInfo: res?.data || {},
      });
    } catch (error) {
      console.log("获取报告详情失败", error);

      // 演示数据
      setState({
        reportInfo: {
          id,
          title: "项目名称",
          unity: "测试单位",
          sampleName: "样品名称",
          version: "V1.0",
          staff: "张九九",
          testDate: "2025-08-13",
          environment: "测试环境",
          basis1: "/report/demo/path",
          basis: "测试依据",
          conclusion: "测试结论",
          reportDate: "2025-08-20",
        },
      });
    }
  };

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
      <Row gutter={16} align="stretch">
        <Col span={12} style={{ display: "flex" }}>
          <Card
            title="查询数据库"
            style={{
              marginBottom: 10,
              width: "100%",
            }}
            bodyStyle={{
              height: "100%",
            }}
            variant="outlined"
          >
            <ProTable<any>
              rowKey="id"
              search={{
                layout: "vertical",
                span: 12,
                collapsed: false,
                collapseRender: false,
              }}
              options={false}
              rowSelection={{
                type: "radio",
                selectedRowKeys,
                onChange: (keys, rows) => {
                  setState({
                    selectedRowKeys: keys,
                    selectedRow: rows?.[0] || null,
                  });
                },
              }}
              onRow={(record) => ({
                onClick: () => {
                  setState({
                    selectedRowKeys: [record.id],
                    selectedRow: record,
                  });
                },
                style: { cursor: "pointer" },
              })}
              tableAlertRender={false}
              tableAlertOptionRender={false}
              columns={columns}
              actionRef={actionRef}
              cardBordered
              request={requestData}
              dateFormatter="string"
              pagination={{
                pageSize: 10,
                onChange: (page, pageSize) => {
                  console.log("当前页码:", page, "每页条数:", pageSize);
                },
              }}
              toolBarRender={false}
              headerTitle={false}
            />
          </Card>
        </Col>

        <Col span={12} style={{ display: "flex" }}>
          <Card
            title="详情"
            style={{
              marginBottom: 10,
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
            styles={{
              body: { flex: 1, display: "flex", flexDirection: "column" },
            }}
            variant="outlined"
          >
            {reportInfo.id ? (
              <ProDescriptions
                column={2}
                bordered
                columns={reportDetail}
                actionRef={actionInfoRef}
                dataSource={reportInfo}
              />
            ) : (
              <div
                style={{
                  flex: 1,
                  minHeight: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Empty description="请先查询数据库并在列表中选择数据" />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Page;
