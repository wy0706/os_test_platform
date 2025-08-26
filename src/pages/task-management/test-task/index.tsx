import RunModal from "@/pages/case-management/components/runModal";
import {
  deleteOne,
  getList,
} from "@/services/task-management/test-task.service";
import {
  EditOutlined,
  PlayCircleOutlined,
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
import AddModal from "./components/addModal";
import CreateReportModal from "./components/createReport";
import DetailModal from "./components/detailModal";
import SequenceDataModal from "./components/sequenceDataModal";
import { schemasColumns, schemasTitle } from "./schemas";
const Page: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const form: any = Form.useForm()[0];
  const [state, setState] = useSetState<any>({
    title: schemasTitle,
    optionType: "add",
    isUpdateModalOpen: false,
    updateValue: {},
    isPreviewModalOpen: false,
    currentSelectId: null, //当前table操作的id
    detailsData: {},
    isShowProcess: false, //是否显示测试过程
    isRunModalOpen: false,
    runData: {},
    isCreateReportModalOpen: false, //是否显示生成测试报告
  });
  const {
    title,
    isUpdateModalOpen,
    updateValue,
    isPreviewModalOpen,
    currentSelectId,
    optionType,
    detailsData,
    isShowProcess,
    isRunModalOpen,
    runData,
    isCreateReportModalOpen,
  } = state;

  // 动态生成 columns，这样可以访问到最新的状态
  const columns: any = schemasColumns.concat([
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
          icon={<PlayCircleOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            setState({
              isRunModalOpen: isShowProcess,
              runData: isShowProcess ? record : {},
            });
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
            setState({
              updateValue: record,
              isUpdateModalOpen: true,
              optionType: "edit",
            });
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
                  console.log("record", record);

                  Modal.confirm({
                    title: (
                      <div>
                        <div>
                          确认删除测试任务{" "}
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
                          测试任务删除后不可恢复，删除测试任务会一起删除测试任务内的执行用例
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
                  setState({
                    updateValue: record,
                    isUpdateModalOpen: true,
                    optionType: "copy",
                  });
                  return;
                case "preview":
                  setState({
                    currentSelectId: record.id,
                    isPreviewModalOpen: true,
                    detailsData: record,
                  });
                  return;
                case "report":
                  setState({
                    isCreateReportModalOpen: true,
                    currentSelectId: record.id,
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
              { key: "report", name: "生成测试报告" },
            ]}
          />
        </div>,
      ],
    },
  ]);
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
            title2: 100,
            title3: "张三",
            title4: "测试数据",
            createTime: "2025-07-31",
            status: "all",
          },
          {
            id: 2,
            title: "测试数据2",
            title2: 70,
            title3: "李四",
            title4: "测试数据",
            createTime: "2025-07-30",
            status: "all",
          },
        ],
        total: 2,
        success: true,
      };
    }
  };

  const [testDataListOpen, setTestDataListOpen] = useState(false);

  const [testDataObj, setTestData] = useState({});

  const handleDetailCancel = () => {
    setState({ isPreviewModalOpen: false });
  };
  //   处理行点击事件
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const handleRowClick = (record: any, index: number) => {
    console.log("点击的行数据:", record);
    console.log("行索引:", index);
    history.push(`/task-management/test-task-one/${record.id}?tab=1`);
    // 更新选中的行
    setSelectedRow(record);
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
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ marginRight: 20 }}>
              <Checkbox
                onChange={(e) => {
                  console.log(e.target.checked);
                  setState({ isShowProcess: e.target.checked });
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
              }}
              type="primary"
            >
              新建
            </Button>
          </div>,
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
        details={detailsData}
        open={isPreviewModalOpen}
        onCancel={handleDetailCancel}
      />

      <AddModal
        type={optionType}
        onCancel={() => {
          setState({ isUpdateModalOpen: false });
          setTestData({});
        }}
        open={isUpdateModalOpen}
        onSelect={() => {
          setTestDataListOpen(true);
        }}
        testData={testDataObj}
        updateValue={updateValue}
        onOk={(values: any) => {
          const obj = { ...values, testDataObj };
          console.log("表单数据", obj);
        }}
      />
      {/* 选择列表 */}
      <SequenceDataModal
        selectedRow={testDataObj}
        open={testDataListOpen}
        onCancel={() => {
          console.log("取消");
          setTestDataListOpen(false);
        }}
        onOk={(values) => {
          console.log("values", values);
          setTestData(values);
          setTestDataListOpen(false);
        }}
      />
      {/* 运行弹框 */}
      <RunModal
        open={isRunModalOpen}
        onCancel={() => {
          setState({ isRunModalOpen: false });
        }}
        onOk={() => {
          setState({ isRunModalOpen: false });
          history.push(
            `/case-management/case-run/${runData.id}?status=part&name=${runData.title}`
          );
        }}
      />
      {/* 生成测试报告 */}
      <CreateReportModal
        open={isCreateReportModalOpen}
        onCancel={() => {
          setState({ isCreateReportModalOpen: false });
        }}
        onOk={(values) => {
          console.log(values);
          history.push(
            `/task-management/test-task-one/${currentSelectId}?tab=2`
          );
        }}
      />
    </PageContainer>
  );
};

export default Page;
