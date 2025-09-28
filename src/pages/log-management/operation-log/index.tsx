import { getList } from "@/services/log-management/operation-log.service";
import { transformParams } from "@/utils/params";

import {
  ActionType,
  PageContainer,
  ProTable,
} from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { message } from "antd";
import React, { useRef } from "react";
import { schemasColumns, schemasTitle } from "./schemas";

const Page: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [state, setState] = useSetState<any>({
    title: schemasTitle,
    columns: schemasColumns,
  });
  const { columns, title } = state;
  const requestData: any = async (...args: any) => {
    let params = transformParams({ params: args[0], sort: args[1] });
    const { code, data, message: msg } = await getList({ ...params });
    if (code !== 0) {
      message.error(msg);
      return;
    }
    return {
      data: data?.list || [],
      total: data?.total_cnt,
      success: true,
    };
  };

  return (
    <PageContainer>
      <ProTable<any>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={requestData}
        dateFormatter="string"
        rowKey="id"
        pagination={{
          pageSize: 10,
        }}
        headerTitle={title.label}
      />
    </PageContainer>
  );
};

export default Page;
