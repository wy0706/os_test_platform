import {
  deleteOne,
  getList,
} from "@/services/task-management/test-requirement.service";
import { EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  PageContainer,
  ProTable,
  TableDropdown,
} from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Form, Modal } from "antd";
import React, { useRef } from "react";
import AddModal from "./components/addModal";
import DetailModal from "./components/detailModal";
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
        width: 180,
        render: (text: any, record: any, index: any, action: any) => [
          <Button
            color="primary"
            variant="link"
            key="preview"
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
            color="primary"
            variant="link"
            key="edit"
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

          <TableDropdown
            key={index}
            onSelect={(key: string) => {
              console.log("key----", key);
              console.log(key);
              switch (key) {
                case "delete":
                  Modal.confirm({
                    title: "确认删除吗？",
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

  const handleSuccess = () => {};
  const handleOk = () => {};
  const requestData: any = async (...args: any) => {
    try {
      const res = await getList({ params: args[0], sort: args[1] });
      return res;
    } catch {
      return {
        data: [{ id: 1, title: "测试数据", createTime: "测试数据" }],
        total: 1,
        success: true,
      };
    }
  };
  const handleDetailCancel = () => {
    setState({ isPreviewModalOpen: false });
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
      <DetailModal open={isPreviewModalOpen} onCancel={handleDetailCancel} />
      <AddModal
        onOk={handleOk}
        open={isUpdateModalOpen}
        isUpdate={isUpdate}
        updateValue={updateValue}
        onSuccess={handleSuccess}
        onCancel={() => setState({ isUpdateModalOpen: false })}
        formSchema={formSchema}
      />
    </PageContainer>
  );
};

export default Page;
