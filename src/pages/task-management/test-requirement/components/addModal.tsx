import { ProTable } from "@ant-design/pro-components";
import { Button, Form, Input, Modal, Select } from "antd";
import React from "react";
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};
interface SetMemberModalProps {
  open: boolean;
  isUpdate: boolean;
  selectData?: any; // 关联的任务
  updateValue: any;
  onSuccess?: (values: any) => void;
  onCancel: () => void;
  // formSchema: any;
  onOk?: (values: any) => void;
  onInnerCancel?: () => void;
  onSelect?: () => void;
}

const AddModal: React.FC<SetMemberModalProps> = ({
  open,
  isUpdate,
  updateValue,
  onSuccess,
  onCancel,
  // formSchema,
  onOk,
  onInnerCancel,
  onSelect,
  selectData,
}) => {
  const [form] = Form.useForm();
  const columns: any = [
    // {
    //   title: "序号",
    //   dataIndex: "index",
    // },
    {
      title: "任务名称",
      dataIndex: "title",
    },
    {
      title: "状态",
      dataIndex: "status",
      // ellipsis: true,
      // sorter: true,
      // // initialValue: "all",
      // filters: true,
      // onFilter: true,
      valueEnum: {
        1: { text: "已完成", status: "Success" },
        2: { text: "未完成", status: "Default" },
      },
      // sorter: true,
    },

    {
      title: "日期和时间",
      dataIndex: "createTime",
      ellipsis: true,
      sorter: true,
      valueType: "dateTime",
    },
  ];
  React.useEffect(() => {
    if (open) {
      console.log("selectData", selectData);

      form?.resetFields();
      if (isUpdate && updateValue) {
        console.log("uodateCalue", updateValue);
        form?.setFieldsValue(updateValue);
      }
    }
  }, [open, isUpdate, updateValue]);

  const handleOk = async () => {
    const values = await form?.validateFields();
    const params = isUpdate ? { ...updateValue, ...values } : values;
    if (onOk) {
      onOk(params);
      return;
    }

    // try {
    //   const values = await form?.validateFields();
    //   if (onOk) {
    //     onOk(values); // 新增
    //     return;
    //   }
    //   if (isUpdate) {
    //     values.id = updateValue.id;
    //     const res: any = await updateOne({ ...values, id: updateValue.id });
    //     if (res.code === "0") {
    //       message.success("操作成功");
    //       form?.resetFields();
    //       if (!continueAdd) {
    //         onSuccess();
    //       }
    //     }
    //   } else {
    //     const res: any = await createOne({ ...values, config: "{}" });
    //     if (res.code === "0") {
    //       message.success("操作成功");
    //       form?.resetFields();
    //       if (!continueAdd) {
    //         onSuccess();
    //       }
    //     }
    //   }
    // } catch (err) {
    //   console.log("表单校验失败:", err);
    // }
  };

  const handleCancel = () => {
    if (onInnerCancel) {
      onInnerCancel(); // 新增
      return;
    }
    onCancel();
    form?.resetFields();
  };

  function onFinish(values: any): void {
    throw new Error("Function not implemented.");
  }

  return (
    <Modal
      title={isUpdate ? "编辑产品需求" : "新建产品需求"}
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      width={"40%"}
      styles={{ body: { minHeight: 300, padding: 20 } }}
    >
      <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
        <Form.Item name="title" label="标题" rules={[{ required: true }]}>
          <Input placeholder="请输入标题" />
        </Form.Item>
        <Form.Item name="createTime" label="描述">
          <Input.TextArea rows={4} placeholder="请输入描述" />
        </Form.Item>

        <Form.Item name="lists" label="关联测试任务">
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              flexDirection: "column",
            }}
          >
            <Button
              style={{ marginBottom: 10 }}
              onClick={() => {
                onSelect && onSelect();
              }}
            >
              选择测试任务
            </Button>

            {selectData && selectData.length > 0 ? (
              <ProTable<any>
                search={false}
                columns={columns}
                // actionRef={actionRef}
                cardBordered
                options={false}
                dataSource={selectData}
                rowKey="id"
                pagination={{
                  pageSize: 20,
                }}
                headerTitle="已选择测试文件列表"
              />
            ) : (
              <span></span>
            )}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddModal;
