import { deleteOne, getList } from "@/services/log-management/test-log.service";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import {
  ActionType,
  PageContainer,
  ProTable,
} from "@ant-design/pro-components";
import { Access, history, useAccess } from "@umijs/max";
import { useSetState } from "ahooks";
import { Button, Form, message, Modal, Space } from "antd";
import React, { useRef } from "react";
import { schemasColumns, schemasDescriptions, schemasTitle } from "./schemas";

const Page: React.FC = () => {
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  const form: any = Form.useForm()[0];
  const [state, setState] = useSetState<any>({
    title: schemasTitle,
    isPreviewModalOpen: false,
    detailsId: null,
    descriptionsColumns: schemasDescriptions,
  });
  const { title, isPreviewModalOpen, detailsId, descriptionsColumns } = state;
  const operationColumn = {
    title: "操作",
    valueType: "option",
    key: "option",
    width: 150,
    render: (text: any, record: any, index: any, action: any) => [
      <Button
        key="preview"
        variant="link"
        color="primary"
        icon={<EyeOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          history.push(`/log-management/test-log-detail/${record.id}`);
        }}
      >
        详情
      </Button>,
      <Button
        key="edit"
        variant="link"
        color="primary"
        icon={<DeleteOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          Modal.confirm({
            title: "是否确认删除？",
            onOk: async () => {
              const res: any = await deleteOne(record.id);
              if (res.code !== 0) {
                message.error(res.message);
                return;
              }
              message.success("删除成功");
              if (actionRef.current) {
                actionRef.current.reload();
              }
            },
          });
        }}
      >
        删除
      </Button>,
      <div
        key={`dropdown-${index}`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      ></div>,
    ],
  };
  const requestData: any = async (...args: any) => {
    try {
      const res = await getList({ params: args[0], sort: args[1] });
      return res;
    } catch {
      return {
        data: [
          {
            id: 1,
            title: "测试数据1",
            code: "001",
            createTime: "205-10-01 10:12:09",
          },
          {
            id: 2,
            title: "测试数据2",
            code: "002",
            createTime: "205-10-01 12:02:30",
          },
        ],
        total: 2,
        success: true,
      };
    }
  };
  const handleDeleteAll = async (
    keys: React.Key[],
    rows: any[],
    onCleanSelected?: () => void
  ) => {
    if (!keys?.length) {
      message.warning("请先选择数据");
      return;
    }

    Modal.confirm({
      title: `确认批量删除 ${keys.length} 条测试日志吗？`,
      onOk: async () => {
        const ids = keys as number[]; // 或 rows.map(r => r.id)
        const { code, message: msg } = await deleteOne(ids);
        if (code === 0) {
          message.success("删除成功");
          onCleanSelected?.(); // 清空已选
          actionRef.current?.reloadAndRest?.(); // 刷新并重置
        } else {
          message.error(msg || "删除失败");
        }
      },
    });
  };
  return (
    <PageContainer>
      {/* <ProTable<any>
        columns={
          access["logManagement-edit"]
            ? [...schemasColumns, operationColumn]
            : schemasColumns
        }
        actionRef={actionRef}
        cardBordered
        dateFormatter="string"
        request={requestData}
        rowSelection={{}}
        // rowSelection={{ preserveSelectedRowKeys: true }} // 需要跨页保留勾选
        tableAlertRender={({
          selectedRowKeys,
          selectedRows,
          onCleanSelected,
        }) => {
          return (
            <Space size={24}>
              <span>已选 {selectedRowKeys.length} 项</span>
            </Space>
          );
        }}
        tableAlertOptionRender={({
          selectedRowKeys,
          selectedRows,
          onCleanSelected,
        }) => (
          <Space size={16}>
            <Button
              type="primary"
              onClick={() =>
                handleDeleteAll(selectedRowKeys, selectedRows, onCleanSelected)
              }
            >
              批量删除
            </Button>
          </Space>
        )}
        rowKey="id"
        pagination={{
          pageSize: 10,
          onChange: (page) => requestData,
        }}
        headerTitle={title.label}
      /> */}

      <Access accessible={!!access["logManagement-edit"]}>
        <ProTable<any>
          columns={[...schemasColumns, operationColumn]}
          actionRef={actionRef}
          cardBordered
          dateFormatter="string"
          request={requestData}
          rowSelection={{}} // 多选
          tableAlertRender={({ selectedRowKeys }) => (
            <Space size={24}>
              <span>已选 {selectedRowKeys.length} 项</span>
            </Space>
          )}
          tableAlertOptionRender={({
            selectedRowKeys,
            selectedRows,
            onCleanSelected,
          }) => (
            <Space size={16}>
              <Button
                type="primary"
                onClick={() =>
                  handleDeleteAll(
                    selectedRowKeys,
                    selectedRows,
                    onCleanSelected
                  )
                }
              >
                批量删除
              </Button>
            </Space>
          )}
          rowKey="id"
          pagination={{
            pageSize: 10,
            onChange: (page) => requestData,
          }}
          headerTitle={title.label}
        />
      </Access>
      {/* 只有预览权限时：普通表格 */}
      <Access accessible={!!access["logManagement-preview"]}>
        <ProTable<any>
          columns={schemasColumns}
          actionRef={actionRef}
          cardBordered
          dateFormatter="string"
          request={requestData}
          rowKey="id"
          pagination={{
            pageSize: 10,
            onChange: (page) => requestData,
          }}
          headerTitle={title.label}
        />
      </Access>
    </PageContainer>
  );
};

export default Page;
