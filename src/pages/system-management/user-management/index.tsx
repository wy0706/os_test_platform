import {
  deleteOne,
  getList,
} from "@/services/system-management/role-management.service";
import { EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  PageContainer,
  ProTable,
  type ProFormInstance,
} from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Form, Modal } from "antd";
import React, { useRef, useState } from "react";
import SetMemberModal from "./componets/setMemberModal";
import "./index.less";
import {
  userSchemasColumns,
  userSchemasDescriptions,
  userSchemasForm,
  userSchemasTitle,
} from "./schemas";

const userData = [
  {
    key: 1,
    username: "admin",
    email: "admin@example.com",
    email2: "123456788",
    email4: true,
  },

  {
    key: 2,
    email4: false,
    username: "user1",
    email: "user1@example.com",
    email2: "12345678",
  },
  {
    key: 3,
    username: "user1",
    email: "user1@example.com",
    email2: "12345678 ",
    email4: true,
  },
  {
    key: 4,
    username: "user1",
    email: "user1@example.com",
    email2: "12345678 ",
    email4: true,
  },
  {
    key: 5,
    username: "user1",
    email: "user1@example.com",
    email2: "12345678 ",
    email4: true,
  },
  {
    key: 6,
    username: "user1",
    email: "user1@example.com",
    email2: "12345678 ",
    email4: true,
  },
  {
    key: 7,
    username: "user1",
    email: "user1@example.com",
    email2: "12345678 ",
    email4: true,
  },
  {
    key: 8,
    username: "user1",
    email: "user1@example.com",
    email2: "12345678 ",
    email4: true,
  },
  {
    key: 9,
    username: "user1",
    email: "user1@example.com",
    email2: "12345678 ",
    email4: true,
  },
  {
    key: 10,
    username: "user1",
    email: "user1@example.com",
    email2: "12345678 ",
    email4: true,
  },
  {
    key: 11,
    username: "user1",
    email: "user1@example.com",
    email2: "12345678 ",
    email4: true,
  },
  {
    key: 12,
    username: "user1",
    email: "user1@example.com",
    email2: "12345678 ",
    email4: true,
  },
];

const Page: React.FC = () => {
  // 密码显示状态，key为用户key，值为true时显示明文
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({});
  const actionRef = useRef<ActionType>();
  const form: any = Form.useForm()[0];
  const [continueAdd, setContinueAdd] = useState(false); // checkbox 状态
  const [state, setState] = useSetState<any>({
    title: userSchemasTitle,
    isUpdate: false,
    isUpdateModalOpen: false,
    updateValue: {},
    formSchema: userSchemasForm,
    isPreviewModalOpen: false,
    detailsId: null,
    descriptionsColumns: userSchemasDescriptions,
    columns: userSchemasColumns.concat([
      {
        title: "操作",
        valueType: "option",
        key: "option",
        width: 200,
        render: (text: any, record: any, _: any, action: any) => [
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
            type="primary"
            ghost
            icon={<EditOutlined />}
            onClick={() => {
              form.setFieldsValue(record);
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
            danger
            icon={<EyeOutlined />}
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
        ],
      },
    ]),
  });

  const {
    columns,
    title,
    isUpdate,
    isUpdateModalOpen,
    updateValue,
    formSchema,
    isPreviewModalOpen,
    detailsId,
    descriptionsColumns,
  } = state;
  const formRef = useRef<ProFormInstance | null>(null);
  const requestData: any = async (...args: any) => {
    try {
      const res = await getList({ params: args[0], sort: args[1] });
      return res;
    } catch {
      return {
        data: userData,
        total: userData.length,
        success: true,
      };
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
    console.log("1111");
  };
  return (
    <PageContainer>
      <ProTable
        actionRef={actionRef}
        columns={columns}
        request={requestData}
        rowKey="key"
        cardBordered
        // search={false}
        options={false}
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
      <SetMemberModal
        onOk={handleOk}
        open={isUpdateModalOpen}
        isUpdate={isUpdate}
        updateValue={updateValue}
        onSuccess={handleSetMemberSuccess}
        onCancel={() => setState({ isUpdateModalOpen: false })}
        formSchema={formSchema}
      />
    </PageContainer>
  );
};

export default Page;
