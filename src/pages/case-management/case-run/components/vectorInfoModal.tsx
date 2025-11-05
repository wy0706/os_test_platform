import {
  getVectorList,
  updateVectorOne,
} from "@/services/case-management/case-run.service";
import { ActionType, ProTable } from "@ant-design/pro-components";
import { message, Modal, Select } from "antd";
import { isArray } from "lodash";
import { useRef } from "react";
interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  autoId: any;
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
  autoId,
}) => {
  const actionRef = useRef<ActionType>();

  const columns = [
    // {
    //   title: "序号",
    //   dataIndex: "index",
    //   valueType: "index",
    //   width: 80,
    // },
    {
      ellipsis: true,
      title: "通道索引",
      dataIndex: "Chnlindex",
      editable: () => false,
    },
    {
      title: "通道名称",
      dataIndex: "ChannelName",
      editable: () => false,
      ellipsis: true,
    },
    {
      title: "通道类型",
      dataIndex: "ChannelType",
      ellipsis: true,
      editable: () => false,
    },
    {
      title: "使能状态",
      dataIndex: "Enable",
      ellipsis: true,
      valueType: "select",
      width: 120,
      valueEnum: {
        True: {
          text: "✓",
          status: "Success",
        },
        False: {
          text: "✗",
          status: "Error",
        },
      },
    },

    {
      title: "操作",
      dataIndex: "option",
      valueType: "option",
      width: 100,
      render: (text: any, record: any, _: any, action: any) => [
        <a
          style={{ marginLeft: 5 }}
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
      const { code, data, message: msg } = await getVectorList();
      if (code !== 0) {
        message.error(msg || "获取列表失败");
        return {
          success: false,
          total: 0,
          data: [],
        };
      }
      let list = isArray(data) ? data : [];
      return {
        success: true,
        total: list.length,
        data: list,
      };
    } catch {
      return {
        success: false,
        total: 0,
        data: [],
      };
    }
  };
  return (
    <Modal
      title="VECTOR通道配置"
      maskClosable={false}
      destroyOnHidden
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      width={"50%"}
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
            const { code, message: msg } = await updateVectorOne({ ...data });
            if (code === 0) {
              message.success(msg || "操作成功");
            } else {
              message.error(msg || "操作失败");
            }
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
        }}
      />
    </Modal>
  );
};

export default VectorInfoModal;
