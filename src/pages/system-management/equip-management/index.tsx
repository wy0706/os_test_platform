import {
  deleteOne,
  getList,
} from "@/services/system-management/equip-management.service";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  PageContainer,
  ProTable,
} from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Modal, Switch } from "antd";
import React, { useRef } from "react";
import AddModal from "./components/addModal";
import { schemasTitle } from "./schemas";
const Page: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [state, setState] = useSetState<any>({
    title: schemasTitle,
    isUpdateModalOpen: false,
    updateValue: {},
    optionType: "add", // add | edit | copy
  });
  const { title, isUpdateModalOpen, updateValue, optionType } = state;

  const columns: any = [
    {
      title: "设备名称",
      dataIndex: "title",
      ellipsis: true,
      sorter: true,
    },
    {
      title: "设备类型编码",
      dataIndex: "title1",
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: "状态",
      dataIndex: "title2",
      hideInSearch: true,
      ellipsis: true,
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
      title: "添加时间",
      dataIndex: "createTime",
      ellipsis: true,
      hideInSearch: true,
      sorter: true,
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
  const requestData: any = async (...args: any) => {
    try {
      const res = await getList({ params: args[0], sort: args[1] });
      return res;
    } catch {
      return {
        data: [
          {
            id: 1,
            title: "测试数据",
            title2: true,
            title1: 2,
            createTime: "测试数据",
          },
        ],
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
                isUpdateModalOpen: true,
                optionType: "add",
              });
            }}
            type="primary"
          >
            新建
          </Button>,
        ]}
      />
      <AddModal
        open={isUpdateModalOpen}
        type={optionType}
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
