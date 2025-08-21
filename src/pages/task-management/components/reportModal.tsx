import { getList } from "@/services/task-management/test-requirement.service";
import { ActionType, ProTable } from "@ant-design/pro-components";
import { Modal } from "antd";
import React, { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onCancel: () => void;
}

const ReportModal: React.FC<ModalProps> = ({ open, onCancel }) => {
  const actionRef = useRef<ActionType>();

  useEffect(() => {
    if (open) {
      actionRef?.current?.reload();
    }
  }, [open]);

  const columns = [
    {
      title: "序号",
      dataIndex: "index",
      key: "index",
      valueType: "index",
      width: 100,
    },
    {
      title: "用例名称",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "测试结果",
      dataIndex: "result",
      key: "result",
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
            id: "1",
            title: "测试数据",
            result: "PASS",
          },
          {
            id: "2",
            title: "测试数据",
            result: "PASS",
          },
        ],
        total: 2,
        success: true,
      };
    }
  };

  return (
    <div className="addModal-page">
      <Modal
        title="测试结果"
        open={open}
        onCancel={() => {
          onCancel && onCancel();
        }}
        footer={null}
        width={800}
        styles={{ body: { minHeight: 200, padding: 20 } }}
      >
        <ProTable<any>
          options={false}
          columns={columns}
          actionRef={actionRef}
          cardBordered
          search={false}
          request={requestData}
          rowKey="id"
          pagination={{
            pageSize: 10,
            onChange: (page) => requestData,
          }}
        />
      </Modal>
    </div>
  );
};

export default ReportModal;
