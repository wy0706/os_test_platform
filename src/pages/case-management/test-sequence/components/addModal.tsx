import { DemoService } from "@/services/case-management/test-sequence.service";
import { Form, Input, message, Modal, Select, TreeSelect } from "antd";
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

const AddModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  updateValue,
  currentNode,
}) => {
  const [treeData, setTreeData] = useState<any>([]);

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
      title="新建测试序列"
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
        <Form.Item name="name" label="序列名称" rules={[{ required: true }]}>
          <Input placeholder="输入序列名称" maxLength={32} />
        </Form.Item>

        <Form.Item name="gender" label="序列类型">
          <TreeSelect
            fieldNames={{ label: "name", value: "id" }}
            showSearch
            style={{ width: "100%" }}
            styles={{
              popup: { root: { maxHeight: 400, overflow: "auto" } },
            }}
            placeholder="选择序列类型"
            allowClear
            treeDefaultExpandAll
            treeData={treeData}
          />
        </Form.Item>

        <Form.Item name="status" label="测试流程">
          <Select placeholder="选择测试流程">
            <Option value="Pre测试">Pre测试</Option>
            <Option value="UUT测试">UUT测试</Option>
            <Option value="Post测试">Post测试</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddModal;
