import {
  Button,
  Col,
  Divider,
  Form,
  Input,
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

const rowLayout = {
  labelCol: { span: 24 },
};
interface ModalProps {
  open: boolean;
  onCancel: () => void;
  onOk?: () => void;
  updateValue: any;
  onSelect?: () => void;
  selectData?: any;
}
const editModal: React.FC<ModalProps> = ({
  open,
  onCancel,
  onOk,
  updateValue,
  onSelect,
  selectData,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
    console.log("uodate", updateValue);
    if (open) {
      form?.resetFields();
      // if (isUpdate && updateValue) {
      //   console.log("uodateCalue", updateValue);
      //   formRef.current?.setFieldsValue(updateValue);
      // }

      form?.setFieldsValue(updateValue);
    }
  }, [selectData, open, updateValue]);

  const fetchData = async () => {
    // setLoading(true);
    // try {
    //   // TODO: 替换为实际接口
    //   const res = await fakeRequest();
    //   setData(res);
    // } catch (error) {
    //   message.error("数据加载失败");
    // } finally {
    //   setLoading(false);
    // }
  };

  const fakeRequest = async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ msg: "Hello World" }), 1000);
    });
  };

  return (
    <div className="editModal-page">
      <Modal
        width={"60%"}
        title="用例库/模块名称/用例编号"
        open={open}
        onCancel={() => {
          onCancel && onCancel();
        }}
        maskClosable={false}
        onOk={() => {
          onOk && onOk();
        }}
      >
        <div>
          <div>用例标题名称</div>
          <div>
            <Form {...layout} form={form} name="control-hooks">
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    name="maintainer"
                    label="维护人"
                    // rules={[{ required: true }]}
                  >
                    <Select
                      placeholder="选择维护人"
                      showSearch
                      filterOption={(input, option) =>
                        (option?.children as unknown as string)
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      <Option value="1">张三</Option>
                      <Option value="2">李四</Option>
                      <Option value="3">王五</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="version" label="版本号">
                    <Input placeholder="输入版本号" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="testSequence" label="关联测试序列">
                    <Button
                      onClick={() => {
                        console.log("qqq");
                        onSelect && onSelect();
                      }}
                    >
                      {updateValue.selectTestData &&
                      updateValue.selectTestData.projectName ? (
                        <span>{updateValue.selectTestData.projectName}</span>
                      ) : (
                        <span>关联测试序列</span>
                      )}
                    </Button>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="importance" label="重要程度">
                    <Select placeholder="选择重要程度">
                      <Option value="1">P0</Option>
                      <Option value="2">P1</Option>
                      <Option value="2">P2</Option>
                      <Option value="3">P3</Option>
                      <Option value="3">P4</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Tabs defaultActiveKey="1" items={items} />
              <Form.Item name="createTime" label="前置条件">
                <Input.TextArea
                  rows={4}
                  placeholder="输入前置条件"
                  style={{ resize: "none" }}
                />
              </Form.Item>

              <Divider plain>用例步骤</Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="stepDescription" label="步骤描述">
                    <Input.TextArea
                      rows={4}
                      placeholder="输入步骤描述"
                      style={{ resize: "none" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="expectedResult" label="预期结果">
                    <Input.TextArea
                      rows={4}
                      placeholder="输入预期结果"
                      style={{ resize: "none" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="createTime" label="备注">
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

export default editModal;
