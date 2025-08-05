import { PageContainer } from "@ant-design/pro-components";
import { history } from "@umijs/max";
import { Button } from "antd";
import React, { useState } from "react";

const EquipmentLibraryEdit: React.FC = () => {
  const [data, setData] = useState<any>(null);

  return (
    <PageContainer
      header={{
        ghost: true,
        extra: [
          <Button
            key="1"
            onClick={() => {
              history.back();
            }}
          >
            返回
          </Button>,
        ],
      }}
    ></PageContainer>
  );
};

export default EquipmentLibraryEdit;
