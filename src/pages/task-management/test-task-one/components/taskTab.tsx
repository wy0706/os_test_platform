import {
  createOne,
  getList,
  updateOne,
} from "@/services/task-management/test-task-one.service";
import {
  PlayCircleOutlined,
  PlusOutlined,
  SwapLeftOutlined,
} from "@ant-design/icons";
import { ActionType, ProTable } from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, message, Modal, Progress } from "antd";
import React, { useEffect, useRef, useState } from "react";
import TestSequenceModal from "../../components/testSequenceModal";
import { schemasColumns } from "../schemas";
import AddModal from "./addModal";
import EditModal from "./editModal";
const taskTab: React.FC = () => {
  const [state, setState] = useSetState<any>({
    title: "",
    isTestModal: false,
    isAddModalOpen: false,
    isUpdate: false,
    editValue: {},
    updateValue: {},
    isEditModal: false,
    selectTestData: {}, //选中的关联测试序列
    selectData: [
      {
        id: "8",
        title: "DEMO-8",
        description: "商品信息页面展示",
        importance: "P1",
        checked: false,
        libraryId: "library3",
        moduleId: "module3-1",
        version: "v1",
      },
    ], //选中的用例
    columns: schemasColumns.concat([
      {
        title: "操作",
        valueType: "option",
        key: "option",
        width: 180,
        render: (text: any, record: any, index: any, action: any) => [
          <Button
            color="primary"
            variant="link"
            key="preview"
            icon={<SwapLeftOutlined />}
            onClick={() => {
              Modal.confirm({
                title: (
                  <div>
                    确认移出{" "}
                    <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
                      {record?.title}
                    </span>{" "}
                    吗？
                  </div>
                ),
                onOk: () => {
                  console.log("移出", record);

                  // await deleteOne(record.id);
                  // if (actionRef.current) {
                  //   actionRef.current.reload();
                  // }
                },
              });
            }}
          >
            移出
          </Button>,
          <Button
            color="primary"
            variant="link"
            key="edit"
            icon={<PlayCircleOutlined />}
            onClick={() => {
              Modal.confirm({
                title: " 测试结果不更新页面上，是否运行?",
                okText: "是",
                cancelText: "否",
                onOk: () => {
                  // 跳转到运行界面
                  console.log("试运行", record);
                },
              });
            }}
          >
            试运行
          </Button>,
        ],
      },
    ]),
  });
  const {
    columns,
    title,
    isAddModalOpen,
    isTestModal,
    selectData,
    isUpdate,
    editValue,
    updateValue,
    isEditModal,
    selectTestData,
  } = state;
  const actionRef = useRef<ActionType>();

  //   处理行点击事件
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const handleRowClick = (record: any, index: number) => {
    console.log("点击的行数据:", record);
    console.log("行索引:", index);
    setState({ isEditModal: true });
    // 更新选中的行
    setSelectedRow(record);
  };
  const requestData: any = async (...args: any) => {
    try {
      const res = await getList({ params: args[0], sort: args[1] });
      return res;
    } catch {
      return {
        data: [
          {
            id: "8",
            title: "DEMO-8",
            description: "商品信息页面展示",
            importance: "P1",
            checked: false,
            libraryId: "library3",
            moduleId: "module3-1",
            version: "v1",
            importance2: "null",
            importance3: null,
          },
        ],
        total: 1,
        success: true,
      };
    }
  };
  useEffect(() => {}, []);

  return (
    <>
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
        headerTitle={title.label}
        toolBarRender={() => [
          <div
            style={{
              marginRight: 10,
              width: 60,
              height: 22,
              background: "red",
              borderRadius: 10,
              color: "#fff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: 500,
              opacity: ".8",
            }}
          >
            未开始
          </div>,
          <div style={{ marginRight: 10 }}>
            <span style={{ color: "#888" }}> 通过率</span> <span>17%</span>
          </div>,
          <div style={{ marginRight: 10 }}>
            <span style={{ color: "#888" }}> 已测 </span>
            <span style={{ color: "#888" }}>1</span>/<span>6</span>
          </div>,
          <div style={{ marginRight: 20, minWidth: 100 }}>
            <Progress
              size="small"
              percent={17}
              status="active"
              strokeColor="#72c240"
            />
          </div>,
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              setState({
                isUpdate: false,
                isAddModalOpen: true,
              });
            }}
            type="primary"
          >
            用例规划
          </Button>,
        ]}
        onRow={(record, index) => ({
          onClick: (e) => {
            // 检查点击的元素是否在操作栏内
            const target = e.target as HTMLElement;
            const isActionColumn =
              target.closest(".ant-table-cell:last-child") ||
              target.closest(".ant-btn") ||
              target.closest("button") ||
              target.closest("a");

            // 如果点击的是操作栏，则不跳转
            if (isActionColumn) {
              e.stopPropagation();
              return;
            }

            // 否则执行正常的行点击逻辑
            handleRowClick(record, index || 0);
          },
          style: {
            cursor: "pointer",
            backgroundColor:
              selectedRow?.id === record.id ? "#e6f7ff" : "transparent",
          },
        })}
      />
      {/* 规划用例 */}
      <AddModal
        open={isAddModalOpen}
        onCancel={() => {
          setState({ isAddModalOpen: false });
        }}
        onOk={async (values) => {
          console.log("values====", values);
          setState({ selectData: values, isAddModalOpen: false });
          try {
            if (isUpdate) {
              const res = await updateOne({
                ...values,
                id: updateValue.id,
              });
              if (res.code === "0") {
                message.success("更新成功");
                setState({ isAddModalOpen: false });
                if (actionRef.current) {
                  actionRef.current.reload();
                }
              }
            } else {
              const res = await createOne(values);
              if (res.code === "0") {
                message.success("创建成功");
                setState({ isAddModalOpen: false });
                if (actionRef.current) {
                  actionRef.current.reload();
                }
              }
            }
          } catch (error) {
            console.error("操作失败:", error);
            message.error("操作失败");
          }
        }}
        selectData={selectData}
      />
      {/* 编辑 */}
      <EditModal
        onCancel={() => {
          setState({ isEditModal: false });
        }}
        onOk={() => {
          setState({ isEditModal: false });
        }}
        onSelect={() => {
          setState({ isTestModal: true });
        }}
        open={isEditModal}
        updateValue={editValue}
        selectData={selectTestData}
      />
      <TestSequenceModal
        onCancel={() => {
          setState({ isTestModal: false });
        }}
        onOk={(values) => {
          console.log("values====", values);

          const data = values && values.length > 0 ? values[0] : {};
          setState({
            isTestModal: false,
            selectTestData: data,
            editValue: {
              ...editValue,
              selectTestData: data, //表示关联的测试序列
            },
          });
        }}
        open={isTestModal}
      />
    </>
  );
};

export default taskTab;
