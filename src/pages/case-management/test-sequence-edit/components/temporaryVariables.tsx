import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, message, Modal } from "antd";
import React from "react";
import TempModal from "./tempModal";
interface ConditionsProps {
  data: any[]; //table数据
  onChange?: (data: any, selectedRowIndex: number) => void;
  selectedRowIndex?: any;
}

const TemporaryVariables: React.FC<ConditionsProps> = ({
  data,
  onChange,
  selectedRowIndex,
}) => {
  const [state, setState] = useSetState<any>({
    title: "",
    isPrecisionModalOpen: false,
    precisionValue: {}, //当前点击数据类型的整行数据
    isEditModalOpen: false,
    editValue: {},
  });

  // 动态创建列定义，确保操作列能响应tableData变化
  const columns = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
      width: 80,
    },
    {
      title: "扩展名",
      dataIndex: "extensionName",
      ellipsis: true,
      key: "extensionName",
    },
    {
      title: "变量名",
      ellipsis: true,
      dataIndex: "variableName",
    },
    {
      title: "数据类型",
      dataIndex: "dataType",
      ellipsis: true,
      valueType: "select",
    },

    {
      title: "数组大小",
      ellipsis: true,
      dataIndex: "arraySize",
    },
    {
      title: "单位",
      ellipsis: true,
      dataIndex: "unit",
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      width: 130,
      fixed: "right" as const,
      render: (text: any, record: any, index: number, action: any) => {
        // 动态获取当前表格数据长度来判断是否为最后一条
        const currentTableData = data || [];
        const isFirst = index === 0;
        const isLast = index === currentTableData.length - 1;

        return [
          <a
            key="editable"
            onClick={() => {
              // action?.startEditable?.(record.id);
              setState({ isEditModalOpen: true, editValue: record });
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

  const { title, editValue, isEditModalOpen } = state;

  const moveRow = (index: number, direction: "up" | "down") => {
    const newData = [...data];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newData.length) return;

    [newData[index], newData[targetIndex]] = [
      newData[targetIndex],
      newData[index],
    ];

    newData.forEach((item, i) => {
      item.sequence = i + 1;
    });
    // 更新选中行
    let newSelected = selectedRowIndex;
    if (selectedRowIndex === index) {
      newSelected = targetIndex;
    } else if (selectedRowIndex === targetIndex) {
      newSelected = index;
    }

    onChange?.(newData, newSelected);
  };
  // 删除行
  const deleteRow = (index: number) => {
    Modal.confirm({
      title: "确认删除吗？",
      onOk: () => {
        const newData = [...data];
        newData.splice(index, 1);
        newData.forEach((item, newIndex) => {
          item.sequence = newIndex + 1;
        });

        message.success("删除成功");

        // 删除后更新选中行索引
        let newSelected = selectedRowIndex;
        if (newData.length === 0) {
          newSelected = -1;
        } else if (selectedRowIndex >= newData.length) {
          newSelected = newData.length - 1;
        }

        onChange?.(newData, newSelected);
      },
    });
  };

  // 点击行
  const handleRowClick = (_record: any, index: number) => {
    onChange?.(data, index);
  };

  const handleInsertClick = () => {
    const newRowData = {
      id: Date.now(), // 使用时间戳作为唯一ID
      extensionName: "",
      variableName: "",
      dataType: "bytearray",
      arraySize: 1,
      unit: "",
      visible: "success",
    };

    const insertIndex =
      selectedRowIndex >= 0 ? selectedRowIndex + 1 : data.length;
    const newTableData = [...data];
    newTableData.splice(insertIndex, 0, newRowData);

    // 更新序号
    newTableData.forEach((item, index) => {
      item.sequence = index + 1;
    });

    message.success(
      data.length === 0 ? "已插入第一行" : `已在第${insertIndex + 1}行插入`
    );

    onChange?.(newTableData, insertIndex);
  };

  return (
    <div className="conditions-page">
      <ProTable
        columns={columns}
        dataSource={data}
        rowKey="id"
        search={false}
        pagination={false}
        options={false}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={handleInsertClick}
          >
            插入
          </Button>,
        ]}
        size="small"
        onRow={(record, index) => ({
          onClick: () => handleRowClick(record, index || 0),
        })}
        rowClassName={(record, index) =>
          selectedRowIndex === index ? "selected-row" : ""
        }
      />

      <TempModal
        open={isEditModalOpen}
        onCancel={() => setState({ isEditModalOpen: false })}
        type="edit"
        updateValue={editValue}
        onOk={(values) => {
          const newData = data.map((item: any) =>
            item.id === editValue.id ? { ...item, ...values } : item
          );
          // 通知父组件更新数据
          onChange?.(newData, selectedRowIndex);
          setState({ isEditModalOpen: false });
          message.success("保存成功");
        }}
      />
      {/* <Modal title="编辑测试条件" open={isEditModalOpen}></Modal> */}
    </div>
  );
};

export default TemporaryVariables;
