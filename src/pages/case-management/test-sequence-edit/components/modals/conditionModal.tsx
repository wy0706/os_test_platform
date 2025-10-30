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
} from "../schemas";

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
    selectedDataType: null, // number
    selectEdittype: null, // 0 EditBox / 1 ComboList
    confirmLoading: false,
    enumOptions: [] as Array<{ label: string; value: any }>,
  });

  const { selectedDataType, selectEdittype, confirmLoading, enumOptions } =
    state;

  const shouldShowPrecision = (dataType?: number | null) =>
    [0, 10].includes(Number(dataType));
  const shouldEnableArraySize = (dataType?: number | null) =>
    [10, 11, 12].includes(Number(dataType));
  const canEditMinMaxValue = (dataType?: number | null) =>
    ![10, 11, 12].includes(Number(dataType));
  const shouldDisableEditType = (dataType?: number | null) =>
    ![1, 11].includes(Number(dataType));

  // 是否使用输入框（EditBox）：
  // 当 selectedDataType !== 1 或（selectedDataType === 1 且 selectEdittype === 0）
  const useInput =
    selectedDataType !== 1 || (selectedDataType === 1 && selectEdittype === 0);

  // 你的原始“必填”规则
  const requiredByRule =
    selectEdittype === 0 || (selectEdittype === 1 && enumOptions.length > 0);

  const handleDataTypeChange = (value: number | string) => {
    setState({ selectedDataType: Number(value) });
    // 切换数据类型时，清理两个默认值，防止带脏值
    form.setFieldsValue({
      default_value1: undefined,
      default_value2: undefined,
    });
  };

  useEffect(() => {
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // 生成枚举选项
      let opts: Array<{ label: string; value: any }> = [];
      if (Array.isArray(patched.enum)) {
        opts = enumToOptions(patched.enum) || [];
      }

      // 根据“用输入框/用选择框”来回填两个字段之一
      let default_value1: any = undefined; // 输入框值
      let default_value2: any = undefined; // 选择框值（labelInValue）

      const willUseInput =
        patched.data_type !== 1 ||
        (patched.data_type === 1 && patched.edit_type === 0);

      if (willUseInput) {
        // EditBox 模式 → 回填到 default_value1
        default_value1 = patched.default_value ?? undefined;
      } else {
        // ComboList 模式：只有 enum 有值时才允许回填
        if (opts.length > 0) {
          const match = opts.find(
            (o) =>
              String(o.value) === String(patched.default_value) ||
              String(o.label) === String(patched.default_value)
          );
          default_value2 = match
            ? { label: match.label, value: match.value }
            : undefined;
        } else {
          default_value2 = undefined;
        }
      }

      form.setFieldsValue({
        ...patched,
        default_value1,
        default_value2,
      });

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

      // 先跑校验（只会校验当前可见字段）
      await form.validateFields();

      const values = form.getFieldsValue(true);

      // 归一化
      const normalized: any = {
        ...values,
        condition_id: updateValue.condition_id,
        data_type: toNum(values.data_type),
        array_size: toNum(values.array_size),
        edit_type: toNum(values.edit_type),
        precision: toNum(values.precision),
        visibility: toNum(values.visibility),
      };

      // 统一 default_value：根据当前模式从 default_value1 / default_value2 取
      if (useInput) {
        // 输入框模式
        normalized.default_value = values.default_value1 ?? "";
      } else {
        // 选择框模式：仅当 enum 有数据时有效
        if (enumOptions.length > 0) {
          const v = values.default_value2;
          normalized.default_value =
            v && typeof v === "object" ? v.label : v ?? "";
        } else {
          normalized.default_value = "";
        }
      }

      // 数组类型：默认值为数组字符串
      if (shouldEnableArraySize(normalized.data_type)) {
        const size = normalized.array_size || 1;
        const list = Array(size).fill("0");
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
      // noop
    } finally {
      setState({ confirmLoading: false });
    }
  };

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
                    // 切换编辑类型时，清空两个默认值字段，避免残留
                    form.setFieldsValue({
                      default_value1: undefined,
                      default_value2: undefined,
                    });
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

          {/* --- 默认值：双字段方案 --- */}
          {canEditMinMaxValue(selectedDataType) && (
            <>
              {/* 输入框模式：default_value1 */}
              <Col span={12} hidden={!useInput}>
                <Form.Item
                  name="default_value1"
                  label="默认值"
                  rules={[
                    {
                      required: useInput && requiredByRule,
                      message: "请设置默认值",
                    },
                  ]}
                >
                  <Input allowClear placeholder="输入默认值" />
                </Form.Item>
              </Col>

              {/* 选择框模式：default_value2 */}
              <Col span={12} hidden={useInput}>
                <Form.Item
                  name="default_value2"
                  label="默认值"
                  rules={[
                    {
                      required: !useInput && requiredByRule, // 等价于 selectEdittype===1 && enumOptions.length>0
                      message: "请选择默认值",
                    },
                  ]}
                >
                  <Select
                    labelInValue
                    allowClear
                    placeholder={
                      enumOptions.length > 0 ? "选择默认值" : "无可选项"
                    }
                    options={enumOptions}
                    disabled={enumOptions.length === 0}
                    onClear={() =>
                      form.setFieldValue("default_value2", undefined)
                    }
                  />
                </Form.Item>
              </Col>
            </>
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
