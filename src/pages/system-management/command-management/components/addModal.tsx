import { uploadFile as uploadFileService } from "@/services/system-management/equip-management.service";
import { getAll as getUserList } from "@/services/system-management/user-management.service";
import { useSetState } from "ahooks";
import { Col, Form, Input, Modal, Row, Select } from "antd";
import { useEffect, useState } from "react";
interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  type: string;
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
  type,
  updateValue,
}) => {
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [state, setState] = useSetState<any>({
    title: "新建",
  });
  const { title } = state;
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
    const name = type === "add" ? "新建" : "编辑";
    setState({ title: name });
    if (open) {
      form?.resetFields();
      fetchAllUsers();
      if (type === "edit") {
        form?.setFieldsValue(updateValue);
      }
    } else {
      form?.resetFields();
    }
  }, [open, type, updateValue]);

  const [form] = Form.useForm();
  const uploadFile = async (file: any) => {
    console.log("file", file);
    try {
      const res = await uploadFileService({ file: file.file });
    } catch {}

    // 上传文件的逻辑
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
      title={`${title}命令`}
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      {" "}
      <Form {...layout} form={form} name="control-hooks">
        <Row gutter={[24, 24]}>
          <Col span={12}>
            {" "}
            <Form.Item
              name="title"
              label="命令名称 （ CommandName ）"
              // rules={[{ required: true }]}
            >
              <Input placeholder="输入命令名称" allowClear />
            </Form.Item>
          </Col>
          <Col span={12}>
            {" "}
            <Form.Item name="name1" label="命令ID">
              <Input placeholder="系统自动分配" disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col span={12}>
            {" "}
            <Form.Item
              name="name2"
              label="所属设备类型 （ Group/device Type ）"
            >
              <Select placeholder="选择所属设备类型" allowClear>
                <Option value="1">设备一</Option>
                <Option value="0">设备二</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            {" "}
            <Form.Item
              name="name3"
              label="所属设备类型编码 ( GroupType/Type Code )"
            >
              <Input placeholder="输入所属设备类型编码" allowClear />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[24, 24]}>
          <Col span={12}>
            {" "}
            <Form.Item name="name4" label="输入参数类型">
              <Select placeholder="选择输入参数类型" allowClear>
                <Option value="1">类型一</Option>
                <Option value="0">类型二</Option>
              </Select>
            </Form.Item>
          </Col>{" "}
          <Col span={12}>
            {" "}
            <Form.Item name="name5" label="输入参数单位">
              <Select placeholder="选择输入参数单位" allowClear>
                <Option value="1">KV</Option>
                <Option value="0">mV</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col span={12}>
            {" "}
            <Form.Item
              name="name6"
              label="安全操作 （ safe operation ）"
              initialValue={"1"}
            >
              <Select placeholder="选择安全操作" allowClear>
                <Option value="1">✓</Option>
                <Option value="0">✗</Option>
              </Select>
            </Form.Item>
          </Col>{" "}
          <Col span={12}>
            <Form.Item
              name="name8"
              label="设备型号 ( model name )"
              rules={[{ required: true }]}
            >
              <Input allowClear placeholder="输入设备型号" />
            </Form.Item>{" "}
          </Col>
        </Row>
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Form.Item name="name7" label="接口 ( Interface )">
              <Select
                placeholder="选择接口"
                allowClear
                showSearch
                loading={loading}
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {userList.map((user) => (
                  <Option key={user.id} value={user.id}>
                    {user.name ||
                      user.username ||
                      user.realName ||
                      user.displayName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            {" "}
            <Form.Item name="name9" label="通道 ( Channels per Module )">
              <Select
                placeholder="选择通道"
                allowClear
                showSearch
                loading={loading}
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {userList.map((user) => (
                  <Option key={user.id} value={user.id}>
                    {user.name ||
                      user.username ||
                      user.realName ||
                      user.displayName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[24, 24]}>
          <Col span={12}>
            {" "}
            <Form.Item
              name="name10"
              label="默认参数 （ Default Parameter ）"
              rules={[{ required: true }]}
            >
              <Input
                allowClear
                placeholder="输入默认参数，各参数间用逗号分隔"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddModal;
