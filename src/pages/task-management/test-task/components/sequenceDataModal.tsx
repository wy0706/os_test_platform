import {
  ActionType,
  ProTable,
  type ProFormInstance,
} from "@ant-design/pro-components";
import { message, Modal } from "antd";
import React, { useEffect, useRef, useState } from "react";

interface SetMemberModalProps {
  open: boolean;
  updateValue?: any;
  type?: string;
  onSuccess?: (values: any) => void;

  onCancel?: () => void;
  formSchema?: any;
  onOk?: (values: any) => void; // 新增
  onInnerCancel?: () => void; // 新增
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
  updateValue,
  onSuccess,
  onCancel,
  formSchema,
  type,
  onOk, // 新增
  onInnerCancel, // 新增
}) => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance | null>(null);
  const [title, setTitle] = useState("新建");
  const [selectedRow, setSelectedRow] = useState<TableRecord | null>(null);

  useEffect(() => {
    const name = type === "edit" ? "编辑" : type === "copy" ? "复制" : "新建";
    setTitle(name);
    if (open) {
      formRef.current?.resetFields();
      // if (isUpdate && updateValue) {
      //   console.log("uodateCalue", updateValue);
      //   formRef.current?.setFieldsValue(updateValue);
      // }
      if ((type === "edit" || type === "copy") && updateValue) {
        console.log("uodateCalue====", updateValue);
        formRef.current?.setFieldsValue(updateValue);
      }
    }
  }, [open, type, updateValue]);

  const handleOk = () => {
    if (!selectedRow) {
      message.error("请先选择一行数据");
      return;
    }
    console.log("selectedRow", selectedRow);
    if (onSuccess) {
      onSuccess(selectedRow); // 新增
      return;
    }
  };

  const handleCancel = () => {
    if (onInnerCancel) {
      onInnerCancel(); // 新增
      return;
    }
    if (onCancel) {
      onCancel();
    }
    formRef.current?.resetFields();
  };

  // 处理行点击事件
  const handleRowClick = (record: TableRecord, index: number) => {
    console.log("点击的行数据:", record);
    console.log("行索引:", index);
    setSelectedRow(record);
    // message.success(`已选择: ${record.title}`);

    // 在这里可以执行其他操作，比如：
    // - 打开详情弹窗
    // - 跳转到详情页面
    // - 更新表单数据
    // - 触发其他业务逻辑
  };

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
        maskClosable={false}
        title="选择测试文件"
        open={open}
        onCancel={handleCancel}
        onOk={handleOk}
        width={"60%"}
        styles={{ body: { minHeight: 500, padding: 20 } }}
      >
        {/* {selectedRow && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              backgroundColor: "#f5f5f5",
              borderRadius: 4,
            }}
          >
            <strong>当前选中:</strong> {selectedRow.title} -{" "}
            {selectedRow.title2}
          </div>
        )} */}

        <ProTable<TableRecord>
          columns={columns}
          actionRef={actionRef}
          cardBordered
          dataSource={mockData}
          // request={requestData}
          rowKey="id"
          pagination={{
            pageSize: 10,
            onChange: (page) => requestData,
          }}
          headerTitle="测试文件列表"
          onRow={(record, index) => ({
            onClick: () => handleRowClick(record, index || 0),
            style: {
              cursor: "pointer",
              backgroundColor:
                selectedRow?.id === record.id ? "#e6f7ff" : "transparent",
            },
          })}
        />
      </Modal>
    </>
  );
};

export default SequenceDataModal;
