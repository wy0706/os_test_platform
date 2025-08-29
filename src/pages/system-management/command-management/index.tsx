import {
  deleteOne,
  getList,
} from "@/services/system-management/command-management.service";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  PageContainer,
  ProTable,
} from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Form, Modal, Switch } from "antd";
import React, { useRef } from "react";
import AddModal from "./components/addModal";
import { schemasTitle } from "./schemas";
const Page: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const form: any = Form.useForm()[0];
  const [state, setState] = useSetState<any>({
    title: schemasTitle,
    isUpdateModalOpen: false,
    updateValue: {},
    optionType: "add",
  });
  const { title, isUpdateModalOpen, updateValue, optionType } = state;

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
  const columns: any = [
    {
      title: "命令名称",
      dataIndex: "title",
      ellipsis: true,
    },
    {
      title: "ID",
      dataIndex: "id",
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: "设备类型",
      dataIndex: "type",
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: "状态",
      dataIndex: "status",
      ellipsis: true,
      hideInSearch: true,
      render: (text: any, record: any) => {
        return (
          <Switch
            // checked={Boolean(record.title2)}
            size="small"
            // onChange={(checked) => {
            //   console.log("checked", checked);
            // }}
          />
        );
      },
    },
    {
      title: "命令名称",
      dataIndex: "title",
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: "添加时间",
      dataIndex: "createTime",
      ellipsis: true,

      sorter: true,
      hideInSearch: true,
    },

    {
      title: "操作",
      valueType: "option",
      key: "option",
      width: 150,
      render: (text: any, record: any, index: any, action: any) => [
        <Button
          color="primary"
          variant="link"
          key="edit"
          icon={<EditOutlined />}
          onClick={() => {
            setState({
              updateValue: record,
              isUpdateModalOpen: true,
              optionType: "edit",
            });
          }}
        >
          编辑
        </Button>,
        <Button
          color="danger"
          variant="link"
          key="preview"
          icon={<DeleteOutlined />}
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
  ];
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
                optionType: "add",
                isUpdateModalOpen: true,
              });
            }}
            type="primary"
          >
            新建
          </Button>,
        ]}
      />
      <AddModal
        type={optionType}
        open={isUpdateModalOpen}
        updateValue={updateValue}
        onCancel={() => {
          setState({ isUpdateModalOpen: false, updateValue: {} });
        }}
        onOk={(values) => {
          console.log("values", values);
          setState({ isUpdateModalOpen: false, updateValue: {} });
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}
      />
    </PageContainer>
  );
};

export default Page;
