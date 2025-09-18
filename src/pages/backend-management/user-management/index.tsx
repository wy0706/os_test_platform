import { deleteOne } from "@/services/system-management/role-management.service";

import { getList } from "@/services/backend-management/user-management.service";
import { EditOutlined, LockOutlined, PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  PageContainer,
  ProTable,
  TableDropdown,
} from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Modal } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { Access, useAccess } from "umi";
import SetMemberModal from "./components/setMemberModal";
import "./index.less";
import { userSchemasColumns, userSchemasTitle } from "./schemas";

const userData = [
  {
    key: 1,
    username: "admin",
    email: "admin@example.com",
    email2: "123456788",
    email4: true,
  },
];

const Page: React.FC = () => {
  const access = useAccess();
  console.log("Page rendered-access:", access);

  // 密码显示状态，key为用户key，值为true时显示明文
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({});
  const actionRef = useRef<ActionType>();
  // const form: any = Form.useForm()[0];
  const [continueAdd, setContinueAdd] = useState(false); // checkbox 状态
  const [state, setState] = useSetState<any>({
    title: userSchemasTitle,
    isUpdate: false,
    isUpdateModalOpen: false,
    updateValue: {},
    columns: [],
  });

  const { columns, title, isUpdate, isUpdateModalOpen, updateValue } = state;

  useEffect(() => {
    if (!!access["backendManagement-edit"]) {
      setState({
        columns: userSchemasColumns.concat([
          {
            title: "操作",
            valueType: "option",
            key: "option",
            width: 250,
            render: (text: any, record: any, index: any, action: any) => [
              // <Button
              //   key="preview"
              //   type="primary"
              //   icon={<EyeOutlined />}
              //   onClick={() => {
              //     setState({
              //       detailsId: record.id,
              //       isPreviewModalOpen: true,
              //     });
              //   }}
              // >
              //   详情
              // </Button>,
              <Button
                key="edit"
                color="primary"
                variant="link"
                icon={<EditOutlined />}
                onClick={() => {
                  // form.setFieldsValue(record);
                  setState({
                    updateValue: record,
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
                key="delete"
                onClick={() => {
                  Modal.confirm({
                    title: "是否确认重置密码？",
                    onOk: async () => {
                      await deleteOne(record.id);
                      if (actionRef.current) {
                        actionRef.current.reload();
                      }
                    },
                  });
                }}
              >
                重置密码
              </Button>,
              <TableDropdown
                key={index}
                onSelect={(key: string) => {
                  console.log("key----", key);
                  console.log(key);
                  switch (key) {
                    case "delete":
                      Modal.confirm({
                        title: (
                          <div>
                            <div>
                              确认删除用户{" "}
                              <span
                                style={{ color: "#ff4d4f", fontWeight: "bold" }}
                              >
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
                        // content: (
                        //   <div style={{ color: "#ff4d4f", fontWeight: "bold" }}>
                        //     {record.title}
                        //   </div>
                        // ),
                        onOk: async () => {
                          await deleteOne(record.id);
                          if (actionRef.current) {
                            actionRef.current.reload();
                          }
                        },
                      });
                      return;

                    default:
                      return;
                  }
                }}
                menus={[{ key: "delete", name: "删除" }]}
              />,
            ],
          },
        ]),
      });
    } else {
      setState({
        columns: userSchemasColumns,
      });
    }
  }, [access]);

  const requestData: any = async (...args: any) => {
    try {
      const { code, data } = await getList({
        params: args[0],
        sort: args[1],
      });

      return code === 0
        ? {
            data: data?.list || [],
            total: data?.total_cnt,
            success: true,
          }
        : {};
    } catch {
      return {};
    }
  };

  // 移除 formRef、form、continueAdd、handleOk、handleCancel 相关内容
  // 只保留控制弹窗开关的 isUpdateModalOpen、isUpdate、updateValue 相关 state

  // 新增 onSuccess 回调
  const handleSetMemberSuccess = () => {
    setState({ isUpdateModalOpen: false });
    if (actionRef.current) {
      actionRef.current.reload();
    }
  };
  const handleOk = () => {
    actionRef.current?.reload();
  };
  return (
    <PageContainer>
      <Access accessible={!!access["backendManagement-edit"]} fallback={<></>}>
        <ProTable
          actionRef={actionRef}
          columns={columns}
          request={requestData}
          rowKey="id"
          cardBordered
          // options={false}
          pagination={{
            pageSize: 10,
            onChange: (page) => requestData,
          }}
          headerTitle={title.label}
          toolBarRender={() => [
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
          ]}
        />
      </Access>

      <SetMemberModal
        onOk={handleOk}
        open={isUpdateModalOpen}
        isUpdate={isUpdate}
        updateValue={updateValue}
        // onOk={handleSetMemberSuccess}
        onCancel={() => setState({ isUpdateModalOpen: false })}
        // formSchema={formSchema}
      />
    </PageContainer>
  );
};

export default Page;
