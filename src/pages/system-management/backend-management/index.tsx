import {
  createOne,
  deleteOne,
  getList,
  updateOne,
} from "@/services/system-management/role-management.service";
import {
  EditOutlined,
  EyeOutlined,
  MenuOutlined,
  PlusOutlined,
  SafetyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  ActionType,
  BetaSchemaForm,
  PageContainer,
  ProTable,
  type ProFormInstance,
} from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Checkbox, Form, Modal, Tabs, message } from "antd";
import React, { useRef, useState } from "react";
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
  },
  { key: 2, username: "user1", email: "user1@example.com", email2: "12345678" },
  {
    key: 3,
    username: "user1",
    email: "user1@example.com",
    email2: "12345678 ",
  },
];

const menuColumns = [
  { title: "菜单名称", dataIndex: "name", key: "name" },
  { title: "路径", dataIndex: "path", key: "path" },
];
const menuData = [
  { key: 1, name: "首页", path: "/home" },
  { key: 2, name: "设置", path: "/settings" },
];

const permissionColumns = [
  { title: "权限名称", dataIndex: "permission", key: "permission" },
  { title: "描述", dataIndex: "desc", key: "desc" },
];
const permissionData = [
  { key: 1, permission: "user:view", desc: "查看用户" },
  { key: 2, permission: "menu:edit", desc: "编辑菜单" },
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
  const formRef = useRef<ProFormInstance>();
  const requestData: any = async (...args: any) => {
    try {
      const res = await getList({ params: args[0], sort: args[1] });
      return res;
    } catch {
      return {
        data: userData,
        total: 1,
        success: true,
      };
    }
  };
  const handleOk = async () => {
    try {
      const values = await formRef.current?.validateFields();
      console.log("表单提交数据:", values);

      if (isUpdate) {
        values.id = updateValue.id;
        const res: any = await updateOne({
          ...values,
          id: updateValue.id,
        });
        if (res.code === "0") {
          message.success("操作成功");

          formRef.current?.resetFields();
          if (continueAdd) {
            setState({ isUpdateModalOpen: false });
          }
        } else {
          return;
        }
      } else {
        const res: any = await createOne({ ...values, config: "{}" });
        if (res.code === "0") {
          message.success("操作成功");
          formRef.current?.resetFields(); //重置表单数据
          if (continueAdd) {
            setState({ isUpdateModalOpen: false });
          }
        } else {
          return;
        }
      }
      if (actionRef.current) {
        actionRef.current.reload();
      }

      // setVisible(false);
    } catch (err) {
      console.log("表单校验失败:", err);
    }
  };

  const handleCancel = () => {
    setState({ isUpdateModalOpen: false });
    formRef.current?.resetFields();
  };
  return (
    <PageContainer>
      <Tabs defaultActiveKey="user">
        <Tabs.TabPane
          tab={
            <span>
              <UserOutlined style={{ marginRight: 4 }} /> 用户管理
            </span>
          }
          key="user"
        >
          <ProTable
            actionRef={actionRef}
            columns={columns}
            request={requestData}
            rowKey="key"
            cardBordered
            search={false}
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
          <Modal
            title={isUpdate ? "编辑成员信息" : "新增成员信息"}
            open={isUpdateModalOpen}
            // onCancel={() => {
            //   setState({ isUpdateModalOpen: false });
            //   formRef.current?.resetFields();
            // }}
            // onOk={handleOk}
            width={"50%"}
            footer={[
              <div
                key="checkbox"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {!isUpdate ? (
                  <Checkbox
                    checked={continueAdd}
                    onChange={(e) => setContinueAdd(e.target.checked)}
                  >
                    是否继续增加一条
                  </Checkbox>
                ) : (
                  <div />
                )}

                <div>
                  <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                    取消
                  </Button>
                  <Button type="primary" onClick={handleOk}>
                    确认
                  </Button>
                </div>
              </div>,
            ]}
          >
            <BetaSchemaForm<any>
              submitter={false}
              formRef={formRef}
              {...formSchema}
              defaultValue={updateValue}
              form={form}
            />
          </Modal>
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={
            <span>
              <MenuOutlined style={{ marginRight: 4 }} /> 角色管理
            </span>
          }
          key="menu"
        >
          <ProTable
            columns={menuColumns}
            dataSource={menuData}
            rowKey="key"
            search={false}
            pagination={false}
            options={false}
          />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={
            <span>
              <SafetyOutlined style={{ marginRight: 4 }} /> 权限管理
            </span>
          }
          key="permission"
        >
          <ProTable
            columns={permissionColumns}
            dataSource={permissionData}
            rowKey="key"
            search={false}
            pagination={false}
            options={false}
          />
        </Tabs.TabPane>
      </Tabs>
    </PageContainer>
  );
};

export default Page;
