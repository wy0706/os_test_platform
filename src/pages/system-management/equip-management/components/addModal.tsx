import { uploadFile as uploadFileService } from "@/services/system-management/equip-management.service";
import { getAll as getUserList } from "@/services/system-management/user-management.service";
import { InfoCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { useSetState } from "ahooks";
import { Button, Col, Form, Input, Modal, Row, Select, Upload } from "antd";
import { useEffect, useState } from "react";
import { interfOptons } from "../schemas";
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
  const options = Array.from({ length: 20 }, (_, i) => ({
    label: String(i + 1),
    value: i + 1,
  }));
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
    console.log("updateValue", updateValue);

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

  const beforeUpload = (file: any) => {
    const isLt = file.size / 1024 / 1024;

    if (isLt > 2) {
      console.log("文件必须小于 2MB!");
    }
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
      title={`${title}设备`}
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
              label="设备类型"
              rules={[{ required: true }]}
            >
              {/* 不可编辑，设备类选中就已确定 */}
              <Select placeholder="选择设备类型" allowClear>
                <Option value="1">类型1</Option>
                <Option value="0">类型2</Option>
              </Select>
            </Form.Item>
          </Col>
          {/* <Col span={12}>
            {" "}
            <Form.Item name="name1" label="设备类型">
              <Input placeholder="输入设备类型" allowClear />
            </Form.Item>
          </Col> */}
          <Col span={12}>
            {" "}
            <Form.Item
              name="name3"
              rules={[{ required: true }]}
              label="激活"
              initialValue={"1"}
            >
              <Select placeholder="选择是否激活" allowClear>
                <Option value="1">✓</Option>
                <Option value="0">✗</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* <Col span={12}>
            {" "}
            <Form.Item name="name2" label="设备类型编码">
              <Input placeholder="输入设备类型编码" allowClear />
            </Form.Item>
          </Col> */}
          <Col span={12}>
            {" "}
            <Form.Item
              name="name5"
              label="设备型号"
              rules={[{ required: true }]}
            >
              <Input placeholder="输入设备型号" allowClear />
            </Form.Item>
          </Col>{" "}
          <Col span={12}>
            {" "}
            <Form.Item name="name6" label="接口" rules={[{ required: true }]}>
              <Select
                placeholder="选择接口"
                allowClear
                showSearch
                options={interfOptons}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>{" "}
        </Row>

        {/* <Col span={12}>
            {" "}
            <Form.Item name="name4" label="安全操作" initialValue={"1"}>
              <Select placeholder="选择安全操作" allowClear>
                <Option value="1">✓</Option>
                <Option value="0">✗</Option>
              </Select>
            </Form.Item>
          </Col>{" "} */}

        <Row gutter={[24, 24]}>
          <Col span={12}>
            {" "}
            <Form.Item
              name="name7"
              label="通道"
              rules={[{ required: true }]}
              initialValue={1}
            >
              <Select
                placeholder="选择通道"
                options={options}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "").toString().includes(input)
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            {" "}
            <Form.Item
              name="name8"
              label="默认参数"
              rules={[{ required: true }]}
            >
              <Input
                allowClear
                placeholder="输入默认参数，各参数间用逗号分隔"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[24, 24]}>
          <Col span={12}>
            {" "}
            <Form.Item
              name="name9"
              label="API DLL"
              rules={[{ required: true }]}
              tooltip={{
                title: "支持扩展名： .dll",
                icon: <InfoCircleOutlined />,
              }}
            >
              {" "}
              <Upload
                customRequest={uploadFile}
                beforeUpload={beforeUpload}
                // accept=".xls,.xlsx, .docx, .dll"
                accept=".dll"
                maxCount={1}
                // showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddModal;
