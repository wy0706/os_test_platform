import { getAll as getUserList } from "@/services/system-management/user-management.service";
import { Button, Col, Divider, Form, Input, Modal, Row, Select } from "antd";
import { useEffect, useState } from "react";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  onSelect?: () => void;
  testData?: any;
  type?: string;
  updateValue?: any;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const AddModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  onSelect,
  testData,
  type,
  updateValue,
}) => {
  const [title, setTitle] = useState("新建");
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取所有用户列表
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        pageSize: 1000, // 获取足够多的用户数据
      };
      const result = await getUserList(params);
      if (result?.data) {
        setUserList(result.data);
      }
    } catch (error) {
      console.error("获取用户列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const name = type === "edit" ? "编辑" : type === "copy" ? "复制" : "新建";
    setTitle(name);
    if (open) {
      form?.resetFields();
      // 打开弹窗时获取所有用户列表
      fetchAllUsers();
      // if (isUpdate && updateValue) {
      //   console.log("uodateCalue", updateValue);
      //   formRef.current?.setFieldsValue(updateValue);
      // }
      if ((type === "edit" || type === "copy") && updateValue) {
        console.log("uodateCalue====", updateValue);
        form?.setFieldsValue(updateValue);
      }
    }
  }, [open, type, updateValue]);

  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log(values);
  };

  const handleOk = () => {
    console.log("111");
    form
      .validateFields()
      .then((values) => {
        console.log("Form values:", values);
        if (onOk) {
          onOk(values);
        }
      })
      .catch((errorInfo) => {
        console.error("Validation failed:", errorInfo);
      });
  };

  return (
    <Modal
      title="创建用例"
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      width={"60%"}
      onOk={handleOk}
    >
      <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
        <Form.Item name="gender2" label="标题" rules={[{ required: true }]}>
          <Input placeholder="输入标题" maxLength={32} />
        </Form.Item>
        <Form.Item name="note" label="前置条件">
          <Input.TextArea
            rows={4}
            placeholder="输入前置条件"
            maxLength={2048}
          />
        </Form.Item>

        <Divider plain>用例步骤</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="stepDescription" label="步骤描述">
              <Input.TextArea
                rows={4}
                placeholder="请输入步骤描述"
                // style={{ resize: "none" }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="expectedResult" label="预期结果">
              <Input.TextArea
                rows={4}
                placeholder="请输入预期结果"
                // style={{ resize: "none" }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="gender1" label="描述">
          <Input.TextArea
            rows={4}
            placeholder="输入任务描述"
            maxLength={2048}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="gender9"
              label="所属测试库"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="选择所属测试库"
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              ></Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="gender" label="模块">
              <Select placeholder="选择模块">
                <Option value="1">模块1</Option>
                <Option value="2">模块2</Option>
                <Option value="2">模块3</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            {" "}
            <Form.Item name="gender5" label="重要程度">
              <Select placeholder="选择重要程度">
                <Option value="1">P0</Option>
                <Option value="2">P1</Option>
                <Option value="2">P2</Option>
                <Option value="3">P3</Option>
                <Option value="3">P4</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            {" "}
            <Form.Item name="gender2" label="维护人">
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

          <Col span={8}>
            {" "}
            <Form.Item name="gender22" label="关联测试序列">
              <Button
                onClick={() => {
                  onSelect && onSelect();
                }}
              >
                {updateValue?.projectName || "选择测试序列"}

                <span></span>
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddModal;
