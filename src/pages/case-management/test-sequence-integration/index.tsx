import {
  deleteOne,
  getList,
} from "@/services/case-management/test-sequence-integration.service";
import { history } from "@umijs/max";

import { EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  PageContainer,
  ProTable,
  TableDropdown,
} from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, Form, Modal } from "antd";
import React, { useRef, useState } from "react";
import RunModal from "../components/runModal";
import DetailModal from "./components/detailModal";
import EditModal from "./components/editModal";
import { schemasColumns, schemasTitle } from "./schemas";
const Page: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const form: any = Form.useForm()[0];
  const [state, setState] = useSetState<any>({
    title: schemasTitle,
    isUpdateModalOpen: false,
    updateValue: {},
    isPreviewModalOpen: false,
    detailsId: null,
    details: {},
    isRunModalOpen: false,
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
            onClick={() => {
              setState({
                detailsId: record.id,
                isPreviewModalOpen: true,
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
            onClick={() => {
              form.setFieldsValue(record);
              setState({
                updateValue: record,
                isUpdateModalOpen: true,
              });
            }}
          >
            编辑
          </Button>,
          <TableDropdown
            key={index}
            onSelect={(key: string) => {
              console.log("key----", key);
              console.log(key);
              switch (key) {
                case "delete":
                  Modal.confirm({
                    title: (
                      <div>
                        <div>
                          确认删除序列集成{" "}
                          <span
                            style={{ color: "#ff4d4f", fontWeight: "bold" }}
                          >
                            {record.title}
                          </span>{" "}
                          吗？
                        </div>
                        {/* <div
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            marginTop: "8px",
                          }}
                        ></div> */}
                      </div>
                    ),
                    onOk: async () => {
                      await deleteOne(record.id);
                      if (actionRef.current) {
                        actionRef.current.reload();
                      }
                    },
                  });
                  return;

                default:
                  return;
              }
            }}
            menus={[{ key: "delete", name: "删除" }]}
          />,
        ],
      },
    ]),
  });
  const {
    columns,
    title,
    isUpdateModalOpen,
    updateValue,
    isPreviewModalOpen,
    detailsId,
    details,
    isRunModalOpen,
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
            title: "测试数据1",
            createTime: "2025-08-15",
            status: "success",
            isExistAll: true,
          },
          {
            id: 2,
            title: "测试数据2",
            createTime: "2025-08-25",
            status: "success",
            isExistAll: false,
          },
          {
            id: 3,
            title: "测试数据2",
            createTime: "2025-08-25",
            status: "error",
            isExistAll: true,
          },
        ],
        total: 3,
        success: true,
      };
    }
  };
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const handleRowClick = (record: any, index: number) => {
    console.log("点击的行数据:", record);
    // 如果打开项目中测试项目全部存在 跳转编辑页，如果有项目不存在，弹出提示界面

    setSelectedRow(record);
    if (record.isExistAll) {
      history.push(
        `/case-management/test-sequence-process/${record.id}?name=${record.title}&status=${record.status}`
      );
    } else {
      let list = [
        "KD6630_DSM_DPP_2",
        "KD6630_DSM_DPP_PARITY_3",
        "KD6630_EQM_DPP_21KD6630",
        "ESCH_DPP_6",
        "KD6630_IQM_DPP_8",
        "KD6630_ISCH_DPP_10",
        "KD6630_ISCH_DPP_PARITY_11",
        "KD6630_LIN_DPP_26",
        "KD6630_LIN_DPP_PARITY_27",
        "KD6630_LIN_ONE_HOT_28",
        "KD6630_PES_DPP_22",
        "KD6630_PFS_CL_DPP_13",
        "KD6630_PFS_L3_DPP_16",
        "KD6630_PFS_PS_POL_DPP_18",
        "KD6630_PFS_PS_POL_DPP_PARITY_19",
      ];
      Modal.error({
        title: "错误",
        content: (
          <div
            style={{ maxHeight: 300, overflowY: "auto", paddingBottom: "10px" }}
          >
            <h3>以下测试项目不存在</h3>
            {list.length > 0 &&
              list.map((item, index) => (
                <div
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",
                    padding: "5px 10px",
                  }}
                  key={index}
                >
                  {item}
                </div>
              ))}
          </div>
        ),
        okText: "确定",
        onOk() {
          console.log("确认操作");
        },
      });
    }

    // message.success(`已选择: ${record.title}`);
  };
  return (
    <PageContainer>
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
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              setState({ isRunModalOpen: true });
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
      <DetailModal
        open={isPreviewModalOpen}
        onCancel={() => {
          setState({ isPreviewModalOpen: false });
        }}
        details={details}
      />
      <RunModal
        open={isRunModalOpen}
        onCancel={() => {
          setState({ isRunModalOpen: false });
        }}
        onOk={(values) => {
          console.log("values", values);
          history.push(`/case-management/test-sequence-process/add`);
        }}
      />
      <EditModal
        open={isUpdateModalOpen}
        updateValue={updateValue}
        onCancel={() => {
          setState({ isUpdateModalOpen: false });
        }}
        onOk={(value) => {
          console.log("value", value);
          setState({ isUpdateModalOpen: false });
        }}
      />
    </PageContainer>
  );
};

export default Page;
