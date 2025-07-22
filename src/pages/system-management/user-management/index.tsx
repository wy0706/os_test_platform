
import {
  createOne,
  deleteOne,
  getList,
  getOne,
  updateOne,
} from "@/services/system-management/user-management.service";
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  BetaSchemaForm,
  PageContainer,
  ProDescriptions,
  ProTable,
} from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Form, message, Modal } from "antd";
import React, { useRef } from "react";
import {
  schemasColumns,
  schemasDescriptions,
  schemasForm,
  schemasTitle,
} from "./schemas";

const Page: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const form: any = Form.useForm()[0];
  const [state, setState] = useSetState<any>({
    title: schemasTitle,
    isUpdate: false,
    isUpdateModalOpen: false,
    updateValue: {},
    formSchema: schemasForm,
    isPreviewModalOpen: false,
    detailsId: null,
    descriptionsColumns: schemasDescriptions,
    columns: schemasColumns.concat([
      {
        title: "操作",
        valueType: "option",
        key: "option",
        width: 200,
        render: (text: any, record: any, _: any, action: any) => [
          <Button
            key="preview"
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => {
              setState({
                detailsId: record.id,
                isPreviewModalOpen: true,
              });
            }}
          >
            详情
          </Button>,
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
            编辑
          </Button>,
          <Button
            danger
            icon={<DeleteOutlined />}
            key="delete"
            onClick={() => {
              Modal.confirm({
                title: "确认删除吗？",
                onOk: async () => {
                  await deleteOne(record.id);
                  if (actionRef.current) {
                    actionRef.current.reload();
                  }
                },
              });
            }}
          >
            删除
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
  const requestData: any = async (...args: any) => {
    try {
      const res = await getList({ params: args[0], sort: args[1] });
      return res;
    } catch {
      return {
        data: [{id: 1,title: '测试数据',createTime: '测试数据',}],
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
        rowKey="id"
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
        title={isUpdate ? "编辑" : "新建"}
        open={isUpdateModalOpen}
        onCancel={() => {
          setState({ isUpdateModalOpen: false });
        }}
        footer={null}
        width={800}
      >
        <BetaSchemaForm<any>
          {...formSchema}
          defaultValue={updateValue}
          form={form}
          onFinish={async (value) => {
            if (isUpdate) {
              value.id = updateValue.id;
              const res: any = await updateOne({
                ...value,
                id: updateValue.id,
              });
              if (res.code === "0") {
                message.success("操作成功");
                setState({ isUpdateModalOpen: false });
              } else {
                return;
              }
            } else {
              const res: any = await createOne({ ...value, config: "{}" });
              if (res.code === "0") {
                message.success("操作成功");
                setState({ isUpdateModalOpen: false });
              } else {
                return;
              }
            }
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        />
      </Modal>

      <Modal
        title="详情"
        open={isPreviewModalOpen}
        onCancel={() => {
          setState({ isPreviewModalOpen: false });
        }}
        footer={null}
        width={800}
      >
        <ProDescriptions
          columns={descriptionsColumns}
          request={async () => {
            try {
              const res = await getOne(detailsId);
              return res;
            } catch {
              return {
                data: {id: 1,title: '测试数据',createTime: '测试数据',},
                success: true,
              };
            }
          }}
        ></ProDescriptions>
      </Modal>
    </PageContainer>
  );
};

export default Page;

