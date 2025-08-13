import { getList } from "@/services/case-management/case-run.service";
import { BarsOutlined, BookOutlined, HomeOutlined } from "@ant-design/icons";
import { ActionType, PageContainer } from "@ant-design/pro-components";
import { history, useSearchParams } from "@umijs/max";
import { useSetState } from "ahooks";
import { Button, Checkbox, Col, Row, Switch, Table, Tabs } from "antd";
import React, { useEffect, useRef } from "react";
const Page: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    setState({ title: searchParams.get("name") || "-" });
    requestData();
  }, []);
  const [state, setState] = useSetState<any>({
    title: null,
    isExpandAll: false, //是否展开所有命令
    expandedRowKeys: [], //当前展开的行keys
    breakpoints: [], //打断点的行keys
    tabActiveKey: "1",
    dataSource: [],
    tabItems: [
      {
        key: "1",
        label: "测试信息",
        icon: <HomeOutlined />,
      },
      {
        key: "2",
        label: "测试结果", //测试结果
        icon: <BookOutlined />,
      },
      {
        key: "3",
        label: "测试条件",
        icon: <BarsOutlined />,
      },
    ],
  });
  const {
    title,
    tabItems,
    tabActiveKey,
    dataSource,
    isExpandAll,
    expandedRowKeys,
    breakpoints,
  } = state;

  // 处理断点切换
  const handleBreakpointChange = (record: any, checked: boolean) => {
    if (checked) {
      setState({
        breakpoints: [...breakpoints, record.id],
      });
    } else {
      setState({
        breakpoints: breakpoints.filter((id: any) => id !== record.id),
      });
    }
  };

  // 定义表格列
  const columns = [
    {
      title: " ",
      dataIndex: "breakpoint",
      width: 80,
      align: "center" as const,
      render: (_: any, record: any) => {
        const hasBreakpoint = breakpoints.includes(record.id);
        return (
          <Switch
            size="small"
            checked={hasBreakpoint}
            onChange={(checked) => handleBreakpointChange(record, checked)}
          />
        );
      },
    },
    {
      title: "项目名称",
      dataIndex: "title",
      ellipsis: true,
    },
    {
      title: "项目名称/项目说明",
      dataIndex: "describe",
      ellipsis: true,
    },
    {
      title: "命令参数",
      dataIndex: "schemas",
      ellipsis: true,
    },
    {
      title: "是否合格",
      dataIndex: "qualified",
      ellipsis: true,
    },
  ];

  const requestData: any = async (...args: any) => {
    try {
      const res = await getList({ params: args[0], sort: args[1] });
      setState({ dataSource: res });
    } catch {
      setState({
        dataSource: [
          {
            id: 1,
            title: "test add",
            describe: "PreTestItemProcessing",
            schemas: "1.000000,2.000000,b",
            qualified: "",
            group: "100",
            children: [
              {
                id: 11,
                title: "test add",
                describe: "PreTestItemProcessing",
                schemas: "1.000000,2.000000,b",
                qualified: "",
                group: "100",
                // team: "test add",
              },
              {
                id: 2,
                title: "test add",
                describe: "ADD",
                schemas: "",
                qualified: "",
                group: "100",
                // team: "test add",
              },
            ],
          },

          {
            id: 3,
            title: "test add2",
            describe: "PostTestItemProcessing",
            schemas: "",
            qualified: "",
            team: "test add2",
            group: "101",
            children: [
              {
                id: 31,
                title: "",
                describe: "PreTestItemProcessing",
                schemas: "1.000000,2.000000,b",
                qualified: "合格",
                group: "101",
              },
            ],
          },
        ],
      });
    }
  };

  return (
    <PageContainer
      style={{ backgroundColor: "#fff" }}
      header={{
        title: (
          <div>
            用例执行 &nbsp; <span style={{ color: "#999" }}>【 {title} 】</span>
          </div>
        ),
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
      <Row gutter={24}>
        <Col span={12}>
          <div style={{ marginBottom: 10 }}>
            <Checkbox
              checked={isExpandAll}
              onChange={(e) => {
                const checked = e.target.checked;
                if (checked) {
                  // 展开所有有children的行
                  const allExpandableKeys = dataSource
                    .filter(
                      (item: any) => item.children && item.children.length > 0
                    )
                    .map((item: any) => item.id);
                  setState({
                    isExpandAll: true,
                    expandedRowKeys: allExpandableKeys,
                  });
                } else {
                  // 收起所有行
                  setState({
                    isExpandAll: false,
                    expandedRowKeys: [],
                  });
                }
              }}
            >
              按命令展开所有项目
            </Checkbox>
          </div>
          <Table<any>
            columns={columns}
            dataSource={dataSource}
            rowKey="id"
            pagination={false}
            expandable={{
              expandedRowKeys: expandedRowKeys,
              onExpand: (expanded, record) => {
                let newExpandedKeys: any[];
                if (expanded) {
                  // 展开行：添加到expandedRowKeys
                  newExpandedKeys = [...expandedRowKeys, record.id];
                } else {
                  // 收起行：从expandedRowKeys中移除
                  newExpandedKeys = expandedRowKeys.filter(
                    (key: any) => key !== record.id
                  );
                }

                // 检查是否所有可展开的行都已展开
                const allExpandableKeys = dataSource
                  .filter(
                    (item: any) => item.children && item.children.length > 0
                  )
                  .map((item: any) => item.id);
                const allExpanded = allExpandableKeys.every((key: any) =>
                  newExpandedKeys.includes(key)
                );

                setState({
                  expandedRowKeys: newExpandedKeys,
                  isExpandAll: allExpanded,
                });
              },
              // 只有有children的行才显示展开按钮
              rowExpandable: (record) =>
                !!(record.children && record.children.length > 0),
            }}
          />
          {/* <ProTable<any>
            columns={columns}
            actionRef={actionRef}
            search={false}
            // cardBordered
            // request={requestData}
            dataSource={dataSource}
            rowKey="id"
            pagination={{
              pageSize: 1000,
              onChange: (page) => requestData,
            }}
            options={false}
            toolBarRender={() => [
              <Button
                key="button"
                icon={<PlusOutlined />}
                onClick={() => {
                  setState({
                    isUpdate: false,
                    isUpdateModalOpen: true,
                  });
                }}
                type="primary"
              >
                设置
              </Button>,
            ]}
          /> */}
        </Col>
        <Col span={12}>
          <div
            style={{
              background: "#fff",
              // paddingTop: "20px",
            }}
          >
            <Tabs
              items={tabItems}
              defaultActiveKey={tabActiveKey}
              onChange={(key: any) => {
                setState({ tabActiveKey: key });
              }}
            />
            {tabActiveKey === "1" && <div>测试信息</div>}
            {tabActiveKey === "2" && <div>测试结果</div>}
            {tabActiveKey === "3" && <div>测试条件</div>}
          </div>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Page;
