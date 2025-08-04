import {
  deleteOne,
  getList,
} from "@/services/task-management/test-task.service";
import {
  EditOutlined,
  LeftCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  ActionType,
  PageContainer,
  ProTable,
  TableDropdown,
} from "@ant-design/pro-components";
import { history } from "@umijs/max";
import { useSetState } from "ahooks";
import { Button, Checkbox, Form, Modal } from "antd";
import React, { useRef, useState } from "react";
import DetailModal from "./components/detailModal";
import SequenceDataModal from "./components/sequenceDataModal";
import TestSequenceData from "./components/testSequenceData";
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
    optionType: "add",
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
        width: 200,
        render: (text: any, record: any, index: any, action: any) => [
          <Button
            key="preview"
            variant="link"
            color="primary"
            icon={<LeftCircleOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              // message.("查看详情");
            }}
          >
            运行
          </Button>,
          <Button
            key="edit"
            variant="link"
            color="primary"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              // form.setFieldsValue(record);
              console.log("edit");
              setState({
                updateValue: record,
                isUpdateModalOpen: true,
                optionType: "edit",
              });
              setTestDataModalOpen(true);
            }}
          >
            编辑
          </Button>,
          <div onClick={(e) => e.stopPropagation()}>
            <TableDropdown
              key={index}
              onSelect={(key: string) => {
                switch (key) {
                  case "delete":
                    Modal.confirm({
                      title: `确认删除 ${record.title} 吗?`,
                      // title: "确认删除吗?",
                      onOk: async () => {
                        await deleteOne(record.id);
                        if (actionRef.current) {
                          actionRef.current.reload();
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
                    setTestDataModalOpen(true);
                    return;
                  case "preview":
                    setState({
                      detailsId: record.id,
                      isPreviewModalOpen: true,
                    });
                    return;
                  default:
                    return;
                }
              }}
              menus={[
                { key: "copy", name: "复制" },
                { key: "preview", name: "详情" },
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
  } = state;
  const requestData: any = async (...args: any) => {
    try {
      const res = await getList({ params: args[0], sort: args[1] });
      return res;
    } catch {
      return {
        data: [
          { id: 1, title: "测试数据", createTime: "测试数据", status: "all" },
          { id: 2, title: "测试数据2", createTime: "测试数据2", status: "all" },
        ],
        total: 1,
        success: true,
      };
    }
  };
  const [testDataModalOpen, setTestDataModalOpen] = useState(false);

  const [testDataList, setTestDataList] = useState(false);

  const [testDataObj, steTestData] = useState({});
  const handleOpenTestSequenceModal = () => {
    console.log("text");
  };
  const handleDetailCancel = () => {
    setState({ isPreviewModalOpen: false });
  };
  const handleSelect = (values: any) => {
    setTestDataList(false);
    console.log("calue", values);
    steTestData({ ...values });
  };
  const selectData = () => {
    setTestDataList(true);
  };
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const handleRowClick = (record: any, index: number) => {
    console.log("点击的行数据:", record);
    console.log("行索引:", index);
    history.push(`/task-management/test-task-one/${record.id}`);
    // 更新选中的行
    setSelectedRow(record);
    // message.success(`已选择: ${record.title}`);

    // 在这里可以执行其他操作，比如：
    // - 打开详情弹窗
    // - 跳转到详情页面
    // - 更新表单数据
    // - 触发其他业务逻辑
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
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ marginRight: 20 }}>
              <Checkbox
                onChange={(e) => {
                  console.log(" e.target.checked;", e.target.checked);
                }}
              >
                显示测试过程
              </Checkbox>
            </div>
            <Button
              key="button"
              icon={<PlusOutlined />}
              onClick={() => {
                setState({
                  isUpdateModalOpen: true,
                  optionType: "add",
                });
                setTestDataModalOpen(true);
              }}
              type="primary"
            >
              新建
            </Button>
          </div>,
        ]}
        onRow={(record, index) => ({
          onClick: () => handleRowClick(record, index || 0),
          style: {
            cursor: "pointer",
            backgroundColor:
              selectedRow?.id === record.id ? "#e6f7ff" : "transparent",
          },
        })}
      />
      <DetailModal open={isPreviewModalOpen} onCancel={handleDetailCancel} />
      {/* <AddModal
        type={optionType}
        formSchema={formSchema}
        updateValue={updateValue}
        open={isUpdateModalOpen}
        onSuccess={(values) => {
          console.log("values", values);
        }}
        onCancel={() => {
          setState({ isUpdateModalOpen: false });
        }}
      /> */}

      <TestSequenceData
        type={optionType}
        onCancel={() => {
          setTestDataModalOpen(false);
          steTestData({});
        }}
        open={testDataModalOpen}
        onSelect={selectData}
        testData={testDataObj}
        updateValue={updateValue}
        onSuccess={(values) => {
          const obj = { ...values, testDataObj };
          console.log("表单数据", obj);
        }}
      />
      {/* 选择列表 */}
      <SequenceDataModal
        open={testDataList}
        onCancel={() => {
          console.log("取消");
          setTestDataList(false);
        }}
        onSuccess={handleSelect}
      />
    </PageContainer>
  );
};

export default Page;
