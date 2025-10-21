import { getInstrumentType } from "@/services/equipment-management/equipment-library-edit.service";
import {
  createOne,
  updateOne,
} from "@/services/system-management/command-management.service";
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
import { outAndInParams, paramUnits } from "../schemas";

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
    .filter((seg) => seg !== ""); // 忽略空行
  return rowStrs.join(",");
}

/** 解码（带选项）：
 * - ensureOneWhenEmpty: 当原串为空时是否至少返回一空行（默认 true）
 * - appendBlank: 是否总在末尾追加一行空行（默认 false；编辑态禁用，新增态如需可启用）
 * 例："1/2,11" -> [{types:['1','2']},{types:['11']}]
 */
function decodeCompact(
  s?: string,
  opts: { ensureOneWhenEmpty?: boolean; appendBlank?: boolean } = {
    ensureOneWhenEmpty: true,
    appendBlank: false,
  }
): { types: string[] }[] {
  const ensureOneWhenEmpty =
    opts.ensureOneWhenEmpty === undefined ? true : opts.ensureOneWhenEmpty;
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
    equipTypeList: [],
  });
  const { confirmLoading, equipTypeList } = state;

  // const initData = useCallback(() => {
  //   if (!open) return;
  //   form.resetFields();

  //   if (type === "edit") {
  //     const legacy = updateValue || {};
  //     // 编辑态：不追加空行
  //     const inRows = decodeCompact(legacy?.Inpara_type, {
  //       ensureOneWhenEmpty: true,
  //       appendBlank: false,
  //     });
  //     const outRows = decodeCompact(legacy?.outpara_type, {
  //       ensureOneWhenEmpty: true,
  //       appendBlank: false,
  //     });

  //     form.setFieldsValue({
  //       ...legacy,
  //       inTypeRows: inRows,
  //       outTypeRows: outRows,
  //       Inpara_uint: legacy?.Inpara_uint,
  //       outpara_uint: legacy?.outpara_uint,
  //     });
  //   }
  // }, [open, type, updateValue, form]);

  const fetchTypeData: any = async () => {
    try {
      const { code, data } = await getInstrumentType({ route: 1 });
      if (code !== 0) {
        setState({ equipTypeList: [] });
        return;
      }
      console.log("data?.list_info ", data?.list_info);

      setState({ equipTypeList: data?.list_info || [] });
    } catch {
      setState({ equipTypeList: [] });
    }
  };

  useEffect(() => {
    initData();
  }, [open, type, updateValue]);
  const initData = async () => {
    if (!open) return;
    form.resetFields();
    await fetchTypeData();
    if (type === "edit") {
      const legacy = updateValue || {};
      // 编辑态：不追加空行
      const inRows = decodeCompact(legacy?.Inpara_type, {
        ensureOneWhenEmpty: true,
        appendBlank: false,
      });
      const outRows = decodeCompact(legacy?.outpara_type, {
        ensureOneWhenEmpty: true,
        appendBlank: false,
      });

      form.setFieldsValue({
        ...legacy,
        inTypeRows: inRows,
        outTypeRows: outRows,
        Inpara_uint: legacy?.Inpara_uint,
        outpara_uint: legacy?.outpara_uint,
      });
    }
  };
  // useEffect(() => {
  //   initData();
  // }, [initData]);

  const handleOk = async () => {
    // 严格校验（如要无校验可改 getFieldsValue）
    const values = await form.validateFields();
    const inTypeRows = values.inTypeRows || [];
    const outTypeRows = values.outTypeRows || [];
    const inCompact = encodeCompact(inTypeRows); // "1/2,11" 或 ""
    const outCompact = encodeCompact(outTypeRows); // "1" 或 ""

    const payload = {
      ...values,
      device_type: values.device_type.label || "",
      device_type_id: values.device_type.value || "",
      // 只传后端需要的字段
      inTypeRows: undefined,
      outTypeRows: undefined,
      Inpara_type: inCompact || undefined,
      outpara_type: outCompact || undefined,
    };
    console.log("payload", payload);

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
      destroyOnClose
      afterClose={() => form.resetFields()}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form
        {...layout}
        form={form}
        name="control-hooks"
        // 新建态：给 1 行空行即可；不额外 append 空行，避免视觉上的“多一个”
        initialValues={{
          inTypeRows: [{ types: [] }],
          outTypeRows: [{ types: [] }],
          active: 1,
          Inpara_uint: undefined,
          outpara_uint: undefined,
        }}
      >
        {/* ---------- 基础信息（你原本的必填保持不变） ---------- */}
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
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                labelInValue
                placeholder="选择所属设备类型"
                allowClear
              >
                {equipTypeList.map((item: any) => (
                  <Option value={item.group_id} key={item.group_id}>
                    {item.group_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          {/* <Col span={12}>
            <Form.Item name="group_id" label="所属设备类型编码">
              <Input placeholder="系统自动分配" disabled />
            </Form.Item>
          </Col> */}
          <Col span={12}>
            <Form.Item
              name="active"
              label="是否激活"
              rules={[{ required: true, message: "请选择是否激活" }]}
              initialValue={1}
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

        <Row gutter={[24, 8]}>
          {/* 左：输入类型（多行 + 每行多选；非必填） */}
          <Col span={16}>
            <Space align="center" style={{ marginBottom: 8 }}>
              <label
                style={{
                  fontSize: 14,
                  color: "rgba(0,0,0,0.88)",
                  fontWeight: 500,
                }}
              >
                输入参数类型
              </label>
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() => {
                  const list = form.getFieldValue("inTypeRows") || [];
                  form.setFieldsValue({ inTypeRows: [...list, { types: [] }] });
                }}
              >
                新增
              </Button>
            </Space>

            <Form.List name="inTypeRows">
              {(fields, { remove }) => (
                <>
                  {fields.map((field, _, allFields) => (
                    <Row
                      key={field.key}
                      gutter={[12, 0]}
                      align="middle"
                      style={{ marginBottom: 12 }} // ✅ 每行间距
                    >
                      <Col
                        flex="auto"
                        style={{ display: "flex", alignItems: "center" }} // ✅ 行内垂直居中
                      >
                        <Form.Item
                          {...field}
                          name={[field.name, "types"]}
                          fieldKey={[field.fieldKey!, "types"]}
                          style={{ flex: 1, marginBottom: 0 }} // ✅ 去掉 Form.Item 默认底边距
                          rules={[]}
                        >
                          <Select
                            mode="multiple"
                            placeholder="选择一个或多个输入类型（同一行用“/”拼接）"
                            allowClear
                            options={outAndInParams}
                          />
                        </Form.Item>
                      </Col>
                      <Col
                        flex="40px"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                        }} // ✅ 删除按钮与 Select 垂直居中
                      >
                        {allFields.length > 1 && (
                          <Button
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => remove(field.name)}
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

          {/* 右：输入单位（非必填、与类型无关联） */}
          <Col span={8}>
            <Form.Item label="输入参数单位" name="Inpara_uint" rules={[]}>
              <Select
                placeholder="选择输入参数单位"
                allowClear
                options={paramUnits}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* ---------- 输出参数 ---------- */}
        <Divider size="small" style={{ fontSize: 12, color: "#999" }}>
          输出参数
        </Divider>

        <Row gutter={[24, 8]}>
          {/* 左：输出类型（多行 + 每行多选；非必填） */}
          <Col span={16}>
            <Space align="center" style={{ marginBottom: 8 }}>
              <label
                style={{
                  fontSize: 14,
                  color: "rgba(0,0,0,0.88)",
                  fontWeight: 500,
                }}
              >
                输出参数类型
              </label>
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() => {
                  const list = form.getFieldValue("outTypeRows") || [];
                  form.setFieldsValue({
                    outTypeRows: [...list, { types: [] }],
                  });
                }}
              >
                新增
              </Button>
            </Space>
            <Form.List name="outTypeRows">
              {(fields, { remove }) => (
                <>
                  {fields.map((field, _, allFields) => (
                    <Row
                      key={field.key}
                      gutter={[12, 0]}
                      align="middle"
                      style={{ marginBottom: 12 }} // 每行之间的垂直间距
                    >
                      <Col
                        flex="auto"
                        style={{ display: "flex", alignItems: "center" }} // 行内垂直居中
                      >
                        <Form.Item
                          {...field}
                          name={[field.name, "types"]}
                          fieldKey={[field.fieldKey!, "types"]}
                          style={{ flex: 1, marginBottom: 0 }} // 去掉默认底边距
                          rules={[]}
                        >
                          <Select
                            mode="multiple"
                            placeholder="选择一个或多个输出类型（同一行用“/”拼接）"
                            allowClear
                            options={outAndInParams}
                          />
                        </Form.Item>
                      </Col>
                      <Col
                        flex="40px"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                        }} // 删除按钮与 Select 垂直居中
                      >
                        {allFields.length > 1 && (
                          <Button
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => remove(field.name)}
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

          {/* 右：输出单位（非必填、与类型无关联） */}
          <Col span={8}>
            <Form.Item label="输出参数单位" name="outpara_uint" rules={[]}>
              <Select
                placeholder="选择输出参数单位"
                allowClear
                options={paramUnits}
              />
            </Form.Item>
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
