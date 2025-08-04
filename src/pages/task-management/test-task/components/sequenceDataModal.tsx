import { ActionType, ProTable } from "@ant-design/pro-components";
import { Modal } from "antd";
import React, { useEffect, useRef, useState } from "react";

interface SetMemberModalProps {
  open: boolean;
  onSelect?: (values: any) => void;
  onCancel?: () => void;
  selectedRow: any;
  onOk?: (values: any) => void;
}

// 定义数据类型
interface TableRecord {
  id?: string;
  title: string;
  title2: number;
  title3: string;
  createTime: string;
  index?: number;
}

const columns: any = [
  {
    title: "序号",
    dataIndex: "index",
    // valueType: "indexBorder",
  },
  {
    title: "测试程序名称",
    dataIndex: "title",
    ellipsis: true,
    // sorter: true,
  },

  {
    title: "发布",
    dataIndex: "title2",
    search: false,
    sorter: true,
    initialValue: "all",
    filters: true,
    onFilter: true,
    valueEnum: {
      1: { text: "YES", status: "Success" },
      2: { text: "NO", status: "Default" },
    },
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

const SequenceDataModal: React.FC<SetMemberModalProps> = ({
  open,
  onCancel,
  onSelect,
  onOk,
  selectedRow,
}) => {
  const actionRef = useRef<ActionType>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRowData, setSelectedRowData] = useState<TableRecord | null>(
    null
  );

  useEffect(() => {
    if (open) {
      // 重置选择状态
      // setSelectedRowKeys([]);
      setSelectedRowData(selectedRow);
    }
  }, [open]);
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }
  };

  // 处理行选择变化
  const handleRowSelectionChange = (
    selectedKeys: React.Key[],
    selectedRows: TableRecord[]
  ) => {
    setSelectedRowKeys(selectedKeys);
    setSelectedRowData(selectedRows[0] || null);

    // 调用父组件的选择回调
    // if (onSelect && selectedRows[0]) {
    //   onSelect(selectedRows[0]);
    // }
  };

  // 处理行点击事件
  // const handleRowClick = (record: TableRecord, index: number) => {
  //   console.log("点击的行数据:", record);
  //   if (onSelect) {
  //     onSelect(record);
  //     return;
  //   }
  // };

  const requestData = () => {};

  // 示例数据
  const mockData: TableRecord[] = [
    {
      id: "1",
      title: "测试1",
      title2: 1,
      title3: "这是一个测试描述",
      createTime: "2023-10-01 12:00:00",
      index: 1,
    },
    {
      id: "2",
      title: "测试2",
      title2: 2,
      title3: "这是另一个测试描述",
      createTime: "2023-10-02 14:30:00",
      index: 2,
    },
  ];

  return (
    <>
      <Modal
        zIndex={1100}
        // footer={null}
        maskClosable={false}
        title="选择测试文件"
        open={open}
        onCancel={handleCancel}
        width={"60%"}
        onOk={() => {
          if (onOk && selectedRowData) {
            onOk(selectedRowData);
          }
        }}
        styles={{ body: { minHeight: 500, padding: 20 } }}
      >
        <ProTable<TableRecord>
          columns={columns}
          actionRef={actionRef}
          cardBordered
          dataSource={mockData}
          options={false}
          // request={requestData}
          rowKey="id"
          pagination={{
            pageSize: 10,
            onChange: (page) => requestData,
          }}
          headerTitle="测试文件列表"
          rowSelection={{
            type: "radio", // 单选模式
            selectedRowKeys: selectedRowKeys,
            onChange: handleRowSelectionChange,
            columnWidth: 60,
          }}
          // onRow={(record, index) => ({
          //   onClick: () => handleRowClick(record, index || 0),
          //   style: {
          //     cursor: "pointer",
          //     backgroundColor:
          //       selectedRow?.id === record.id ? "#e6f7ff" : "transparent",
          //   },
          // })}
        />
      </Modal>
    </>
  );
};

export default SequenceDataModal;
