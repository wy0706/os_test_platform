import {
  deleteOne,
  getList,
} from "@/services/case-management/test-sequence-process.service";
import {
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  FileAddOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  ActionType,
  PageContainer,
  TableDropdown,
} from "@ant-design/pro-components";
import { history, useParams, useSearchParams } from "@umijs/max";
import { useSetState } from "ahooks";
import { Button, Card, Form, Modal, Space } from "antd";
import React, { useEffect, useRef } from "react";
import { schemasColumns, schemasDescriptions, schemasForm } from "./schemas";

const Page: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const form: any = Form.useForm()[0];
  const [state, setState] = useSetState<any>({
    title: "",
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
  const [searchParams] = useSearchParams();
  const params = useParams();
  useEffect(() => {
    setState({
      title: params.id === "add" ? "" : searchParams.get("name") || "",
    });
  }, []);
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
  const handleGoBack = () => {
    history.back();
  };
  const handleImport = () => {
    // message.info("导入功能");
  };
  const handleAdd = () => {};
  const handleSelfCheck = () => {};
  const handleExport = () => {
    // message.info("导出功能");
  };
  return (
    <PageContainer
      header={{
        title: (
          <div>
            用例执行 &nbsp;{" "}
            {title && <span style={{ color: "#6c757d" }}>【 {title} 】</span>}
          </div>
        ),
        ghost: true,
        extra: [
          <Button key="1" onClick={handleGoBack}>
            返回
          </Button>,
        ],
      }}
    >
      <div className="peripheral-import-page">
        {/* 操作栏 */}
        <Card className="operation-bar">
          <Space className="operation-buttons">
            <Button icon={<PlusOutlined />} onClick={handleAdd}>
              新建
            </Button>
            {/* <Button icon={<FolderOpenOutlined />} onClick={handleImport}>
              打开
            </Button> */}
            <Button icon={<SaveOutlined />} onClick={handleExport}>
              保存
            </Button>
            <Button icon={<FileAddOutlined />} onClick={handleExport}>
              另存为
            </Button>
            {/* 复制   粘贴    剪切  */}
            <Button icon={<CheckCircleOutlined />} onClick={handleSelfCheck}>
              运行
            </Button>
          </Space>
        </Card>

        {/* 主要内容区域 */}
        <div className="main-content">主要内容</div>
      </div>
      {/* <ProTable<any>
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
      /> */}
    </PageContainer>
  );
};

export default Page;
