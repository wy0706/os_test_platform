import {
  createOne,
  deleteOne,
  getList,
  getOne,
  updateOne,
} from "@/services/task-management/test-task-one.service";
import { history } from "@umijs/max";

import { EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  BetaSchemaForm,
  PageContainer,
  ProDescriptions,
  ProTable,
  TableDropdown,
} from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import {
  Button,
  Checkbox,
  Form,
  message,
  Modal,
  Progress,
  Tabs,
  type TabsProps,
} from "antd";
import React, { useRef, useState } from "react";

import {
  schemasColumns,
  schemasDescriptions,
  schemasForm,
  schemasTitle,
} from "./schemas";
const items: TabsProps["items"] = [
  {
    key: "1",
    label: "测试任务",
    // children: "Content of Tab Pane 1",
  },
  {
    key: "2",
    label: "测试报告",
    // children: "Content of Tab Pane 2",
  },
];
const Page: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const form: any = Form.useForm()[0];
  const [state, setState] = useSetState<any>({
    title: schemasTitle,
    isUpdate: false,
    isUpdateModalOpen: false,
    updateValue: {},
    formSchema: schemasForm,
    isPreviewModalOpen: false,
    detailsId: null,
    descriptionsColumns: schemasDescriptions,
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
            color="primary"
            variant="link"
            key="edit"
            icon={<EditOutlined />}
            onClick={() => {
              form.setFieldsValue(record);
              setState({
                updateValue: record,
                isUpdate: true,
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
                    title: "确认删除吗？",
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
    isUpdate,
    isUpdateModalOpen,
    updateValue,
    formSchema,
    isPreviewModalOpen,
    detailsId,
    descriptionsColumns,
  } = state;
  const requestData: any = async (...args: any) => {
    try {
      const res = await getList({ params: args[0], sort: args[1] });
      return res;
    } catch {
      return {
        data: [{ id: 1, title: "测试数据", createTime: "测试数据" }],
        total: 1,
        success: true,
      };
    }
  };

  const onChange = (key: string) => {
    console.log(key);
  };
  const [tabActiveKey, setTabActiveKey] = useState("1");
  return (
    <PageContainer
      header={{
        ghost: true,
        extra: [
          <Button
            key="1"
            onClick={() => {
              history.back();
            }}
          >
            返回
          </Button>,
        ],
      }}
    >
      <Tabs
        defaultActiveKey={tabActiveKey}
        items={items}
        onChange={(key) => {
          setTabActiveKey(key);
        }}
      />

      {tabActiveKey === "1" && (
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
              <div style={{ marginRight: 10, minWidth: 100 }}>
                <Progress
                  size="small"
                  percent={17}
                  status="active"
                  strokeColor="#72c240"
                />
              </div>,
              <div style={{ marginRight: 20 }}>
                <Checkbox
                  onChange={(e) => {
                    console.log(" e.target.checked;", e.target.checked);
                  }}
                >
                  显示测试过程
                </Checkbox>
              </div>,
              <Button
                key="button"
                icon={<PlusOutlined />}
                onClick={() => {
                  setState({
                    isUpdate: false,
                    isUpdateModalOpen: true,
                  });
                }}
                type="primary"
              >
                新建
              </Button>,
            ]}
          />
          <Modal
            title={isUpdate ? "编辑" : "新建"}
            open={isUpdateModalOpen}
            onCancel={() => {
              setState({ isUpdateModalOpen: false });
            }}
            footer={null}
            width={800}
          >
            <BetaSchemaForm<any>
              {...formSchema}
              defaultValue={updateValue}
              form={form}
              onFinish={async (value) => {
                if (isUpdate) {
                  value.id = updateValue.id;
                  const res: any = await updateOne({
                    ...value,
                    id: updateValue.id,
                  });
                  if (res.code === "0") {
                    message.success("操作成功");
                    setState({ isUpdateModalOpen: false });
                  } else {
                    return;
                  }
                } else {
                  const res: any = await createOne({ ...value, config: "{}" });
                  if (res.code === "0") {
                    message.success("操作成功");
                    setState({ isUpdateModalOpen: false });
                  } else {
                    return;
                  }
                }
                if (actionRef.current) {
                  actionRef.current.reload();
                }
              }}
            />
          </Modal>

          <Modal
            title="详情"
            open={isPreviewModalOpen}
            onCancel={() => {
              setState({ isPreviewModalOpen: false });
            }}
            footer={null}
            width={800}
          >
            <ProDescriptions
              columns={descriptionsColumns}
              request={async () => {
                try {
                  const res = await getOne(detailsId);
                  return res;
                } catch {
                  return {
                    data: { id: 1, title: "测试数据", createTime: "测试数据" },
                    success: true,
                  };
                }
              }}
            ></ProDescriptions>
          </Modal>
        </>
      )}
      {tabActiveKey === "2" && <div>测试报告</div>}
    </PageContainer>
  );
};

export default Page;
