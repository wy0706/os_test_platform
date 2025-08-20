import { Col, Form, Input, InputNumber, Modal, Row, Select } from "antd";
import { useEffect, useState } from "react";
import { dataTypeOptions, unitOptions } from "./schemas";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  type: string;
  updateValue?: any;
}
const { Option } = Select;

const TempModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  type,
  updateValue,
}) => {
  const [title, setTitle] = useState("新建");
  const [treeData, setTreeData] = useState<any>([]);
  const [selectedDataType, setSelectedDataType] = useState<string>("");

  // 加载树数据

  useEffect(() => {
    if (open) {
      form?.resetFields();
      if (updateValue) {
        form?.setFieldsValue({ ...updateValue });
        setSelectedDataType(updateValue.dataType || "");
      } else {
        setSelectedDataType("");
      }
    }
  }, [open, type, updateValue]);

  // 判断是否需要显示精度选项
  const shouldShowPrecision = (dataType: string) => {
    return ["Float", "Float[]", "LoadVector"].includes(dataType);
  };

  // 判断是否需要启用数组大小字段
  const shouldEnableArraySize = (dataType: string) => {
    return ["Float[]", "int[]", "bytearray"].includes(dataType);
  };

  // 判断是否可以编辑最大值最小值
  const canEditMinMaxValue = (dataType: string) => {
    // 数组类型和特定类型不可以编辑最小值和最大值
    return ![
      "Float[]",
      "int[]",
      "bytearray",
      "bytes",
      "str",
      "LineInVector",
      "LoadVector",
    ].includes(dataType);
  };

  // 判断是否可以编辑默认值
  const canEditDefaultValue = (dataType: string) => {
    // 数组类型不可以编辑默认值
    return !["Float[]", "int[]", "bytearray"].includes(dataType);
  };

  // 处理数据类型变化
  const handleDataTypeChange = (value: string) => {
    setSelectedDataType(value);
    // 如果不支持精度的类型，清空精度字段
    // if (!shouldShowPrecision(value)) {
    //   form.setFieldValue("precision", undefined);
    // }
  };

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
        // 可以在这里添加用户提示
      });
  };

  return (
    <Modal
      title="临时变量"
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form
        form={form}
        name="control-hooks"
        onFinish={onFinish}
        layout="vertical"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="extensionName"
              label="扩展名"
              // rules={[{ required: true }]}
            >
              <Input placeholder="输入扩展名" maxLength={32} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="variableName" label="变量名">
              <Input placeholder="输入变量名" maxLength={32} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="dataType" label="数据类型">
              <Select
                placeholder="选择数据类型"
                options={dataTypeOptions}
                onChange={handleDataTypeChange}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="arraySize" label="数组大小">
              <InputNumber
                style={{ width: "100%" }}
                disabled={!shouldEnableArraySize(selectedDataType)}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="unit" label="单位">
              <Select placeholder="选择单位" options={unitOptions} />
            </Form.Item>
          </Col>
          {/* <Col span={12}>
            <Form.Item name="visible" label="是否可见">
              <Select placeholder="选择是否可见">
                <Option value="success">✓</Option>
                <Option value="error">✗</Option>
              </Select>
            </Form.Item>
          </Col> */}
        </Row>
      </Form>
    </Modal>
  );
};

export default TempModal;
