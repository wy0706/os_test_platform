import { updateOneResult } from "@/services/case-management/test-sequence-edit.service";
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
import {
  dataTypeOptions,
  precisionOptions,
  toNum,
  unitOptions,
} from "./schemas";
interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  type: string;
  updateValue?: any;
}
const { Option } = Select;

const ResultModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  type,
  updateValue,
}) => {
  // const [selectedDataType, setSelectedDataType] = useState<string>("");
  const [state, setState] = useSetState<any>({
    selectedDataType: null,
    confirmLoading: false,
  });

  const { selectedDataType, confirmLoading } = state;
  // 加载树数据

  useEffect(() => {
    if (open) {
      form?.resetFields();
      if (updateValue) {
        form?.setFieldsValue({ ...updateValue });

        setState({ selectedDataType: updateValue.data_type || "" });
      } else {
        setState({ selectedDataType: null });
      }
    }
  }, [open, type, updateValue]);

  // 判断是否需要显示精度选项
  const shouldShowPrecision = (data_type: number) => {
    return [0, 10].includes(Number(data_type));
  };

  // 判断是否需要启用数组大小字段
  const shouldEnableArraySize = (data_type: number) => {
    return [10, 11, 12].includes(Number(data_type));
  };

  // 判断是否可以编辑最大值最小值和默认值
  const canEditMinMaxValue = (data_type: number) => {
    // 数组类型和特定类型不可以编辑最小值和最大值
    return ![
      10, 11, 12,
      // "bytes",
      43,
      // "LineInVector",
      // "LoadVector",
    ].includes(Number(data_type));
  };
  // str可以支持输入最大值默认值，所以在最大值默认值判断上改成canEditMinMaxValue2
  const canEditMinMaxValue2 = (data_type: number) => {
    // 数组类型和特定类型不可以编辑最小值和最大值
    return ![
      10, 11, 12,
      // "bytes",
      // "str",
      // "LineInVector",
      // "LoadVector",
    ].includes(Number(data_type));
  };

  // 判断是否可以编辑默认值
  const canEditDefaultValue = (data_type: number) => {
    // 数组类型不可以编辑默认值
    return ![10, 11, 12].includes(Number(data_type));
  };

  // 处理数据类型变化
  const handleDataTypeChange = (value: string) => {
    setState({ selectedDataType: Number(value) });
    // 如果不支持精度的类型，清空精度字段
    // if (!shouldShowPrecision(value)) {
    //   form.setFieldValue("precision", undefined);
    // }
  };

  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    if (!updateValue.result_id) return;
    let params = {
      ...values,
      data_type: toNum(values.data_type),
      array_size: toNum(values.array_size),
      result_id: updateValue.result_id,
    };
    if (shouldEnableArraySize(params.data_type)) {
      const size = params.array_size || 1;
      let list = Array(size).fill("0");
      params.max_Def = JSON.stringify(list);
      params.min_Def = JSON.stringify(list);
    }
    console.log(params, "params");

    try {
      setState({ confirmLoading: true });
      const { code, message: msg } = await updateOneResult(params);
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");

      if (onOk) {
        onOk(params);
      }
      setState({ confirmLoading: false });
    } catch (error) {
    } finally {
      setState({ confirmLoading: false });
    }
  };

  return (
    <Modal
      title="测试结果"
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      destroyOnHidden
      confirmLoading={confirmLoading}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={(changedValues, allValues) => {
          if (
            "min_lmt_Low" in changedValues ||
            "min_lmt_Upp" in changedValues ||
            "max_lmt_Low" in changedValues ||
            "max_lmt_Upp" in changedValues
          ) {
            form.validateFields(["min_Def", "max_Def"]);
          }
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="extension_name" label="扩展名">
              <Input placeholder="输入扩展名" maxLength={32} allowClear />
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

          <Col span={12}>
            <Form.Item
              name="data_type"
              label="数据类型"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="选择数据类型"
                options={dataTypeOptions}
                onChange={handleDataTypeChange}
              />
            </Form.Item>
          </Col>
          {shouldShowPrecision(selectedDataType) && (
            <Col span={12}>
              <Form.Item name="precision" label="精度">
                <Select placeholder="选择精度" options={precisionOptions} />
              </Form.Item>
            </Col>
          )}

          {canEditMinMaxValue(selectedDataType) && (
            <Col span={12}>
              <Form.Item name="min_lmt_Low" label="最小值下限">
                <Input placeholder="输入最小值" allowClear />
              </Form.Item>
            </Col>
          )}
          {canEditMinMaxValue(selectedDataType) && (
            <Col span={12}>
              <Form.Item name="max_lmt_Low" label="最大值下限">
                <Input placeholder="输入最大值下限" allowClear />
              </Form.Item>
            </Col>
          )}

          {canEditMinMaxValue(selectedDataType) && (
            <Col span={12}>
              <Form.Item name="min_lmt_Upp" label="最小值上限">
                <Input placeholder="输入最小值上限" allowClear />
              </Form.Item>
            </Col>
          )}
          {canEditMinMaxValue(selectedDataType) && (
            <Col span={12}>
              <Form.Item name="max_lmt_Upp" label="最大值上限">
                <Input placeholder="输入最大值上限" allowClear />
              </Form.Item>
            </Col>
          )}

          {canEditMinMaxValue(selectedDataType) && (
            <Col span={12}>
              <Form.Item
                name="min_Def"
                label="最小值默认值"
                rules={[
                  { required: true, message: "请输入最小值默认值" },
                  // ({ getFieldValue }) => ({
                  //   validator(_, value) {
                  //     const minOff = Number(getFieldValue("min_lmt_Low"));
                  //     const minHigh = Number(getFieldValue("min_lmt_Upp"));
                  //     const defaultValue = Number(value);
                  //     if (!minOff && !minHigh) return;
                  //     // 校验是否为有效数字
                  //     if (isNaN(defaultValue)) {
                  //       return Promise.reject(new Error("请输入有效数字"));
                  //     }

                  //     // 校验是否在上下限范围内
                  //     if (
                  //       !isNaN(minOff) &&
                  //       !isNaN(minHigh) &&
                  //       defaultValue >= minOff &&
                  //       defaultValue <= minHigh
                  //     ) {
                  //       return Promise.resolve();
                  //     }

                  //     return Promise.reject(
                  //       new Error(
                  //         "默认值设置超出最小值下限和最小值上限范围，请重新设置"
                  //       )
                  //     );
                  //   },
                  // }),
                ]}
              >
                <Input placeholder="输入最小值默认值" allowClear />
              </Form.Item>
            </Col>
          )}

          {canEditMinMaxValue2(selectedDataType) && (
            <Col span={12}>
              <Form.Item
                name="max_Def"
                label="最大值默认值"
                rules={[
                  { required: true, message: "请输入最大值默认值" },
                  // ({ getFieldValue }) => ({
                  //   validator(_, value) {
                  //     const maxOff = Number(getFieldValue("max_lmt_Low"));
                  //     const maxHigh = Number(getFieldValue("max_lmt_Upp"));
                  //     if (!maxOff && !maxHigh) return;
                  //     const defaultValue = Number(value);

                  //     if (isNaN(defaultValue)) {
                  //       return Promise.reject(new Error("请输入有效数字"));
                  //     }

                  //     if (
                  //       !isNaN(maxOff) &&
                  //       !isNaN(maxHigh) &&
                  //       defaultValue >= maxOff &&
                  //       defaultValue <= maxHigh
                  //     ) {
                  //       return Promise.resolve();
                  //     }

                  //     return Promise.reject(
                  //       new Error(
                  //         "默认值设置超出最大值下限和最大值上限范围，请重新设置"
                  //       )
                  //     );
                  //   },
                  // }),
                ]}
              >
                <Input placeholder="输入最大值默认值" allowClear />
              </Form.Item>
            </Col>
          )}

          {shouldEnableArraySize(selectedDataType) && (
            <Col span={12}>
              <Form.Item name="array_size" label="数组大小">
                <InputNumber style={{ width: "100%" }} min={1} />
              </Form.Item>
            </Col>
          )}

          <Col span={12}>
            <Form.Item name="unit" label="单位">
              <Select placeholder="选择单位" options={unitOptions} allowClear />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="visibility" label="是否可见">
              <Select placeholder="选择是否可见">
                <Option value={1}>✓</Option>
                <Option value={0}>✗</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ResultModal;
