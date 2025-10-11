import {
  createOne,
  deleteOne,
  getList,
} from "@/services/equipment-management/equipment-library.service";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  PageContainer,
  ProTable,
} from "@ant-design/pro-components";
import { history, useAccess } from "@umijs/max";
import DetailModal from "./components/detailModal";

import { transformParams } from "@/utils/params";
import { useSetState } from "ahooks";
import { Button, Form, message, Modal } from "antd";
import React, { useRef, useState } from "react";
import { schemasColumns, schemasTitle } from "./schemas";

const Page: React.FC = () => {
  const access = useAccess();

  const actionRef = useRef<ActionType>();
  const form: any = Form.useForm()[0];
  const [state, setState] = useSetState<any>({
    title: schemasTitle,
    detailValue: {},
    isPreviewModalOpen: false,
    detailsId: null,
  });
  const { title, isPreviewModalOpen, detailsId, detailValue } = state;

  const operationColumn = {
    title: "操作",
    valueType: "option",
    key: "option",
    width: 100,
    render: (text: any, record: any, index: any, action: any) => [
      <Button
        key="edit"
        variant="link"
        color="danger"
        icon={<DeleteOutlined />}
        onClick={() => {
          Modal.confirm({
            title: (
              <div>
                <div>
                  确认删除设备配置文件{" "}
                  <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
                    {record.title}
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
                  设备配置文件删除后不可恢复
                </div>
              </div>
            ),
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
  };
  const requestData: any = async (...args: any) => {
    let params = transformParams({ params: args[0], sort: args[1] });
    const { code, data, message: msg } = await getList({ ...params });

    if (code !== 0) {
      message.error(msg);
      return { data: [], total: 0, success: false };
    }
    return {
      data: data?.list_info || [],
      total: data?.total_cnt,
      success: true,
    };
  };

  //   处理行点击事件
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const handleRowClick = (record: any, index: number) => {
    history.push(`/equipment-management/equipment-library-edit/${record.id}`);
    // 更新选中的行
    setSelectedRow(record);
  };

  const handleAdd = async () => {
    const { code, message: msg, data } = await createOne();
    if (code !== 0) {
      message.error(msg || "操作失败");
      return;
    }

    history.push("/equipment-management/equipment-library-edit/add");
  };
  return (
    <PageContainer>
      <ProTable<any>
        columns={
          access["equipmentManagement-edit"]
            ? [...schemasColumns, operationColumn]
            : schemasColumns
        }
        actionRef={actionRef}
        cardBordered
        request={requestData}
        rowKey="id"
        pagination={{
          pageSize: 10,
        }}
        dateFormatter="string"
        headerTitle={title.label}
        toolBarRender={() =>
          access["equipmentManagement-edit"]
            ? [
                <Button
                  key="button"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                  type="primary"
                >
                  新建
                </Button>,
              ]
            : []
        }
        onRow={(record, index) =>
          access["equipmentManagement-edit"]
            ? {
                onClick: (e) => {
                  // 检查点击的元素是否在操作栏内
                  const target = e.target as HTMLElement;
                  const isActionColumn =
                    target.closest(".ant-table-cell:last-child") ||
                    target.closest(".ant-btn") ||
                    target.closest("button") ||
                    target.closest("a");

                  // 如果点击的是操作栏，则不跳转
                  if (isActionColumn) {
                    e.stopPropagation();
                    return;
                  }

                  // 否则执行正常的行点击逻辑
                  handleRowClick(record, index || 0);
                },
                style: {
                  cursor: "pointer",
                  backgroundColor:
                    selectedRow?.id === record.id ? "#e6f7ff" : "transparent",
                },
              }
            : {}
        }
      />

      <DetailModal
        open={isPreviewModalOpen}
        details={detailValue}
        onCancel={() => {
          setState({ isPreviewModalOpen: false });
        }}
      />
    </PageContainer>
  );
};

export default Page;
