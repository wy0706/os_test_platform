import {
  deleteOne,
  getList,
} from "@/services/case-management/test-case.service";
import { EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { history } from "@umijs/max";

import {
  ActionType,
  PageContainer,
  ProTable,
  TableDropdown,
} from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Form, Modal } from "antd";
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
  const actionRef = useRef<ActionType>();
  const form: any = Form.useForm()[0];
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
    columns: schemasColumns.concat([
      {
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
              form.setFieldsValue(record);
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
            key={`dropdown-${index}`}
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
                            <span
                              style={{ color: "#ff4d4f", fontWeight: "bold" }}
                            >
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
                      // content: (
                      //   <div style={{ color: "#ff4d4f", fontWeight: "bold" }}>
                      //     {record.title}
                      //   </div>
                      // ),
                      onOk: async () => {
                        await deleteOne(record.id);
                        if (actionRef.current) {
                          actionRef.current.reload();
                        }
                      },
                    });
                    return;
                  case "copy":
                    form.setFieldsValue(record);
                    setState({
                      updateValue: record,
                      isUpdateModalOpen: true,
                      optionType: "copy",
                    });
                    return;
                  case "example":
                    history.push(
                      `/case-management/test-case-example/${record.id}`
                    );
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
      },
    ]),
  });
  const {
    columns,
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
  const requestData: any = async (...args: any) => {
    try {
      const res = await getList({ params: args[0], sort: args[1] });
      return res;
    } catch {
      return {
        data: [
          {
            id: 1,
            title: "测试数据",
            title1: "DEMO",
            createTime: "2025-07-30",
          },
        ],
        total: 1,
        success: true,
      };
    }
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
        columns={columns}
        actionRef={actionRef}
        dateFormatter="string"
        cardBordered
        request={requestData}
        rowKey="id"
        pagination={{
          pageSize: 10,
          onChange: (page) => requestData,
        }}
        headerTitle={title.label}
        toolBarRender={() => [
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
        ]}
        onRow={(record, index) => ({
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
        })}
      />

      <AddModal
        open={isUpdateModalOpen}
        onCancel={() => {
          setState({
            isUpdateModalOpen: false,
          });
        }}
        type={optionType}
        onOk={(values: any) => {
          console.log("values---", values);
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
