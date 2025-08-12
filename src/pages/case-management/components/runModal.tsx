import { DemoService } from "@/services/case-management/test-sequence.service";
import {
  DatePicker,
  type DatePickerProps,
  Form,
  Input,
  message,
  Modal,
  Select,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  updateValue?: any;
  currentNode?: string;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const RunModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  updateValue,
  currentNode,
}) => {
  const [treeData, setTreeData] = useState<any>([]);
  const [title, setTitle] = useState("add");

  const [userList, setUserList] = useState<any>([]);
  // 加载树数据
  const loadTreeData = async () => {
    try {
      const response = await DemoService.getTreeData();
      if (response.code === 200) {
        let list =
          response.data.length > 0 &&
          response.data.map((item) => ({
            ...item,
            selectable: false,
          }));
        setTreeData(list || []);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("加载树数据失败");
    } finally {
      // setTreeLoading(false);
    }
  };

  useEffect(() => {
    console.log("currentNode", currentNode);

    if (open) {
      loadTreeData();
      form?.resetFields();
      updateValue &&
        form?.setFieldsValue({ ...updateValue, gender: currentNode });
    }
  }, [open, updateValue]);

  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log(values);
  };

  const handleOk = () => {
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
      title="测试程序文件信息"
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
        <Form.Item name="name" label="型号" rules={[{ required: true }]}>
          <Input placeholder="输入型号" maxLength={32} allowClear />
        </Form.Item>
        <Form.Item name="gender2" label="作者">
          <Select
            placeholder="选择作者"
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
                {user.name ||
                  user.username ||
                  user.realName ||
                  user.displayName}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="time" label="时间">
          <DatePicker
            showTime
            defaultValue={dayjs()}
            onChange={(value, dateString) => {
              console.log("Selected Time: ", value);
              console.log("Formatted Selected Time: ", dateString);
            }}
            onOk={(value: DatePickerProps["value"]) => {
              console.log("time", value);
            }}
          />
        </Form.Item>
        <Form.Item name="message" label="说明">
          <Input.TextArea rows={4} placeholder="输入说明" />
        </Form.Item>
        <Form.Item name="status" label="配置文件">
          <Select placeholder="选择配置文件" allowClear>
            <Option value="Pre测试">配置文件1.hwc</Option>
            <Option value="UUT测试">配置文件2.hwc</Option>
            <Option value="Post测试">配置文件3.hwc</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RunModal;
