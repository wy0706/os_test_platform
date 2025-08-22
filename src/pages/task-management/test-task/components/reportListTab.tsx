import { getList } from "@/services/system-management/user-management.service";
import {
  ActionType,
  PageContainer,
  ProTable,
} from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import React, { useEffect, useRef, useState } from "react";
const ReportListTab: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const [state, setState] = useSetState<any>({
    title: "",
  });
  const { title } = state;
  const columns = [
    {
      title: "序号",
      dataIndex: "title",
      ellipsis: true,
      sorter: true,
    },
    {
      title: "报告名称",
      dataIndex: "title",
      ellipsis: true,
      sorter: true,
    },
    {
      title: "生成日期",
      dataIndex: "title",
      ellipsis: true,
      sorter: true,
    },
    // 转成pdf或者excel
    // 查看
  ];
  const [data, setData] = useState<any>(null);

  useEffect(() => {}, []);
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
            title2: 100,
            title3: "张三",
            title4: "测试数据",
            createTime: "2025-07-30",
            status: "all",
          },
          {
            id: "2",
            title: "测试数据2",
            title2: 70,
            title3: "李四",
            title4: "测试数据",
            createTime: "2025-07-30",
            status: "all",
          },
        ],
        total: 2,
        success: true,
      };
    }
  };
  return (
    <PageContainer>
      <ProTable<any>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={requestData}
        rowKey="id"
        pagination={{
          pageSize: 10,
          onChange: (page) => requestData,
        }}
        headerTitle="测试报告"
      />
    </PageContainer>
  );
};
export default ReportListTab;
