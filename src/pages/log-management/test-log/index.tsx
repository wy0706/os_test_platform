import { deleteOne, getList } from "@/services/log-management/test-log.service";
import { transformParams } from "@/utils/params";
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
import { schemasColumns, schemasTitle } from "./schemas";

const Page: React.FC = () => {
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  const form: any = Form.useForm()[0];
  const [state, setState] = useSetState<any>({
    title: schemasTitle,
  });
  const { title } = state;
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
                message.error(res.message || "操作失败");
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
        const ids = keys as number[];
        let idsParam: any = ids.length === 1 ? ids[0] : ids.join(",");
        const { code, message: msg } = await deleteOne(idsParam);
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
      <Access accessible={!!access["logManagement-edit"]}>
        <ProTable<any>
          columns={[...schemasColumns, operationColumn]}
          actionRef={actionRef}
          cardBordered
          request={requestData}
          rowSelection={{}} // 多选
          tableAlertRender={({ selectedRowKeys }) => (
            <Space size={24}>
              <span>已选 {selectedRowKeys.length} 项</span>
            </Space>
          )}
          dateFormatter="string"
          tableAlertOptionRender={({
            selectedRowKeys,
            selectedRows,
            onCleanSelected,
          }) => (
            <Space size={16}>
              <Button
                danger
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
