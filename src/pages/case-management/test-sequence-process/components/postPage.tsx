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
import React from "react";
import EditModal from "./editModal";

interface PreProps {
  data: any; //table数据
  onChange?: (data: any, selectedRowIndex: number) => void;
  selectedRowIndex?: any;
  treeSelectData?: any;
}

const PostPage: React.FC<PreProps> = ({
  data,
  onChange,
  selectedRowIndex,
  treeSelectData,
}) => {
  const [state, setState] = useSetState<any>({
    updateValue: {},
    isEditModalOpen: false,
    copyValue: {},
  });
  const { updateValue, isEditModalOpen, copyValue } = state;
  const columns: any = [
    {
      title: "激活",
      dataIndex: "status",
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
      dataIndex: "report",
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
        const currentTableData = data || [];
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

  const handleRowClick = (_record: any, index: number) => {
    onChange?.(data, index);
  };
  const handleInsert = () => {
    if (treeSelectData.length === 0) {
      message.warning("请先选择右侧测试项目");
      return;
    }

    console.log("treeSelectData", treeSelectData);

    insertTreeNode(treeSelectData[0], treeSelectData[0]);
  };

  const insertTreeNode = (nodeKey: string, nodeTitle: string) => {
    // 创建新的行数据
    const newRowData = {
      id: Date.now(), // 使用时间戳作为唯一ID
      status: "success",
      command: nodeKey,
      extention: "测试数据",
      title: ` ${nodeTitle}`,
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

  const hanleCopy = () => {
    if (selectedRowIndex !== -1 && data.length > 0) {
      setState({
        copyValue: data[selectedRowIndex],
      });
      message.success("复制成功");
    } else {
      message.warning("请先选中要复制的行");
    }
  };
  const hanlePaste = () => {
    if (copyValue && Object.keys(copyValue).length != 0) {
      // 把已复制的数据粘贴到当前选中行下方
      const insertIndex =
        selectedRowIndex >= 0 ? selectedRowIndex + 1 : data.length;
      const newTableData = [...data];
      newTableData.splice(insertIndex, 0, {
        ...copyValue,
        id: new Date().getTime(),
      });
      // 更新序号
      newTableData.forEach((item, index) => {
        item.sequence = index + 1;
      });
      // message.success(`已在第${insertIndex + 1}行插入: ${copyValue.title}`);
      message.success("粘贴成功");
      onChange?.(newTableData, insertIndex);
    } else {
      message.warning("请先复制数据");
    }
  };

  const handleCut = () => {
    if (selectedRowIndex == null || selectedRowIndex < 0) {
      message.warning("请先选中要剪切的行");
      return;
    }

    const cutItem = data[selectedRowIndex];
    if (!cutItem) {
      message.warning("无效的行数据");
      return;
    }
    setState({
      copyValue: cutItem,
    });
    let newTableData = data.filter(
      (item: any, index: any) => index !== selectedRowIndex
    );
    onChange?.(newTableData, selectedRowIndex);
    message.success("剪切成功");
  };

  return (
    <div className="postPage-page">
      <ProTable<any>
        columns={columns}
        search={false}
        options={false}
        // cardBordered
        dataSource={data}
        rowKey="id"
        pagination={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={handleInsert}>
            插入
          </Button>,
          <Button key="button" icon={<CopyFilled />} onClick={hanleCopy}>
            复制
          </Button>,
          <Button key="button" icon={<CopyOutlined />} onClick={hanlePaste}>
            粘贴
          </Button>,
          <Button key="button" icon={<CiOutlined />} onClick={handleCut}>
            剪切
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

      <EditModal
        open={isEditModalOpen}
        updateValue={updateValue}
        type="post"
        onCancel={() => {
          setState({ isEditModalOpen: false });
        }}
        onOk={(values, type) => {
          setState({ isEditModalOpen: false });
          const newData = [...data];
          let list = newData.map((item) =>
            item.id === values.id ? values : item
          );
          onChange && onChange(list, selectedRowIndex);
        }}
      />
    </div>
  );
};

export default PostPage;
