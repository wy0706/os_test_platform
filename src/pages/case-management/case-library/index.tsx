import { getList } from "@/services/case-management/case-library.service";
import {
  ActionType,
  PageContainer,
  ProTable,
} from "@ant-design/pro-components";
import { history } from "@umijs/max";
import { useSetState } from "ahooks";
import React, { useRef, useState } from "react";
import RunModal from "../components/runModal";
import { schemasColumns, schemasTitle } from "./schemas";
const Page: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [state, setState] = useSetState<any>({
    title: schemasTitle,
    isRunModalOpen: false,
    details: null,
    columns: schemasColumns,
  });
  const { columns, title, isRunModalOpen, details } = state;

  //   处理行点击事件
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const requestData: any = async (...args: any) => {
    try {
      const res = await getList({ params: args[0], sort: args[1] });
      return res;
    } catch {
      return {
        data: [
          {
            id: 1,
            title: "os测试.tpf",
            status: "success",
            createTime: "2025-08-01 10:23:00",
          },
          {
            id: 2,
            title: "os测试1.tpf",
            status: "error",
            createTime: "2025-08-02 10:23:00",
          },
        ],
        total: 1,
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
        headerTitle={title.label}
        onRow={(record, index) => ({
          onClick: () => {
            setSelectedRow(record);
            setState({ isRunModalOpen: true, details: record });
          },
          style: {
            cursor: "pointer",
            backgroundColor:
              selectedRow?.id === record.id ? "#e6f7ff" : "transparent",
          },
        })}
      />
      <RunModal
        open={isRunModalOpen}
        onCancel={() => {
          setState({ isRunModalOpen: false });
        }}
        onOk={() => {
          setState({ isRunModalOpen: false });
          //表示运行界面的按钮 显示全部或者部分 status：all/part 从任务跳转的只显示部分按钮
          history.push(
            `/case-management/case-run/${details.id}?status=all&name=${details.title}`
          );
        }}
      />
    </PageContainer>
  );
};

export default Page;
