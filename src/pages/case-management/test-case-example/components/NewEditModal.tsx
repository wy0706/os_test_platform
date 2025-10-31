import { getList as getUserList } from "@/services/backend-management/user-management.service";
import {
  getCaseDetail,
  updateCase,
} from "@/services/case-management/test-case-example.service";
import { useSetState } from "ahooks";

import {
  Col,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Tabs,
  type TabsProps,
} from "antd";
import React, { useEffect } from "react";
const { Option } = Select;
const layout = {
  labelCol: { span: 24 },
};
const items: TabsProps["items"] = [
  {
    key: "1",
    label: "基本信息",
  },
];

interface ModalProps {
  open: boolean;
  onCancel: () => void;
  onOk?: (values: any) => void;
  onSelect?: () => void;
  selectData?: any;
  id: string | number;
}

const NewEditModal: React.FC<ModalProps> = ({
  open,
  onCancel,
  onOk,
  onSelect,
  selectData,
  id,
}) => {
  const [form] = Form.useForm();

  const [state, setState] = useSetState<any>({
    userList: [], // 用户列表
    submitLoading: false,
  });
  const { userList, submitLoading } = state;

  useEffect(() => {
    fetchData();
  }, [open, id]);
  const fetchData = async () => {
    console.log("id", id);

    if (open && id) {
      form?.resetFields();
      await fetchAllUsers();
      const { code, data, message: msg } = await getCaseDetail(id);
      if (code === 0) {
        form?.setFieldsValue({
          ...data,
          user_id: data?.owner?.id || null,
        });
      } else {
        message.error(msg || "获取用例详情失败");
        return;
      }
    }
  };
  const fetchAllUsers = async () => {
    try {
      const params = {
        page_index: 1,
        page_size: 9999,
      };
      const { code, data, message: msg } = await getUserList(params);
      if (code === 0) {
        setState({ userList: data?.list || [] });
      } else {
        setState({ userList: [] });
        message.error(msg);
      }
    } catch (error) {
      console.error("获取用户列表失败:", error);
    }
  };
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log("values", values);
      setState({ submitLoading: true });
      const { code, messsage: msg } = await updateCase({
        ...values,
        tc_id: id,
      });
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");
      onOk?.(values);
    } catch (error) {
    } finally {
      setState({ submitLoading: false });
    }
  };
  return (
    <div className="editModal-page">
      <Modal
        width={"60%"}
        title="用例库/模块名称/用例编号"
        open={open}
        destroyOnHidden
        onCancel={() => {
          form?.resetFields();
          onCancel && onCancel();
        }}
        confirmLoading={submitLoading}
        maskClosable={false}
        onOk={handleOk}
      >
        <div>
          <div>
            <Form {...layout} form={form}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="title"
                    label="标题"
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="输入标题" maxLength={32} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="user_id"
                    label="维护人"
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder="选择维护人"
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        (option?.children as unknown as string)
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {userList.map((user: any) => (
                        <Option key={user.id} value={user.id}>
                          {user.name || user.username || "-"}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="version" label="版本号">
                    <Input placeholder="输入版本号" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="importance" label="重要程度">
                    <Select placeholder="选择重要程度">
                      <Option value="P0">P0</Option>
                      <Option value="P1">P1</Option>
                      <Option value="P2">P2</Option>
                      <Option value="P3">P3</Option>
                      <Option value="P4">P4</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="tc_seq_name" label="关联测试序列">
                    <Input placeholder="关联测试序列" disabled />
                    {/* 测试序列1 */}
                  </Form.Item>
                </Col>
              </Row>

              <Tabs defaultActiveKey="1" items={items} />
              <Form.Item name="precondition" label="前置条件">
                <Input.TextArea
                  rows={4}
                  placeholder="输入前置条件"
                  style={{ resize: "none" }}
                />
              </Form.Item>

              <Divider plain>用例步骤</Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="step_desc" label="步骤描述">
                    <Input.TextArea
                      rows={4}
                      placeholder="输入步骤描述"
                      style={{ resize: "none" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="except_result" label="预期结果">
                    <Input.TextArea
                      rows={4}
                      placeholder="输入预期结果"
                      style={{ resize: "none" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="comment" label="备注">
                <Input.TextArea
                  style={{ resize: "none" }}
                  rows={4}
                  placeholder="输入备注"
                />
              </Form.Item>
            </Form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NewEditModal;
