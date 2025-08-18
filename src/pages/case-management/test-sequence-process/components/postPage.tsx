import { getList } from "@/services/case-management/test-sequence-process.service";
import { EditOutlined } from "@ant-design/icons";
import { ActionType, ProTable } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button } from "antd";
import React, { useEffect, useRef } from "react";

const PostPage: React.FC = () => {
  const [state, setState] = useSetState<any>({
    title: "",
    columns: [
      {
        title: "激活",
        dataIndex: "status",
        ellipsis: true,
        // valueType: "select",
        valueEnum: {
          success: {
            text: "✓",
            status: "Success",
          },
          error: {
            text: "✗",
            status: "Error",
          },
        },
      },
      {
        title: "测试项目",
        dataIndex: "title",
        ellipsis: true,
      },
      {
        title: "扩展名",
        dataIndex: "extension",
        ellipsis: true,
      },
      {
        title: "报告",
        dataIndex: "report",
        ellipsis: true,
        valueEnum: {
          success: {
            text: "✓",
            status: "Success",
          },
          error: {
            text: "✗",
            status: "Error",
          },
        },
      },
      {
        title: "操作",
        valueType: "option",
        key: "option",
        width: 80,
        render: (text: any, record: any, index: any, action: any) => [
          <Button
            key="edit"
            variant="link"
            color="primary"
            icon={<EditOutlined />}
            onClick={() => {
              // setState({
              //   updateValue: record,
              //   isUpdateModalOpen: true,
              // });
            }}
          >
            编辑
          </Button>,
        ],
      },
    ],
  });
  const actionRef = useRef<ActionType>();

  const { title, columns } = state;

  useEffect(() => {}, []);
  const requestData: any = async (...args: any) => {
    try {
      const res = await getList({ params: args[0], sort: args[1] });
      return res;
    } catch {
      return {
        data: [
          {
            id: 1,
            status: "success",
            title: "测试数据",
            extension: "测试数据",
            report: "success",
          },
          {
            id: 2,
            status: "error",
            title: "测试数据",
            extension: "测试数据",
            report: "error",
          },
        ],
        total: 2,
        success: true,
      };
    }
  };
  return (
    <div className="postPage-page">
      <ProTable<any>
        columns={columns}
        search={false}
        options={false}
        actionRef={actionRef}
        cardBordered
        request={requestData}
        rowKey="id"
        pagination={false}
      />
    </div>
  );
};

export default PostPage;
