import { getList } from "@/services/case-management/case-run.service";
import { ActionType, ProTable } from "@ant-design/pro-components";
import { Modal, Select } from "antd";
import { useEffect, useRef } from "react";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  data?: any;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const VectorInfoModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  data,
}) => {
  const actionRef = useRef<ActionType>();

  useEffect(() => {
    if (open) {
    }
  }, [open]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Form values:", values);
        if (onOk) {
          onOk(values);
        }
      })
      .catch((errorInfo) => {
        console.error("Validation failed:", errorInfo);
      });
  };

  const columns = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
      width: 80,
    },
    {
      title: "通道名称",
      dataIndex: "name",
      editable: () => false,
      ellipsis: true,
    },
    {
      title: "通道类型",
      dataIndex: "type",
      ellipsis: true,
      editable: () => false,
    },
    {
      title: "使能状态",
      dataIndex: "status",
      ellipsis: true,
      valueType: "select",
      width: 100,
      valueEnum: {
        success: {
          text: "✓",
          status: "Success",
        },
        error: {
          text: "✗",
          status: "Error",
        },
      },
    },
    {
      ellipsis: true,
      title: "通道索引",
      dataIndex: "order",
      editable: () => false,
    },
    {
      title: "操作",
      dataIndex: "option",
      valueType: "option",
      width: 100,
      render: (text: any, record: any, _: any, action: any) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          编辑
        </a>,
      ],
    },
  ];

  const requestData = async (...args: any) => {
    try {
      const res = await getList({ params: args[0], sort: args[1] });
      return res;
    } catch {
      return {
        total: 2,
        data: [
          {
            name: "Virtual Channel",
            type: "CAN",
            status: "success",
            order: "0",
            id: 1,
          },
          {
            name: "Virtual Channel",
            type: "CAN",
            status: "success",
            order: "1",
            id: 2,
          },
        ],
      };
    }
  };
  return (
    <Modal
      title="VECTOR通道配置"
      //   maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
      footer={null}
    >
      <ProTable
        headerTitle="配置信息"
        columns={columns}
        options={false}
        search={false}
        actionRef={actionRef}
        editable={{
          type: "single",
          deletePopconfirmMessage: false,
          actionRender: (row, config, defaultDoms) => {
            return [defaultDoms.save, defaultDoms.cancel];
          },
          onSave: async (rowKey, data, row) => {
            console.log("保存数据:", data);
          },
          onCancel: async (rowKey, data, row) => {
            console.log("取消编辑");
          },
        }}
        cardBordered
        request={requestData}
        rowKey="id"
        pagination={{
          pageSize: 10,
          onChange: (page) => requestData,
        }}
      />
    </Modal>
  );
};

export default VectorInfoModal;
