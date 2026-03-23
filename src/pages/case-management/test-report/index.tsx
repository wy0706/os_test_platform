import {
  deleteOne,
  getList,
} from "@/services/system-management/command-management.service";
import {
  DownloadOutlined,
  EyeOutlined,
  SnippetsOutlined,
} from "@ant-design/icons";
import {
  ActionType,
  ProTable,
  TableDropdown,
} from "@ant-design/pro-components";
import { history, useAccess } from "@umijs/max";
import { useSetState } from "ahooks";

import { Button, message, Modal, Space } from "antd";
import React, { useRef } from "react";
import { schemasColumns } from "./schemas";

const ReportListTab: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const canEdit = access["testDesign-edit"];

  const [state] = useSetState<any>({
    columns: [
      {
        title: "序号",
        dataIndex: "index",
        valueType: "index",
        width: 100,
      },
      {
        title: "报告名称",
        dataIndex: "title",
        ellipsis: true,
      },
      {
        title: "生成日期",
        dataIndex: "createTime",
        search: false,
        ellipsis: true,
        sorter: true,
      },
    ],
  });

  const { columns } = state;

  const operationColumn = {
    title: "操作",
    valueType: "option",
    key: "option",
    width: 200,
    render: (text: any, record: any, index: any) => [
      <Button
        color="primary"
        variant="link"
        key="preview"
        icon={<EyeOutlined />}
        onClick={() => {
          history.push(`/case-management/test-report-detail/${record.id}`);
        }}
      >
        详情
      </Button>,
      <Button
        color="primary"
        variant="link"
        key="pdf"
        icon={<DownloadOutlined />}
        onClick={() => {}}
      >
        转成PDF
      </Button>,
      <TableDropdown
        key={index}
        onSelect={(key: string) => {
          switch (key) {
            case "excel":
              console.log("record", record);
              return;
            default:
              return;
          }
        }}
        menus={[{ key: "excel", name: "转成Word" }]}
      />,
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
            id: "1",
            title: "测试数据",
            createTime: "2025-07-30",
            status: 1,
          },
          {
            id: "2",
            title: "测试数据2",
            createTime: "2025-07-30",
            status: 2,
          },
          {
            id: "3",
            title: "测试数据3",
            createTime: "2025-07-30",
            status: 3,
          },
        ],
        total: 3,
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
      title: `确认批量删除 ${keys.length} 条测试报告吗？`,
      onOk: async () => {
        const ids = keys as number[];
        const idsParam = ids.length === 1 ? ids[0] : ids.join(",");
        const { code, message: msg } = await deleteOne(idsParam);

        if (code === 0) {
          message.success("删除成功");
          onCleanSelected?.();
          actionRef.current?.reloadAndRest?.();
        } else {
          message.error(msg || "删除失败");
        }
      },
    });
  };

  return (
    <ProTable<any>
      columns={canEdit ? [...schemasColumns, operationColumn] : schemasColumns}
      actionRef={actionRef}
      cardBordered
      request={requestData}
      dateFormatter="string"
      rowSelection={canEdit ? {} : false}
      tableAlertOptionRender={
        canEdit
          ? ({ selectedRowKeys, selectedRows, onCleanSelected }) => (
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
            )
          : false
      }
      toolBarRender={() =>
        canEdit
          ? [
              <Button
                key="button"
                icon={<SnippetsOutlined />}
                onClick={() => {
                  history.push(`/case-management/test-report-info`);
                }}
                type="primary"
              >
                生成报告控件
              </Button>,
            ]
          : []
      }
      rowKey="id"
      pagination={{
        pageSize: 10,
        onChange: (page, pageSize) => {
          console.log("当前页码:", page, "每页条数:", pageSize);
        },
      }}
      headerTitle="测试报告"
    />
  );
};

export default ReportListTab;
