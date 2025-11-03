import { getTestInfoList } from "@/services/case-management/case-run.service";
import {
  ProDescriptions,
  ProDescriptionsActionType,
} from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { message } from "antd";
import React, { useRef } from "react";
import { testInfoDescriptions } from "../schemas";
interface testInfoProps {
  autoId: any;
}
const TestInfo: React.FC<testInfoProps> = ({ autoId }) => {
  const [state, setState] = useSetState<any>({
    loading: false,
  });
  const { loading } = state;
  const actionRef = useRef<ProDescriptionsActionType>();

  const requestData: any = async () => {
    try {
      if (!autoId) return;
      setState({
        loading: true,
      });
      const { code, data, message: msg } = await getTestInfoList(autoId);
      if (code !== 0) {
        message.error(msg || "获取数据失败");
        return {
          success: false,
          data: {},
        };
      }
      return {
        success: true,
        data,
      };
    } catch {
      return {
        success: false,
        data: {},
      };
    } finally {
      setState({
        loading: false,
      });
    }
  };
  return (
    <div className="testInfo-page" style={{ paddingTop: 10 }}>
      <ProDescriptions
        loading={loading}
        column={2}
        bordered
        columns={testInfoDescriptions}
        actionRef={actionRef}
        request={requestData}
      ></ProDescriptions>
    </div>
  );
};

export default TestInfo;
