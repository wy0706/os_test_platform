import { getTestInfoList } from "@/services/case-management/case-run.service";
import {
  ProDescriptions,
  ProDescriptionsActionType,
} from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import React, { useEffect, useRef } from "react";
import { testInfoDescriptions } from "../schemas";
interface testInfoProps {
  title: string;
}
const TestInfo: React.FC<testInfoProps> = ({ title }) => {
  const [state, setState] = useSetState<any>({
    name: "",
  });
  const { name } = state;
  const actionRef = useRef<ProDescriptionsActionType>();
  useEffect(() => {
    requestData();
  }, []);
  const requestData: any = async () => {
    try {
      if (!title) return;
      const res = await getTestInfoList(title);
      console.log("res", res);
      return;
    } catch {
      return {
        success: false,
        data: {},
      };
    }
  };
  // async () => {
  //           return Promise.resolve({
  //             success: true,
  //             data: {
  //               id: 1,
  //               title: "testadd ",
  //               name: "",
  //               programDate: "2024-08-05",
  //               programTime: "10:00:00",
  //               configure: "YSW-GC-nocom.hwc",
  //               format: "",
  //               testType: "ESWIN_TEST",
  //               type: "",
  //               order: "",
  //               startTime: "",
  //             },
  //           });
  //         }
  return (
    <div className="testInfo-page" style={{ paddingTop: 10 }}>
      <ProDescriptions
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
