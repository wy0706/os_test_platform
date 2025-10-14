import {
  getNewVisa,
  updateTypeAndModal,
} from "@/services/equipment-management/equipment-library-edit.service";
import { isArray } from "@/utils";
import { ActionType, ProTable } from "@ant-design/pro-components";
import { Button, message, Modal, Space } from "antd";
import React, { useEffect, useRef, useState } from "react";

interface SetMemberModalProps {
  open: boolean;
  onCancel?: () => void;
  onOk?: (keys: any) => void;
  data?: any;
}

const columns: any = [
  { title: "序号", dataIndex: "index", hideInSearch: true },
  { title: "Visa", dataIndex: "name" },
];

const TasksModal: React.FC<SetMemberModalProps> = ({
  open,
  onCancel,
  onOk,
  data,
}) => {
  const actionRef = useRef<ActionType>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // 记录当前表格数据的映射，便于校验和回填
  const [rowMap, setRowMap] = useState<Record<string | number, any>>({});

  // 当 modal 打开 或 表格数据变化 时，校验并回填选中
  useEffect(() => {
    if (!open) return;
    const key = data?.paras;
    if (key !== undefined && key !== null && rowMap.hasOwnProperty(key)) {
      setSelectedRowKeys([key]);
      setSelectedRows([rowMap[key]]);
    } else {
      // 不匹配就不赋值（清空）
      setSelectedRowKeys([]);
      setSelectedRows([]);
    }
  }, [open, data?.paras, rowMap]);

  const handleOk = async () => {
    console.log("selectedRowKeys", selectedRowKeys);
    if (selectedRowKeys.length == 0) {
      message.warning("请选择数据");
      return;
    }
    try {
      setConfirmLoading(true);
      const { code, message: msg } = await updateTypeAndModal({
        index: data.instr_id,
        paras: selectedRowKeys[0],
      });
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");
      onOk?.(selectedRowKeys[0]);
    } finally {
      setConfirmLoading(false);
    }
  };

  const requestData = async () => {
    const { code, data, message: msg } = await getNewVisa();
    if (code !== 0) {
      message.error(msg || "操作失败");
      return { data: [], total: 0, success: false };
    }
    const list = !isArray(data)
      ? []
      : data.map((item: any, index: number) => ({
          name: item,
          id: item, // id 与 data.paras 类型需一致
          index: index + 1,
        }));
    return {
      data: list,
      total: list.length,
      success: true,
    };
  };

  return (
    <Modal
      maskClosable={false}
      title="设备参数种类配置"
      open={open}
      destroyOnHidden
      confirmLoading={confirmLoading}
      width={"50%"}
      styles={{ body: { padding: 20, maxHeight: 500, overflow: "auto" } }}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button onClick={() => actionRef.current?.reload()}>刷新</Button>
          <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" onClick={handleOk}>
              确定
            </Button>
          </Space>
        </div>
      }
    >
      <ProTable<any>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        options={false}
        request={requestData}
        search={false}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        // 表格数据加载后更新映射，供回填用
        onLoad={(dataSource) => {
          const m: Record<string | number, any> = {};
          dataSource.forEach((row: any) => {
            m[row.id] = row;
          });
          setRowMap(m);
        }}
        rowSelection={{
          type: "radio",
          selectedRowKeys,
          onChange: (keys, rows) => {
            const lastKey = keys[keys.length - 1];
            const lastRow = rows[rows.length - 1];
            setSelectedRowKeys(lastKey ? [lastKey] : []);
            setSelectedRows(lastRow ? [lastRow] : []);
          },
        }}
        tableAlertRender={false}
        onRow={(record) => ({
          onClick: () => {
            setSelectedRowKeys([record.id]);
            setSelectedRows([record]);
          },
        })}
      />
    </Modal>
  );
};

export default TasksModal;
