import {
  createOne,
  getUnits,
  updateOne,
} from "@/services/system-management/command-management.service";

import { getCmdTreeList } from "@/services/case-management/test-sequence-edit.service";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useSetState } from "ahooks";
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
} from "antd";
import { useEffect } from "react";
import { outAndInParams } from "../schemas";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  type: "add" | "edit";
  updateValue?: any;
}
const { Option } = Select;

const layout = { labelCol: { span: 24 } };

/** 编码：行内 "/"；行间 ","  -> 例：[[1,2],[11]] => "1/2,11" */
function encodeCompact(
  rows: { types: (string | number)[] }[] | undefined
): string {
  const rowStrs = (rows || [])
    .map((r) =>
      (r?.types || [])
        .map((x) => String(x).trim())
        .filter(Boolean)
        .join("/")
    )
    .filter((seg) => seg !== "");
  return rowStrs.join(",");
}

/** 解码（带选项） -> 只负责 types；unit 在外面单独灌入 */
function decodeCompact(
  s?: string,
  opts: { ensureOneWhenEmpty?: boolean; appendBlank?: boolean } = {
    ensureOneWhenEmpty: true,
    appendBlank: false,
  }
): { types: string[] }[] {
  const ensureOneWhenEmpty = opts.ensureOneWhenEmpty ?? true;
  const appendBlank = !!opts.appendBlank;

  if (!s || !s.trim()) {
    const base = ensureOneWhenEmpty ? [{ types: [] }] : [];
    return appendBlank ? base.concat([{ types: [] }]) : base;
  }

  const rows = s
    .trim()
    .split(",")
    .map((seg) =>
      seg
        .split("/")
        .map((x) => x.trim())
        .filter(Boolean)
    )
    .filter((arr) => arr.length > 0)
    .map((arr) => ({ types: arr }));

  if (!rows.length && ensureOneWhenEmpty) {
    return appendBlank ? [{ types: [] }, { types: [] }] : [{ types: [] }];
  }
  return appendBlank ? rows.concat([{ types: [] }]) : rows;
}

/** 将逗号分隔的单位串拆成数组（保留空占位） */
function splitUnits(s?: string): string[] {
  if (s === undefined || s === null) return [];
  return (
    String(s)
      .split(",")
      .map((x) => x.trim())
      // 重要：保留空字符串以对齐
      .map((x) => (x === undefined ? "" : x))
  );
}

/** 将每行的 unit 收集为逗号分隔串（空也要占位） */
function joinUnits(rows: { unit?: string }[] | undefined): string {
  if (!rows || rows.length === 0) return "";
  return rows
    .map((r) => (r.unit !== undefined ? String(r.unit).trim() : ""))
    .join(",");
}

const AddModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  type,
  updateValue,
}) => {
  const [form] = Form.useForm();
  const [state, setState] = useSetState<any>({
    confirmLoading: false,
    equipTypeList: [] as any[],
    unitList: [],
  });
  const { confirmLoading, equipTypeList, unitList } = state;

  const fetchTypeData = async () => {
    try {
      const { code, data } = await getCmdTreeList();
      if (code !== 0) {
        setState({ equipTypeList: [] });
        return;
      }
      const topLevel = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
      }));
      setState({ equipTypeList: topLevel });
    } catch {
      setState({ equipTypeList: [] });
    }
  };

  useEffect(() => {
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, type, updateValue]);
  const getUnitList = async () => {
    try {
      const { code, data, message: msg } = await getUnits();
      if (code !== 0) {
        message.error("获取单位列表失败");
        setState({
          unitList: [],
        });
        throw new Error("获取单位列表失败");
      }

      setState({
        unitList: data?.unit || [],
      });
    } catch (e) {
      setState({
        unitList: [],
      });
    }
  };
  const initData = async () => {
    if (!open) return;
    form.resetFields();
    await getUnitList();
    await fetchTypeData();

    if (type === "edit") {
      const legacy = updateValue || {};

      const inTypeRows = decodeCompact(legacy?.Inpara_type, {
        ensureOneWhenEmpty: true,
        appendBlank: false,
      });
      const outTypeRows = decodeCompact(legacy?.outpara_type, {
        ensureOneWhenEmpty: true,
        appendBlank: false,
      });

      const inUnits = splitUnits(legacy?.Inpara_unit);
      const outUnits = splitUnits(legacy?.outpara_unit);

      const inRows = inTypeRows.map((r, i) => ({
        ...r,
        unit: inUnits[i] ?? "",
      }));
      const outRows = outTypeRows.map((r, i) => ({
        ...r,
        unit: outUnits[i] ?? "",
      }));

      form.setFieldsValue({
        ...legacy,
        device_type: {
          label: legacy?.device_type ?? "",
          value: legacy?.group_id ?? "",
        },
        inTypeRows: inRows,
        outTypeRows: outRows,
      });
    } else {
      form.setFieldsValue({
        inTypeRows: [{ types: [], unit: undefined }],
        outTypeRows: [{ types: [], unit: undefined }],
      });
    }
  };
  const validateParams = (
    rows: { types: any[]; unit?: string }[],
    label: string
  ) => {
    // 规则1：若某行单位有值，则该行必须选择类型
    for (const [i, row] of rows.entries()) {
      if (row.unit && (!row.types || row.types.length === 0)) {
        message.error(`${label} 第${i + 1}行选择了单位但未选择类型`);
        return;
      }
    }

    // 规则2：当行数 > 1 时，每一行都必须选择类型（为空则禁止提交）
    if (rows.length > 1) {
      for (const [i, row] of rows.entries()) {
        if (!row.types || row.types.length === 0) {
          message.error(
            `${label} 第${i + 1}行未选择类型（存在多行时每行必选）`
          );
          return;
        }
      }
    }
  };
  const handleOk = async () => {
    const values = await form.validateFields();

    const inTypeRows = (values.inTypeRows || []) as {
      types: any[];
      unit?: string;
    }[];
    const outTypeRows = (values.outTypeRows || []) as {
      types: any[];
      unit?: string;
    }[];

    try {
      validateParams(inTypeRows, "输入参数");
      validateParams(outTypeRows, "输出参数");
    } catch (err: any) {
      message.error(err.message);
      return;
    }

    const inCompact = encodeCompact(inTypeRows);
    const outCompact = encodeCompact(outTypeRows);

    const inUnits = joinUnits(inTypeRows);
    const outUnits = joinUnits(outTypeRows);

    const dt = values.device_type;

    const payload = {
      ...values,
      device_type: dt?.label ?? "",
      device_type_id: dt?.value ?? "",
      inTypeRows: undefined,
      outTypeRows: undefined,
      Inpara_type: inCompact || undefined,
      outpara_type: outCompact || undefined,
      Inpara_unit: inUnits || "",
      outpara_unit: outUnits || "",
    };

    try {
      setState({ confirmLoading: true });
      const api = type === "add" ? createOne : updateOne;
      const { code, message: msg } = await api(payload);
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");
      onOk?.(values);
    } finally {
      setState({ confirmLoading: false });
    }
  };

  return (
    <Modal
      title={type === "add" ? "新建命令" : "编辑命令"}
      maskClosable={false}
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel?.();
      }}
      destroyOnHidden
      afterClose={() => form.resetFields()}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form
        {...layout}
        form={form}
        initialValues={{
          inTypeRows: [{ types: [], unit: undefined }],
          outTypeRows: [{ types: [], unit: undefined }],
          active: 1,
        }}
      >
        {/* ---------- 基础信息 ---------- */}
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Form.Item
              name="testcommand"
              label="命令名称"
              rules={[{ required: true, message: "请输入命令名称" }]}
            >
              <Input placeholder="输入命令名称" allowClear />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="command_id" label="命令ID">
              <Input placeholder="系统自动分配" disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Form.Item
              name="device_type"
              label="所属设备类型"
              rules={[{ required: true, message: "请选择所属设备类型" }]}
            >
              <Select
                showSearch
                optionFilterProp="children"
                labelInValue
                placeholder="选择所属设备类型"
                allowClear
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {equipTypeList.map((item: any) => (
                  <Option value={item.id} key={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="active"
              label="是否激活"
              rules={[{ required: true, message: "请选择是否激活" }]}
            >
              <Select placeholder="选择是否激活" allowClear>
                <Option value={1}>✓</Option>
                <Option value={0}>✗</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* ---------- 输入参数 ---------- */}
        <Divider size="small" style={{ fontSize: 12, color: "#999" }}>
          输入参数
        </Divider>

        <Row gutter={[24, 8]} align="stretch">
          <Col span={24}>
            <Space align="center" style={{ marginBottom: 8 }}>
              <label
                style={{
                  fontSize: 14,
                  color: "rgba(0,0,0,0.88)",
                  fontWeight: 500,
                }}
              >
                输入参数类型 / 单位
              </label>
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() => {
                  const list = form.getFieldValue("inTypeRows") || [];
                  form.setFieldsValue({
                    inTypeRows: [...list, { types: [], unit: "" }],
                  });
                }}
              >
                新增
              </Button>
            </Space>

            <Form.List name="inTypeRows">
              {(fields, { remove }) => (
                <>
                  {fields.map(({ key, name }, _, allFields) => (
                    <Row
                      key={key}
                      gutter={[12, 0]}
                      align="middle"
                      style={{ marginBottom: 12 }}
                    >
                      <Col flex="auto" style={{ display: "flex", gap: 12 }}>
                        <Form.Item
                          name={[name, "types"]}
                          style={{ flex: 1, marginBottom: 0 }}
                        >
                          <Select
                            mode="multiple"
                            placeholder="选择输入类型"
                            allowClear
                            options={[
                              ...outAndInParams,
                              {
                                label: "44:Operator",
                                value: "44",
                              },
                            ]}
                          />
                        </Form.Item>
                        <Form.Item
                          name={[name, "unit"]}
                          style={{ width: 220, marginBottom: 0 }}
                        >
                          <Select
                            placeholder="选择输入单位"
                            allowClear
                            showSearch
                            filterOption={(input, option) =>
                              (option?.children as unknown as string)
                                ?.toLowerCase()
                                .includes(input.toLowerCase())
                            }
                          >
                            {unitList.length > 0 &&
                              unitList.map((item: any) => (
                                <Option value={item} key={item}>
                                  {item}
                                </Option>
                              ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col
                        flex="40px"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                        }}
                      >
                        {allFields.length > 1 && (
                          <Button
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                            aria-label="删除输入类型行"
                            title="删除输入类型行"
                          />
                        )}
                      </Col>
                    </Row>
                  ))}
                </>
              )}
            </Form.List>
          </Col>
        </Row>

        {/* ---------- 输出参数 ---------- */}
        <Divider size="small" style={{ fontSize: 12, color: "#999" }}>
          输出参数
        </Divider>

        <Row gutter={[24, 8]} align="stretch">
          <Col span={24}>
            <Space align="center" style={{ marginBottom: 8 }}>
              <label
                style={{
                  fontSize: 14,
                  color: "rgba(0,0,0,0.88)",
                  fontWeight: 500,
                }}
              >
                输出参数类型 / 单位
              </label>
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() => {
                  const list = form.getFieldValue("outTypeRows") || [];
                  form.setFieldsValue({
                    outTypeRows: [...list, { types: [], unit: "" }],
                  });
                }}
              >
                新增
              </Button>
            </Space>

            <Form.List name="outTypeRows">
              {(fields, { remove }) => (
                <>
                  {fields.map(({ key, name }, _, allFields) => (
                    <Row
                      key={key}
                      gutter={[12, 0]}
                      align="middle"
                      style={{ marginBottom: 12 }}
                    >
                      <Col flex="auto" style={{ display: "flex", gap: 12 }}>
                        <Form.Item
                          name={[name, "types"]}
                          style={{ flex: 1, marginBottom: 0 }}
                        >
                          <Select
                            mode="multiple"
                            placeholder="选择输出类型"
                            allowClear
                            options={outAndInParams}
                          />
                        </Form.Item>
                        <Form.Item
                          name={[name, "unit"]}
                          style={{ width: 220, marginBottom: 0 }}
                        >
                          <Select
                            placeholder="选择输出单位"
                            allowClear
                            showSearch
                            filterOption={(input, option) =>
                              (option?.children as unknown as string)
                                ?.toLowerCase()
                                .includes(input.toLowerCase())
                            }
                          >
                            {unitList.length > 0 &&
                              unitList.map((item: any) => (
                                <Option value={item} key={item}>
                                  {item}
                                </Option>
                              ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col
                        flex="40px"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                        }}
                      >
                        {allFields.length > 1 && (
                          <Button
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                            aria-label="删除输出类型行"
                            title="删除输出类型行"
                          />
                        )}
                      </Col>
                    </Row>
                  ))}
                </>
              )}
            </Form.List>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Form.Item
              name="description"
              label="描述"
              rules={[{ required: true, message: "请输入描述" }]}
            >
              <Input.TextArea rows={4} placeholder="输入任务描述" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddModal;
