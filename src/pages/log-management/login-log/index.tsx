import { getList } from "@/services/system-management/login-log.service";
import {
  ActionType,
  PageContainer,
  ProTable,
} from "@ant-design/pro-components";
import { useSetState } from "ahooks";
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
    try {
      const res = await getList({ params: args[0], sort: args[1] });
      return res;
    } catch {
      return {
        data: [
          {
            id: 1,
            title: "1",
            title1: "手机验证码",
            title2: "218.247.161.66",
            title3: "芋道源码",
            title4: "success",
            createTime: "2023-07-16 10:22:33",
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
        dateFormatter="string"
        rowKey="id"
        pagination={{
          pageSize: 10,
          onChange: (page) => requestData,
        }}
        headerTitle={title.label}
      />
    </PageContainer>
  );
};

export default Page;
