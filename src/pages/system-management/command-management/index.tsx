import {
  deleteOne,
  getList,
} from "@/services/system-management/command-management.service";
import { transformParams } from "@/utils/params";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  PageContainer,
  ProTable,
} from "@ant-design/pro-components";
import { useAccess } from "@umijs/max";
import { useSetState } from "ahooks";
import { Button, message, Modal } from "antd";
import React, { useRef } from "react";
import AddModal from "./components/addModal";
import { schemasTitle } from "./schemas";
const Page: React.FC = () => {
  const access = useAccess();

  const actionRef = useRef<ActionType>();
  const [state, setState] = useSetState<any>({
    title: schemasTitle,
    isUpdateModalOpen: false,
    updateValue: {},
    optionType: "add",
  });
  const { title, isUpdateModalOpen, updateValue, optionType } = state;

  const requestData: any = async (...args: any) => {
    let params = transformParams({ params: args[0], sort: args[1] });
    const { code, data, message: msg } = await getList({ ...params });
    if (code !== 0) {
      message.error(msg);
      return { data: [], total: 0, success: false };
    }
    return {
      data: data?.list || [],
      total: data?.total_cnt,
      success: code === 0,
    };
  };

  const operationColumn = {
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
              const { code, message: msg } = await deleteOne(record.command_id);
              if (code !== 0) {
                message.error(msg || "操作失败");
                return;
              }
              message.success(msg || "操作成功");
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
  };
  const schemasColumns: any = [
    {
      title: "命令名称",
      dataIndex: "testcommand",
      ellipsis: true,
    },
    {
      title: "ID",
      dataIndex: "command_id",
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: "设备类型",
      dataIndex: "device_type",
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: "是否激活",
      dataIndex: "active",
      // ellipsis: true,
      hideInSearch: true,
      valueEnum: {
        1: {
          text: "✓",
          status: "Success",
        },
        0: {
          text: "✗",
          status: "Error",
        },
      },
      // render: (text: any, record: any) => {
      //   return (
      //     <Switch
      //       disabled
      //       checked={!!record.active} // ✅ 更简洁安全
      //       size="small"
      //       style={{
      //         backgroundColor: !!record.active ? "#52c41a" : "#ff4d4f", // ✅ 绿色 / 红色
      //       }}
      //     />
      //   );
      // },
    },
    {
      title: "添加时间",
      dataIndex: "create_time",
      ellipsis: true,
      sorter: true,
      hideInSearch: true,
    },
    {
      title: "添加时间",
      dataIndex: "creat_time",
      hideInTable: true,
      valueType: "date",
    },
  ];

  const columns = access["systemManagement-edit"]
    ? [...schemasColumns, operationColumn]
    : schemasColumns;

  return (
    <PageContainer>
      <ProTable<any>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={requestData}
        rowKey="command_id"
        pagination={{
          pageSize: 10,
        }}
        headerTitle={title.label}
        toolBarRender={() =>
          access["systemManagement-edit"]
            ? [
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
              ]
            : []
        }
      />
      <AddModal
        type={optionType}
        open={isUpdateModalOpen}
        updateValue={updateValue}
        onCancel={() => {
          setState({ isUpdateModalOpen: false, updateValue: {} });
        }}
        onOk={(values) => {
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
