import { getList } from "@/services/task-management/test-task.service";
import { ActionType, ProTable } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { message, Modal } from "antd";
import React, { useEffect, useRef } from "react";
interface TaskLIstModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (values: any) => void;
}
const taskListModal: React.FC<TaskLIstModalProps> = ({
  open,
  onCancel,
  onOk,
}) => {
  const actionRef = useRef<ActionType>();

  const [state, setState] = useSetState<any>({
    title: "",
    selectData: [],
  });
  const { title, selectData } = state;
  const columns: any = [
    {
      title: "任务名称",
      dataIndex: "title",
      ellipsis: true,
    },
    {
      title: "状态",
      dataIndex: "status",
      initialValue: "all",
      filters: true,
      onFilter: true,
      valueEnum: {
        all: { text: "已完成", status: "Success" },
        close: { text: "关闭", status: "Default" },
        running: { text: "运行中", status: "Processing" },
        online: { text: "已上线", status: "Success" },
        error: { text: "异常", status: "Error" },
      },
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      ellipsis: true,
      valueType: "dateTime",
    },
  ];
  useEffect(() => {
    if (!open) {
      setState({ selectData: [] });
    }
  }, [open]);
  const handleOk = () => {
    console.log(selectData);
    if (selectData.length === 0) {
      message.error("请选择测试任务");
      return;
    }
    onOk?.(selectData[0]);
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
            title2: 100,
            title3: "张三",
            title4: "测试数据",
            createTime: "2025-07-30",
            status: "all",
          },
          {
            id: "2",
            title: "测试数据2",
            title2: 70,
            title3: "李四",
            title4: "测试数据",
            createTime: "2025-07-30",
            status: "all",
          },
        ],
        total: 2,
        success: true,
      };
    }
  };
  return (
    <Modal
      title="测试任务"
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
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
        options={false}
        search={false}
        rowSelection={{
          type: "radio",
          onChange: (selectedRowKeys, selectedRows) => {
            setState({
              selectData: selectedRows,
            });
          },
        }}
      />
    </Modal>
  );
};

export default taskListModal;
