import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CiOutlined,
  CopyFilled,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, message, Modal } from "antd";
import React, { useEffect, useState } from "react";
import EditModal from "./editModal";

interface PreProps {
  onOk?: (values: any) => void;
  onCancel?: () => void;
  updateValue?: any;
  onEdit?: (values: any, type: string) => void;
  data?: any; //table数据
  onChange?: (data: any[], index?: number) => void; //table变化
  selectedRowKeys?: any;
  onInsert?: () => void; //插入
  onCopy?: () => void; //复制 ,复制当前选中行数据
  onPaste?: () => void; //粘贴，把复制到的数据粘贴到当前选中行下方
  onCut?: () => void; //剪切，剪切当前选中行数据，并插入到当前行下方
  onRowClick?: (record: any, index: number) => void;
}

const PrePage: React.FC<PreProps> = ({
  data,
  onEdit,
  onChange,
  selectedRowKeys,
  onInsert,
  onCopy,
  onPaste,
  onCut,
  onRowClick,
}) => {
  const [tableData, setTableData] = useState<any[]>(data || []); // 表格数据状态管理，支持接口数据
  const [state, setState] = useSetState<any>({
    updateValue: {},
    isEditModalOpen: false,
    currentValue: {},
  });
  const { updateValue, isEditModalOpen, currentValue } = state;
  const columns = [
    {
      title: "激活",
      dataIndex: "status",
      ellipsis: true,
      valueType: "select",
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
      title: "测试项目",
      dataIndex: "title",
      ellipsis: true,
    },
    {
      title: "扩展名",
      dataIndex: "extension",
      ellipsis: true,
    },
    {
      title: "报告",
      valueType: "select",
      dataIndex: "report",
      ellipsis: true,
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
      valueType: "option",
      key: "option",
      width: 130,
      fixed: "right",
      render: (
        text: any,
        record: { id: any },
        index: number,
        action: { startEditable: (arg0: any) => void }
      ) => {
        const currentTableData = tableData || [];
        const isFirst = index === 0;
        const isLast = index === currentTableData.length - 1;

        return [
          <a
            key="editable"
            onClick={() => {
              // action?.startEditable?.(record.id);
              setState({
                isEditModalOpen: true,
                updateValue: record,
              });
            }}
            style={{ marginRight: 10, color: "#1677ff" }}
          >
            <EditOutlined style={{ marginRight: 4 }} />
          </a>,
          <a
            key="up"
            onClick={(e) => {
              e.stopPropagation();
              if (!isFirst) {
                moveRow(index, "up");
              }
            }}
            style={{
              marginRight: 10,
              cursor: isFirst ? "not-allowed" : "pointer",
              opacity: isFirst ? 0.5 : 1,
              color: isFirst ? "#ccc" : "#1677ff",
            }}
          >
            <ArrowUpOutlined style={{ marginRight: 4 }} />
          </a>,
          <a
            key="down"
            onClick={(e) => {
              e.stopPropagation();
              if (!isLast) {
                moveRow(index, "down");
              }
            }}
            style={{
              marginRight: 10,
              cursor: isLast ? "not-allowed" : "pointer",
              opacity: isLast ? 0.5 : 1,
              color: isLast ? "#ccc" : "#1677ff",
            }}
          >
            <ArrowDownOutlined style={{ marginRight: 4 }} />
          </a>,
          <a
            key="delete"
            onClick={(e) => {
              e.stopPropagation();
              deleteRow(index);
            }}
            style={{ color: "#ff4d4f" }}
          >
            <DeleteOutlined style={{ marginRight: 4 }} />
          </a>,
        ];
      },
    },
  ];
  // 监听外部数据变化
  useEffect(() => {
    if (data && data.length > 0) {
      setTableData(data);
    }
  }, [data]);
  // 上下移动行
  const moveRow = (index: number, direction: "up" | "down") => {
    setTableData((currentTableData: any[]) => {
      const newData = [...currentTableData];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      // 边界检查
      if (targetIndex < 0 || targetIndex >= newData.length)
        return currentTableData;
      // 交换位置
      [newData[index], newData[targetIndex]] = [
        newData[targetIndex],
        newData[index],
      ];
      onChange && onChange(newData);
      return newData;
    });
  };
  // 删除行
  const deleteRow = (index: number) => {
    Modal.confirm({
      title: "确认删除吗 ？",
      onOk: () => {
        // 使用函数式setState来获取最新的tableData
        setTableData((currentTableData: any[]) => {
          console.log("index", index, currentTableData);
          const newData = [...currentTableData];
          // 删除指定索引的行
          newData.splice(index, 1);
          // 重新计算序号
          newData.forEach((item, newIndex) => {
            item.sequence = newIndex + 1;
          });
          onChange && onChange(newData, index);
          return newData;
        });
        message.success("删除成功");
      },
    });
  };

  return (
    <div className="postPage-page">
      <ProTable<any>
        columns={columns}
        search={false}
        options={false}
        // cardBordered
        dataSource={tableData}
        rowKey="id"
        pagination={false}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => onInsert && onInsert()}
          >
            插入
          </Button>,
          <Button
            key="button"
            icon={<CopyFilled />}
            onClick={() => onCopy && onCopy()}
          >
            复制
          </Button>,
          <Button
            key="button"
            icon={<CopyOutlined />}
            onClick={() => onPaste && onPaste()}
          >
            粘贴
          </Button>,
          <Button
            key="button"
            icon={<CiOutlined />}
            onClick={() => onCut && onCut()}
          >
            剪切
          </Button>,
        ]}
        size="small"
        onRow={(record, index) => ({
          onClick: () => onRowClick && onRowClick(record, index || 0),
        })}
        rowClassName={(record, index) =>
          selectedRowKeys === index ? "selected-row" : ""
        }
      />

      <EditModal
        open={isEditModalOpen}
        updateValue={updateValue}
        type="pre"
        onCancel={() => {
          setState({ isEditModalOpen: false });
        }}
        onOk={(values, type) => {
          setState({ isEditModalOpen: false });
          const newData = [...tableData];
          let list = newData.map((item) =>
            item.id === values.id ? values : item
          );
          setTableData(list);
          onChange && onChange(list);
        }}
      />
    </div>
  );
};

export default PrePage;
