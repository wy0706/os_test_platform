import { updateOneCondition } from "@/services/case-management/test-sequence-edit.service";
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
  enumToOptions,
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

const ConditionsModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  type,
  updateValue,
}) => {
  const [form] = Form.useForm();

  const [state, setState] = useSetState<any>({
    selectedDataType: null,
    selectEdittype: null,
    confirmLoading: false,
    enumOptions: [],
  });

  const { selectedDataType, selectEdittype, confirmLoading, enumOptions } =
    state;

  const shouldShowPrecision = (dataType?: number | null) =>
    [0, 10].includes(Number(dataType));

  // 是否启用数组大小
  const shouldEnableArraySize = (dataType?: number | null) =>
    [10, 11, 12].includes(Number(dataType));

  // 最小/最大值是否可编辑（数组与特定类型不允许）
  const canEditMinMaxValue = (dataType?: number | null) =>
    ![10, 11, 12].includes(Number(dataType));

  // 只有 data_type 为 1(int) 或 11(int[]) 时可选择编辑类型，其它都禁用
  const shouldDisableEditType = (dataType?: number | null) =>
    ![1, 11].includes(Number(dataType));

  // 数组类型不可以编辑默认值
  const canEditDefaultValue = (dataType?: number | null) =>
    ![10, 11, 12].includes(Number(dataType));

  const handleDataTypeChange = (value: number | string) => {
    setState({ selectedDataType: Number(value) });
    // 如果不支持精度，可以选择清空精度
    // form.setFieldValue("precision", undefined);
  };

  useEffect(() => {
    initData();
  }, [open, type, updateValue]);

  const initData = () => {
    if (!open) {
      setState({
        selectedDataType: null,
        selectEdittype: null,
        enumOptions: [],
      });
      return;
    }
    form.resetFields();

    if (updateValue) {
      // 把可能的字符串数字统一转为 number，且保留 0
      const patched = {
        ...updateValue,
        data_type: toNum(updateValue?.data_type),
        edit_type: toNum(updateValue?.edit_type),
        min_value: updateValue?.min_value,
        max_value: updateValue?.max_value,
        default_value: updateValue?.default_value,
        precision: toNum(updateValue?.precision),
        array_size: toNum(updateValue?.array_size),
        visibility: toNum(updateValue?.visibility),
      };

      // 生成 enum 下拉
      let opts: Array<{ label: string; value: any }> = [];
      if (patched?.edit_type === 1 && Array.isArray(patched?.enum)) {
        opts = enumToOptions(patched.enum);
      }
      // 如果 default_value 不在 options 里，清空
      const hasDefault =
        opts.length > 0 &&
        opts.some((o) => String(o.value) === String(patched.default_value));
      const formValues = {
        ...patched,
        default_value: hasDefault ? patched.default_value : undefined,
      };
      form.setFieldsValue(formValues);

      setState({
        selectedDataType: patched.data_type,
        selectEdittype: patched.edit_type,
        enumOptions: opts,
      });
    } else {
      setState({
        selectedDataType: null,
        selectEdittype: null,
        enumOptions: [],
      });
    }
  };

  const handleOk = async () => {
    try {
      setState({ confirmLoading: true });
      const values = await form.validateFields();
      const normalized = {
        ...values,
        condition_id: updateValue.condition_id,
        data_type: toNum(values.data_type),
        array_size: toNum(values.array_size),
        edit_type: toNum(values.edit_type),
        precision: toNum(values.precision),

        visibility: toNum(values.visibility),
      };

      if (normalized.edit_type === 1 && enumOptions.length > 0) {
        normalized.default_value = normalized.default_value["label"];
      }

      if (normalized.edit_type === 1 && !normalized.default_value) {
        normalized.default_value = "";
      }

      if (shouldEnableArraySize(normalized.data_type)) {
        const size = normalized.array_size || 1;
        console.log("size", size);
        let list = Array(size).fill("0");
        normalized.default_value = JSON.stringify(list);
      }

      const { code, message: msg } = await updateOneCondition({
        ...normalized,
      });
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");

      onOk?.(normalized);
    } catch (e) {
    } finally {
      setState({ confirmLoading: false });
    }
  };

  // 若外部 options 里 value 可能为字符串，这里保证传入数字
  const numericDataTypeOptions =
    dataTypeOptions?.map((o: any) => ({ ...o, value: Number(o.value) })) ??
    dataTypeOptions;

  const numericPrecisionOptions =
    precisionOptions?.map((o: any) => ({ ...o, value: Number(o.value) })) ??
    precisionOptions;

  return (
    <Modal
      title="测试条件"
      maskClosable={false}
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel?.();
      }}
      confirmLoading={confirmLoading}
      styles={{ body: { padding: 20 } }}
      width="50%"
      onOk={handleOk}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="extension_name" label="扩展名">
              <Input placeholder="输入扩展名" maxLength={32} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="variable_name"
              label="变量名"
              rules={[{ required: true, message: "请输入变量名" }]}
            >
              <Input placeholder="输入变量名" maxLength={32} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="data_type"
              label="数据类型"
              rules={[{ required: true, message: "请选择数据类型" }]}
            >
              <Select
                placeholder="选择数据类型"
                options={numericDataTypeOptions}
                onChange={handleDataTypeChange}
              />
            </Form.Item>
          </Col>

          {!shouldDisableEditType(selectedDataType) ? (
            <Col span={12}>
              <Form.Item name="edit_type" label="编辑类型">
                <Select
                  placeholder="选择编辑类型"
                  onChange={(value) => {
                    setState({ selectEdittype: Number(value) });
                  }}
                  options={[
                    { label: "EditBox", value: 0 },
                    { label: "ComboList", value: 1 },
                  ]}
                />
              </Form.Item>
            </Col>
          ) : null}

          {shouldShowPrecision(selectedDataType) ? (
            <Col span={12}>
              <Form.Item name="precision" label="精度">
                <Select
                  placeholder="选择精度"
                  options={numericPrecisionOptions}
                />
              </Form.Item>
            </Col>
          ) : null}

          {canEditMinMaxValue(selectedDataType) && (
            <Col span={12}>
              <Form.Item name="min_value" label="最小值">
                <Input placeholder="输入最小值" allowClear />
              </Form.Item>
            </Col>
          )}

          <Col span={12}>
            <Form.Item name="unit" label="单位">
              <Select placeholder="选择单位" options={unitOptions} />
            </Form.Item>
          </Col>
          {/* int + EditBox 显示输入框；int + ComboList 显示选择框 */}
          {canEditMinMaxValue(selectedDataType) && (
            <Col span={12}>
              <Form.Item
                name="default_value"
                label="默认值"
                rules={[
                  {
                    required:
                      selectEdittype === 0 ||
                      (selectEdittype === 1 && enumOptions.length > 0)
                        ? true
                        : false,
                    message: "请设置默认值",
                  },
                ]}
              >
                {selectedDataType !== 1 ||
                (selectedDataType === 1 && selectEdittype === 0) ? (
                  <Input
                    allowClear
                    placeholder="默认值"
                    disabled={!canEditDefaultValue(selectedDataType)}
                  />
                ) : (
                  <Select
                    labelInValue
                    allowClear
                    placeholder="选择默认值"
                    options={enumOptions}
                  />
                )}
              </Form.Item>
            </Col>
          )}

          {shouldEnableArraySize(selectedDataType) ? (
            <Col span={12}>
              <Form.Item name="array_size" label="数组大小">
                <InputNumber style={{ width: "100%" }} min={1} />
              </Form.Item>
            </Col>
          ) : null}

          {canEditMinMaxValue(selectedDataType) && (
            <Col span={12}>
              {/* 修正字段名：max_value（原来写成 mix_value 导致无法回显/提交） */}
              <Form.Item name="max_value" label="最大值">
                <Input placeholder="输入最大值" allowClear />
              </Form.Item>
            </Col>
          )}

          <Col span={12}>
            <Form.Item name="visibility" label="是否可见">
              <Select
                placeholder="选择是否可见"
                options={[
                  { label: "✓", value: 1 },
                  { label: "✗", value: 0 },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ConditionsModal;
