import {
  ProDescriptions,
  ProDescriptionsActionType,
} from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import React, { useEffect, useRef, useState } from "react";
import { testInfoDescriptions } from "../schemas";
const TestInfo: React.FC = () => {
  const [state, setState] = useSetState<any>({
    title: "",
  });
  const { title } = state;
  const [data, setData] = useState<any>(null);
  const actionRef = useRef<ProDescriptionsActionType>();
  useEffect(() => {}, []);

  return (
    <div className="testInfo-page" style={{ paddingTop: 10 }}>
      <ProDescriptions
        column={2}
        bordered
        columns={testInfoDescriptions}
        actionRef={actionRef}
        request={async () => {
          return Promise.resolve({
            success: true,
            data: {
              id: 1,
              title: "testadd ",
              name: "",
              programDate: "2024-08-05",
              programTime: "10:00:00",
              configure: "YSW-GC-nocom.hwc",
              format: "",
              testType: "ESWIN_TEST",
              type: "",
              order: "",
              startTime: "",
            },
          });
        }}
      ></ProDescriptions>
    </div>
  );
};

export default TestInfo;
