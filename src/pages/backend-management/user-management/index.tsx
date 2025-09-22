import {
  getList,
  resetPassWord,
} from "@/services/backend-management/user-management.service";
import { transformParams } from "@/utils/params";
import { EditOutlined, LockOutlined, PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  PageContainer,
  ProTable,
  TableDropdown,
} from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Modal, message } from "antd";
import React, { useRef, useState } from "react";
import { useAccess } from "umi";
import SetMemberModal from "./components/setMemberModal";
import "./index.less";
import { userSchemasColumns, userSchemasTitle } from "./schemas";

const Page: React.FC = () => {
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  const [continueAdd, setContinueAdd] = useState(false); // checkbox 状态
  const [state, setState] = useSetState<any>({
    title: userSchemasTitle,
    isUpdate: false,
    isUpdateModalOpen: false,
    updateValue: {},
  });

  const { title, isUpdate, isUpdateModalOpen, updateValue } = state;
  const operationColumn = {
    title: "操作",
    valueType: "option",
    key: "option",
    width: 250,
    render: (text: any, record: any, index: any, action: any) => [
      <Button
        key="edit"
        color="primary"
        variant="link"
        icon={<EditOutlined />}
        onClick={() => {
          setState({
            updateValue: {
              ...record,
              role_id: record?.role_info?.id,
            },
            isUpdate: true,
            isUpdateModalOpen: true,
          });
        }}
      >
        设置成员信息
      </Button>,
      <Button
        variant="link"
        color="primary"
        icon={<LockOutlined />}
        key="resetPwd"
        onClick={() => {
          Modal.confirm({
            title: "是否确认重置密码？",
            onOk: async () => {
              const { code, message: msg } = await resetPassWord(record.id);
              message.success(msg);
            },
          });
        }}
      >
        重置密码
      </Button>,
      <TableDropdown
        key={index}
        onSelect={async (key: string) => {
          // …你的下拉逻辑
        }}
        menus={[
          { key: "unblock", name: "账户解封" },
          { key: "delete", name: "删除" },
        ]}
      />,
    ],
  };

  const requestData: any = async (...args: any) => {
    let params = transformParams({ params: args[0], sort: args[1] });
    const {
      code,
      data,
      message: msg,
    } = await getList({
      ...params,
    });

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

  const handleOk = () => {
    setState({ isUpdateModalOpen: false });
    actionRef.current?.reload();
  };
  return (
    <PageContainer>
      <ProTable
        actionRef={actionRef}
        columns={
          access["backendManagement-edit"]
            ? [...userSchemasColumns, operationColumn]
            : userSchemasColumns
        }
        request={requestData}
        rowKey="id"
        cardBordered
        pagination={{
          pageSize: 10,
          onChange: (page) => requestData,
        }}
        headerTitle={title.label}
        toolBarRender={() =>
          access["backendManagement-edit"]
            ? [
                <Button
                  key="button"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setState({
                      isUpdate: false,
                      isUpdateModalOpen: true,
                    });
                  }}
                  type="primary"
                >
                  新建
                </Button>,
              ]
            : []
        }
      />

      <SetMemberModal
        onOk={handleOk}
        open={isUpdateModalOpen}
        isUpdate={isUpdate}
        updateValue={updateValue}
        onCancel={(value: any) => {
          setState({ isUpdateModalOpen: false });
          if (value) {
            actionRef.current?.reload();
          }
        }}
      />
    </PageContainer>
  );
};

export default Page;
