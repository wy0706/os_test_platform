import {
  deleteOne,
  getList,
} from "@/services/case-management/test-case.service";
import { transformParams } from "@/utils/params";
import { EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  PageContainer,
  ProTable,
  TableDropdown,
} from "@ant-design/pro-components";
import { history, useAccess } from "@umijs/max";
import { useSetState } from "ahooks";
import { Button, message, Modal } from "antd";
import React, { useRef, useState } from "react";
import AddModal from "./components/addModal";
import DetailModal from "./components/detailModal";
import {
  schemasColumns,
  schemasDescriptions,
  schemasForm,
  schemasTitle,
} from "./schemas";
const Page: React.FC = () => {
  const access = useAccess();
  const actionRef = useRef<ActionType>();

  const [state, setState] = useSetState<any>({
    title: schemasTitle,
    isUpdateModalOpen: false,
    updateValue: {},
    optionType: "add", //默认是新增，add ｜ edit｜ copy
    detailsData: {}, //详情
    formSchema: schemasForm,
    isPreviewModalOpen: false,
    detailsId: null,
    descriptionsColumns: schemasDescriptions,
  });
  const {
    title,
    isUpdateModalOpen,
    updateValue,
    formSchema,
    isPreviewModalOpen,
    detailsId,
    descriptionsColumns,
    optionType,
    detailsData,
  } = state;

  const operationColumn = {
    title: "操作",
    valueType: "option",
    key: "option",
    width: 200,
    render: (text: any, record: any, index: any, action: any) => [
      <Button
        key="preview"
        variant="link"
        color="primary"
        icon={<EyeOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          setState({
            detailsId: record.id,
            isPreviewModalOpen: true,
            detailsData: record,
          });
        }}
      >
        详情
      </Button>,
      <Button
        key="edit"
        variant="link"
        color="primary"
        icon={<EditOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          setState({
            updateValue: record,
            isUpdateModalOpen: true,
            optionType: "edit",
          });
        }}
      >
        编辑
      </Button>,
      <div
        key="more"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <TableDropdown
          onSelect={(key: string) => {
            console.log("key----", key);
            console.log(key);
            switch (key) {
              case "delete":
                Modal.confirm({
                  title: (
                    <div>
                      <div>
                        确认删除测试库{" "}
                        <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
                          {record.title}
                        </span>{" "}
                        吗？
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginTop: "8px",
                        }}
                      >
                        测试库删除后不可恢复，删除测试库会一起删除测试库内的执行用例
                      </div>
                    </div>
                  ),
                  onOk: async () => {
                    const { code, message: msg } = await deleteOne(record.id);
                    if (code === 0) {
                      actionRef.current?.reload();
                      message.success(msg);
                    } else {
                      message.error(msg);
                    }
                  },
                });
                return;
              case "copy":
                setState({
                  updateValue: record,
                  isUpdateModalOpen: true,
                  optionType: "copy",
                });
                return;
              case "example":
                history.push(`/case-management/test-case-example/${record.id}`);
                return;
              default:
                return;
            }
          }}
          menus={[
            { key: "copy", name: "复制" },
            // { key: "example", name: "示例测试库" },
            { key: "delete", name: "删除" },
          ]}
        />
      </div>,
    ],
  };

  const requestData: any = async (...args: any) => {
    let params = transformParams({ params: args[0], sort: args[1] });
    const { code, data, message: msg } = await getList({ ...params });
    if (code !== 0) {
      message.error(msg);
      return { data: [], total: 0, success: false };
    }
    return {
      data: data?.list || [],
      total: data?.total_cnt,
      success: true,
    };
  };

  //   处理行点击事件
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const handleRowClick = (record: any, index: number) => {
    console.log("点击的行数据:", record);
    history.push(`/case-management/test-case-example/${record.id}`);
    // 更新选中的行
    setSelectedRow(record);
    // message.success(`已选择: ${record.title}`);
  };
  return (
    <PageContainer title="全部用例库">
      <ProTable<any>
        columns={
          access["testDesign-edit"]
            ? [...schemasColumns, operationColumn]
            : schemasColumns
        }
        actionRef={actionRef}
        dateFormatter="string"
        cardBordered
        request={requestData}
        rowKey="id"
        pagination={{
          pageSize: 10,
        }}
        headerTitle={title.label}
        toolBarRender={() =>
          access["testDesign-edit"]
            ? [
                <Button
                  key="button"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setState({
                      isUpdateModalOpen: true,
                      optionType: "add",
                    });
                  }}
                  type="primary"
                >
                  新建
                </Button>,
              ]
            : []
        }
        onRow={(record, index) =>
          access["testDesign-edit"]
            ? {
                onClick: (e) => {
                  // 检查点击的元素是否在操作栏内
                  const target = e.target as HTMLElement;
                  const isActionColumn =
                    target.closest(".ant-table-cell:last-child") ||
                    target.closest(".ant-btn") ||
                    target.closest("button") ||
                    target.closest("a") ||
                    target.closest(".ant-dropdown") ||
                    target.closest(".ant-dropdown-menu") ||
                    target.closest(".ant-dropdown-menu-item") ||
                    target.closest(".ant-dropdown-trigger");

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
              }
            : {}
        }
      />

      <AddModal
        open={isUpdateModalOpen}
        onCancel={() => {
          setState({
            isUpdateModalOpen: false,
          });
        }}
        updateValue={updateValue}
        type={optionType}
        onOk={(values: any) => {
          setState({
            isUpdateModalOpen: false,
          });
          actionRef.current?.reload();
        }}
      />
      <DetailModal
        details={detailsData}
        open={isPreviewModalOpen}
        onCancel={() => {
          setState({ isPreviewModalOpen: false });
        }}
      />
    </PageContainer>
  );
};

export default Page;
