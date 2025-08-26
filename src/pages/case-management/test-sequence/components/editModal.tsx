import { DemoService } from "@/services/case-management/test-sequence.service";
import { Form, Input, message, Modal, Select, TreeSelect } from "antd";
import { useEffect, useState } from "react";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  type: string;
  updateValue?: any;
  currentNode?: string;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const EditModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  type,
  updateValue,
  currentNode,
}) => {
  const [title, setTitle] = useState("新建");
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
    const name =
      type === "edit" ? "编辑" : type === "copy" ? "复制序列" : "移动";
    setTitle(name);
    if (open) {
      loadTreeData();
      form?.resetFields();
      updateValue &&
        form?.setFieldsValue({ ...updateValue, gender: currentNode });
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
      title={`${title}序列`}
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
        {type && type !== "remove" && (
          <Form.Item name="name" label="序列名称" rules={[{ required: true }]}>
            <Input placeholder="输入序列名称" maxLength={32} />
          </Form.Item>
        )}
        {/* 树级结构 二级 */}
        {type && (type === "copy" || type === "remove") && (
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
        )}
        {type && type !== "remove" && (
          <Form.Item name="status" label="是否发布">
            <Select placeholder="选择是否发布">
              <Option value="success">✓</Option>
              <Option value="error">✗</Option>
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default EditModal;
