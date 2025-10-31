import { getList } from "@/services/case-management/case-library.service";
import { transformParams } from "@/utils/params";
import {
  ActionType,
  PageContainer,
  ProTable,
} from "@ant-design/pro-components";
import { history, useAccess } from "@umijs/max";
import { useSetState } from "ahooks";
import { message } from "antd";
import React, { useRef, useState } from "react";
import RunModal from "../components/runModal";
import { schemasColumns, schemasTitle } from "./schemas";
const Page: React.FC = () => {
  const access = useAccess();

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
    let params = transformParams({ params: args[0], sort: args[1] });
    const { code, data, message: msg } = await getList({ ...params });

    if (code !== 0) {
      message.error(msg);
      return { data: [], total: 0, success: false };
    }
    return {
      data: data?.list_info || [],
      total: data?.total_cnt,
      success: true,
    };
  };

  return (
    <PageContainer>
      <ProTable<any>
        columns={columns}
        dateFormatter="string"
        actionRef={actionRef}
        cardBordered
        request={requestData}
        rowKey="execution_file_id"
        pagination={{
          pageSize: 10,
        }}
        headerTitle={title.label}
        onRow={(record, index) =>
          access["testDesign-edit"]
            ? {
                onClick: () => {
                  setSelectedRow(record);
                  setState({ isRunModalOpen: true, details: record });
                },
                style: {
                  cursor: "pointer",
                  backgroundColor:
                    selectedRow?.id === record.id ? "#e6f7ff" : "transparent",
                },
              }
            : {}
        }
      />
      <RunModal
        open={isRunModalOpen}
        onCancel={() => {
          setState({ isRunModalOpen: false, details: null });
        }}
        id={details?.execution_file_id}
        onOk={() => {
          //表示运行界面的按钮 显示全部或者部分 status：all/part 从任务跳转的只显示部分按钮
          history.push(
            `/case-management/case-run/${details.execution_file_id}?status=all&name=${details.execution_file}`
          );
          setState({ isRunModalOpen: false, details: null });
        }}
      />
    </PageContainer>
  );
};

export default Page;
