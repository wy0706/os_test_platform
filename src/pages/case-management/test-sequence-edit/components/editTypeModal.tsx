import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { useSetState } from "ahooks";
import { Button, Form, Input, Modal, Select, Space } from "antd";
import { useEffect, useState } from "react";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  type?: string;
  updateValue?: any;
}
const { Option } = Select;

const EditTypeModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  type,
  updateValue,
}) => {
  const [selectedDataType, setSelectedDataType] = useState<string>("");
  const [state, setState] = useSetState<any>({
    title: "",
  });
  const { title } = state;
  const [form] = Form.useForm();
  useEffect(() => {
    if (open) {
      form.setFieldsValue(updateValue);
    } else {
      form.resetFields();
    }
  }, [open, updateValue, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Form values:", values);

        onOk?.(values);
      })
      .catch((errorInfo) => {
        console.error("Validation failed:", errorInfo);
        // 可以在这里添加用户提示
      });
  };

  return (
    <Modal
      title="编辑类型"
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form
        name="dynamic_form_nest_item"
        style={{ width: "100%" }}
        autoComplete="off"
        form={form}
        layout="vertical"
      >
        <Form.List name="project">
          {(fields, { add, remove, move }) => (
            <div
              style={{
                width: "100%",
                border: "1px solid #eee",
                padding: "16px",
                borderRadius: "8px",
                background: "#fafafa",
              }}
            >
              {fields.map(({ key, name, ...restField }, index) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: 8,
                    width: "100%",
                  }}
                >
                  {/* 输入框 */}
                  <Form.Item
                    {...restField}
                    name={[name, "first"]}
                    style={{ flex: 1 }}
                    rules={[{ required: true, message: "请输入枚举名" }]}
                  >
                    <Input placeholder="输入枚举名" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "last"]}
                    style={{ flex: 1 }}
                    rules={[{ required: true, message: "请输入枚举值" }]}
                  >
                    <Input placeholder="输入枚举值" />
                  </Form.Item>

                  {/* 操作按钮 */}

                  <Space>
                    <Button
                      type="text"
                      icon={<ArrowUpOutlined />}
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                    />
                    <Button
                      type="text"
                      icon={<ArrowDownOutlined />}
                      disabled={index === fields.length - 1}
                      onClick={() => move(index, index + 1)}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                    />
                  </Space>
                </div>
              ))}
              <Button type="dashed" onClick={() => add()} block>
                + 添加
              </Button>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default EditTypeModal;
