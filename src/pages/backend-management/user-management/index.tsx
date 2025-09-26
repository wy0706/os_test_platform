import {
  activeOne,
  deleteOne,
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
import React, { useRef } from "react";
import { useAccess } from "umi";
import SetMemberModal from "./components/setMemberModal";
import "./index.less";
import { userSchemasColumns, userSchemasTitle } from "./schemas";

const Page: React.FC = () => {
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  const [state, setState] = useSetState<any>({
    title: userSchemasTitle,
    isUpdate: false,
    isUpdateModalOpen: false,
    updateValue: {},
  });

  const { title, isUpdate, isUpdateModalOpen, updateValue } = state;

  /** 统一关闭 Modal 并根据需要刷新表格 */
  const closeModal = (reload = false) => {
    setState({ isUpdateModalOpen: false });
    if (reload) actionRef.current?.reload();
  };

  /** 重置密码 */
  const handleResetPwd = (id: string) => {
    Modal.confirm({
      title: "是否确认重置密码？",
      onOk: async () => {
        const { code, message: msg } = await resetPassWord(id);
        code === 0 ? message.success(msg) : message.error(msg);
      },
    });
  };

  /** 激活账号 */
  const handleUnblock = async (record: any) => {
    if (record.is_active) {
      message.info("账户状态正常，无需解封");
      return;
    }
    const { code, message: msg } = await activeOne(record.id);
    if (code !== 0) {
      message.error(msg);
      return;
    }
    message.success(msg);
    actionRef.current?.reload();
  };

  /** 删除用户 */
  const handleDelete = (record: any) => {
    Modal.confirm({
      title: (
        <div>
          <div>
            确认删除用户{" "}
            <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
              {record.username}
            </span>{" "}
            吗？
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#666",
              marginTop: "8px",
            }}
          >
            删除用户会使该用户的登录和操作信息一同删除
          </div>
        </div>
      ),
      onOk: async () => {
        const { code, message: msg } = await deleteOne(record.id);
        if (code !== 0) {
          message.error(msg);
          return;
        }
        message.success(msg);
        actionRef.current?.reload();
      },
    });
  };

  /** 操作列 */
  const operationColumn = {
    title: "操作",
    valueType: "option",
    key: "option",
    width: 250,
    render: (_: any, record: any) => [
      <Button
        key="edit"
        type="link"
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
        key="resetPwd"
        type="link"
        icon={<LockOutlined />}
        onClick={() => handleResetPwd(record.id)}
      >
        重置密码
      </Button>,
      <TableDropdown
        key="more"
        onSelect={(key: string) => {
          if (key === "unblock") handleUnblock(record);
          if (key === "delete") handleDelete(record);
        }}
        menus={[
          { key: "unblock", name: "账户解封" },
          { key: "delete", name: "删除" },
        ]}
      />,
    ],
  };

  /** 请求数据 */
  const requestData = async (params: any, sort: any) => {
    const apiParams = transformParams({ params, sort });
    const { code, data, message: msg } = await getList(apiParams);
    if (code !== 0) {
      message.error(msg);
      return { data: [], total: 0, success: false };
    }
    return {
      data: data?.list || [],
      total: data?.total_cnt,
      success: true,
    };
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
        pagination={{ pageSize: 10 }}
        headerTitle={title.label}
        toolBarRender={() =>
          access["backendManagement-edit"]
            ? [
                <Button
                  key="button"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    setState({
                      isUpdate: false,
                      isUpdateModalOpen: true,
                    })
                  }
                  type="primary"
                >
                  新建
                </Button>,
              ]
            : []
        }
      />

      <SetMemberModal
        onOk={() => closeModal(true)}
        open={isUpdateModalOpen}
        isUpdate={isUpdate}
        updateValue={updateValue}
        onCancel={(reload?: boolean) => closeModal(reload)}
      />
    </PageContainer>
  );
};

export default Page;
