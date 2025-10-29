import { updateOneEnum } from "@/services/case-management/test-sequence-edit.service";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { useSetState } from "ahooks";
import { Button, Form, Input, message, Modal, Select, Space } from "antd";
import { useEffect } from "react";
interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  updateValue?: any;
}
const { Option } = Select;

const EditTypeModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  updateValue,
}) => {
  const [state, setState] = useSetState<any>({
    confirmLoading: false,
  });
  const { confirmLoading } = state;
  const [form] = Form.useForm();
  useEffect(() => {
    initData();
  }, [open, updateValue, form]);
  const initData = () => {
    if (!open) return;
    form?.resetFields();

    if (updateValue?.enum && Array.isArray(updateValue.enum)) {
      const normalized = updateValue.enum.map((it: any) => {
        if (
          it &&
          typeof it === "object" &&
          !("key" in it) &&
          !("value" in it)
        ) {
          // 形如 { item1: 1 }
          const k = Object.keys(it)[0];
          return { key: k, value: it[k] };
        }
        return it; // 形如 { key:'item1', value:1 }
      });

      form.setFieldsValue({ project: normalized });
    } else {
      form.setFieldsValue({ project: [{ key: "", value: "" }] });
    }
  };
  const isNumeric = (v: any) => /^-?\d+(\.\d+)?$/.test(String(v).trim());
  const handleOk = async () => {
    const values = await form.validateFields();
    console.log("valuaes", values);

    const list: Array<{ key: string; value: any }> = values?.project ?? [];
    const trimmedKeys = list.map((i) => String(i?.key ?? "").trim());
    if (trimmedKeys.some((k) => !k)) {
      message.error("存在空的枚举名，请填写完整");
      setState({ confirmLoading: false });
      return;
    }
    const dup = trimmedKeys.find((k, idx) => trimmedKeys.indexOf(k) !== idx);
    if (dup) {
      message.error(`存在重复枚举名：${dup}，请修改后再提交`);
      setState({ confirmLoading: false });
      return;
    }
    // 2) 严格“按当前顺序”映射为 [{ item1: 1 }, { item2: 2 }]
    const payloadProject = list.map((item) => {
      const k = String(item.key).trim();
      const rawV = item.value;
      const vStr = String(rawV).trim();
      const v = isNumeric(vStr) ? Number(vStr) : rawV; // 数字字符串转 number
      return { [k]: v };
    });
    console.log("list", payloadProject);

    console.log("updateValue", updateValue);

    const { code, message: msg } = await updateOneEnum({
      condition_id: updateValue.condition_id,
      enum: payloadProject,
    });
    console.log("Form values:", values);

    onOk?.(values);
  };

  return (
    <Modal
      title="编辑类型"
      maskClosable={false}
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel?.();
      }}
      confirmLoading={confirmLoading}
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
                    name={[name, "key"]}
                    style={{ flex: 1 }}
                    rules={[{ required: true, message: "请输入枚举名" }]}
                  >
                    <Input placeholder="输入枚举名" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "value"]}
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
