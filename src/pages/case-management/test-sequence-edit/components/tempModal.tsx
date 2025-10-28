import { updateOneTemp } from "@/services/case-management/test-sequence-edit.service";
import { useSetState } from "ahooks";
import {
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
} from "antd";
import { useEffect } from "react";
import { dataTypeOptions, shouldEnableArraySize, unitOptions } from "./schemas";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  type: string;
  updateValue?: any;
}

const TempModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  updateValue,
}) => {
  const [state, setState] = useSetState<any>({
    selectedDataType: null,
    confirmLoading: false,
  });

  const { selectedDataType, confirmLoading } = state;
  // 加载树数据

  useEffect(() => {
    initData();
  }, [open, updateValue]);

  const initData = () => {
    if (!open) return;
    form?.resetFields();
    if (updateValue) {
      form?.setFieldsValue({ ...updateValue });

      setState({ selectedDataType: updateValue.dataType || "" });
    } else {
      setState({ selectedDataType: "" });
    }
  };

  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    console.log("Form values:", values);
    if (!updateValue?.temp_id) return;
    try {
      setState({ confirmLoading: true });
      const { code, message: msg } = await updateOneTemp({
        ...values,
        temp_id: updateValue?.temp_id,
      });
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success("操作成功");
      onOk?.(values);
    } catch (error) {
    } finally {
      setState({ confirmLoading: false });
    }
  };

  return (
    <Modal
      title="临时变量"
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      afterClose={() => form?.resetFields()}
      confirmLoading={confirmLoading}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="extension_name" label="扩展名">
              <Input allowClear placeholder="输入扩展名" maxLength={32} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="variable_name"
              label="变量名"
              rules={[{ required: true }]}
            >
              <Input placeholder="输入变量名" maxLength={32} allowClear />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="data_type"
              label="数据类型"
              rules={[{ required: true }]}
            >
              <Select
                allowClear
                placeholder="选择数据类型"
                options={dataTypeOptions}
                onChange={(value) => {
                  setState({ selectedDataType: value });
                }}
              />
            </Form.Item>
          </Col>
          {shouldEnableArraySize(selectedDataType) && (
            <Col span={12}>
              <Form.Item name="array_size" label="数组大小">
                <InputNumber style={{ width: "100%" }} min={1} />
              </Form.Item>
            </Col>
          )}
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="unit" label="单位">
              <Select placeholder="选择单位" options={unitOptions} allowClear />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default TempModal;
