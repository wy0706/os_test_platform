import { getList } from "@/services/system-management/user-management.service";
import { DownloadOutlined, EyeOutlined } from "@ant-design/icons";
import {
  ActionType,
  ProTable,
  TableDropdown,
} from "@ant-design/pro-components";
import { history } from "@umijs/max";
import { useSetState } from "ahooks";

import { Button } from "antd";
import React, { useRef } from "react";

const ReportListTab: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const [state, setState] = useSetState<any>({
    columns: [
      {
        title: "序号",
        dataIndex: "index",
        valueType: "index",
        width: 100,
      },
      {
        title: "报告名称",
        dataIndex: "title",
        ellipsis: true,
        // sorter: true,
      },
      {
        title: "生成日期",
        dataIndex: "createTime",
        search: false,
        ellipsis: true,
        // sorter: true,
      },

      {
        title: "操作",
        valueType: "option",
        key: "option",
        width: 200,
        render: (text: any, record: any, index: any, action: any) => [
          <Button
            color="primary"
            variant="link"
            key="preview"
            icon={<EyeOutlined />}
            onClick={() => {
              history.push(`/task-management/test-report/${record.id}`);
            }}
          >
            详情
          </Button>,
          <Button
            color="primary"
            variant="link"
            key="pdf"
            icon={<DownloadOutlined />}
            onClick={() => {}}
          >
            转成PDF
          </Button>,
          <TableDropdown
            key={index}
            onSelect={(key: string) => {
              switch (key) {
                case "excel":
                  console.log("record", record);
                  return;
                default:
                  return;
              }
            }}
            menus={[{ key: "excel", name: "转成excel" }]}
          />,
        ],
      },
    ],
  });
  const { columns } = state;

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
    <>
      <ProTable<any>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={requestData}
        rowKey="id"
        pagination={{
          pageSize: 10,
          onChange: (page, pageSize) => {
            console.log("当前页码:", page, "每页条数:", pageSize);
          },
        }}
        headerTitle="测试报告"
      />
    </>
  );
};
export default ReportListTab;
