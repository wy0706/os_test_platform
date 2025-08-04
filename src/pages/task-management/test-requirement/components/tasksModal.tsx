import { ActionType, ProTable } from "@ant-design/pro-components";
import { Modal, Space, Table } from "antd";
import React, { useEffect, useRef, useState } from "react";

interface SetMemberModalProps {
  open: boolean;
  onCancel?: (keys: any, rows: any) => void;
  onOk?: (keys: any, rows: any) => void;
  selectKeys: React.Key[];
  selectRows: TableRecord[];
}

// 定义数据类型
interface TableRecord {
  id?: string;
  title: string;
  status: number;
  createTime: string;
  index?: number;
}

const columns: any = [
  {
    title: "序号",
    dataIndex: "index",
    // valueType: "indexBorder",
    search: false,
  },
  {
    title: "任务名称",
    dataIndex: "title",
  },
  {
    title: "状态",
    dataIndex: "status",
    ellipsis: true,
    sorter: true,
    // initialValue: "all",
    filters: true,
    onFilter: true,
    valueEnum: {
      1: { text: "已完成", status: "Success" },
      2: { text: "未完成", status: "Default" },
    },
    // sorter: true,
  },

  {
    title: "日期和时间",
    dataIndex: "createTime",
    ellipsis: true,
    sorter: true,
    search: false,
    valueType: "dateTime",
  },
];

const TasksModal: React.FC<SetMemberModalProps> = ({
  open,
  onCancel,
  onOk,
  selectKeys,
  selectRows,
}) => {
  const actionRef = useRef<ActionType>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<TableRecord[]>([]);

  useEffect(() => {
    if (open) {
      setSelectedRowKeys(selectKeys);
      setSelectedRows(selectRows);
    }
  }, [open]);

  const handleOk = () => {
    if (onOk) {
      onOk(selectedRowKeys, selectedRows);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel(selectedRowKeys, selectedRows);
    }
    // formRef.current?.resetFields();
  };

  // 示例数据
  const mockData: TableRecord[] = [
    {
      id: "1",
      title: "测试1",
      status: 1,
      createTime: "2023-10-01 12:00:00",
      index: 1,
    },
    {
      id: "2",
      title: "测试2",
      status: 2,
      createTime: "2023-10-02 14:30:00",
      index: 2,
    },
    {
      id: "32",
      title: "测试3",
      status: 2,
      createTime: "2023-10-02 14:30:00",
      index: 3,
    },
    {
      id: "4",
      title: "测试4",
      status: 1,
      createTime: "2023-10-02 14:30:00",
      index: 4,
    },
    {
      id: "5",
      title: "测试5",
      status: 2,
      createTime: "2023-10-02 14:30:00",
      index: 5,
    },
  ];

  return (
    <>
      <Modal
        // maskClosable={false}
        title="选择测试文件"
        open={open}
        onCancel={handleCancel}
        onOk={handleOk}
        width={"60%"}
        footer={null}
        styles={{ body: { minHeight: 500, padding: 20 } }}
      >
        <ProTable<TableRecord>
          columns={columns}
          actionRef={actionRef}
          cardBordered
          options={false}
          dataSource={mockData}
          // request={requestData}
          rowKey="id"
          pagination={{
            pageSize: 2,
          }}
          headerTitle="测试文件列表"
          rowSelection={{
            selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
            selectedRowKeys: selectedRowKeys,
            onChange: (keys, rows) => {
              setSelectedRowKeys(keys);
              setSelectedRows(rows);
            },
          }}
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
        />
      </Modal>
    </>
  );
};

export default TasksModal;
