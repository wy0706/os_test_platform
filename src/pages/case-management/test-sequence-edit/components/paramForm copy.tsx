import {
  editInPara,
  editOutPara,
  getInParaList,
  getOutParaList,
} from "@/services/case-management/test-sequence-edit.service";
import { Form, Input, InputNumber, message, Modal, Select, Table } from "antd";
import React, { useEffect, useMemo, useState } from "react";

interface ParamItem {
  id: string;
  name: string;
  unit: string;
  type: string;
  type1?: string;
  // 与后端保持一致的 key
  conditionType?: string; // "test_condition" | "test_result" | "temporary_variable" | "Label" | "operator" | "contants"
  constantType?: string; // "int" | "Float" | "Byte" | "HexString" | "String"
  value?: any;
}

interface ParamFormProps {
  type?: "INPUT" | "OUTPUT";
  open?: boolean;
  onCancel?: () => void;
  onOk?: (values: any) => void;
  initialData?: ParamItem[];
  updateValue: any;
}

const constantTypeOptions = [
  { value: "int", label: "整数" },
  { value: "Float", label: "双精度型" },
  { value: "Byte", label: "字节型" },
  { value: "HexString", label: "十六进制字符" },
  { value: "String", label: "字符型" },
];

const allOptions = [
  { label: "测试结果", value: "test_result" },
  { label: "测试条件", value: "test_condition" },
  { label: "临时变量", value: "temporary_variable" },
  { label: "标签", value: "Label" },
  { label: "操作符", value: "operator" },
  { label: "常量", value: "contants" },
] as const;

type CanonicalKey = (typeof allOptions)[number]["value"];

const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));
// 过滤 null / undefined / '' / 仅空格
const cleanArray = (arr: any[]) =>
  Array.isArray(arr)
    ? arr.filter((v) => v != null && String(v).trim() !== "")
    : [];

const ParamForm: React.FC<ParamFormProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
  type,
  updateValue,
}) => {
  const [form] = Form.useForm();
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [dataSource, setDataSource] = useState<
    Array<
      ParamItem & {
        allowedTypeKeys?: CanonicalKey[];
        optionsByType?: Record<string, { label: string; value: string }[]>;
      }
    >
  >(initialData || []);

  // ---------- 辅助：根据字符串值推断常量类型 ----------
  const inferConstantType = (raw: any): ParamItem["constantType"] => {
    const v = String(raw ?? "").trim();
    if (v === "") return undefined;
    if (/^[-+]?\d+$/.test(v)) {
      // 整数：在 Byte 范围内优先认为 Byte（若需要与后端规则保持一致可调整）
      const n = Number(v);
      if (n >= 0 && n <= 255) return "Byte";
      return "int";
    }
    if (/^[-+]?\d*\.\d+(e[-+]?\d+)?$/i.test(v)) return "Float";
    if (/^(?:0x)?[0-9A-Fa-f\s,]+$/.test(v)) return "HexString";
    return "String";
  };

  // ---------- 辅助：根据候选匹配自动选择类型 ----------
  const autoPickTypeForValue = (
    row: ParamItem & {
      allowedTypeKeys?: CanonicalKey[];
      optionsByType?: Record<string, { label: string; value: string }[]>;
    },
    value: string | undefined
  ): {
    conditionType?: CanonicalKey;
    constantType?: ParamItem["constantType"];
    value?: any;
  } => {
    const v = value == null ? "" : String(value);
    const allowed = row.allowedTypeKeys || [];

    // 1) 先在非 contants 的候选里精准匹配（全等匹配）
    for (const key of allowed) {
      if (key === "contants") continue;
      const opts = row.optionsByType?.[key] || [];
      if (opts.some((o) => o.value === v)) {
        return { conditionType: key, value: v };
      }
    }

    // 2) 若允许 Constant，则按规则推断常量类型
    if (allowed.includes("contants")) {
      const ct = inferConstantType(v);
      return { conditionType: "contants", constantType: ct, value: v };
    }

    // 3) 否则不设置类型，仅带值（交给用户自行选择）
    return { value: v };
  };

  // 将后端 para 行转为前端行（key 与后端一致）
  const mapBackendParaToRow = (para: any, index: number) => {
    const allowedTypeKeys: CanonicalKey[] = uniq(
      (Array.isArray(para.paratype) ? para.paratype : []) as CanonicalKey[]
    );

    const optionsByType: Record<string, { label: string; value: string }[]> =
      {};

    if (allowedTypeKeys.includes("test_condition")) {
      const arr = cleanArray(
        uniq(Array.isArray(para.test_condition) ? para.test_condition : [])
      );
      optionsByType["test_condition"] = arr.map((t: string) => ({
        label: t,
        value: t,
      }));
    }
    if (allowedTypeKeys.includes("temporary_variable")) {
      const arr = cleanArray(
        uniq(
          Array.isArray(para.temporary_variable) ? para.temporary_variable : []
        )
      );
      optionsByType["temporary_variable"] = arr.map((t: string) => ({
        label: t,
        value: t,
      }));
    }
    if (allowedTypeKeys.includes("test_result")) {
      const arr = cleanArray(
        uniq(Array.isArray(para.test_result) ? para.test_result : [])
      );
      optionsByType["test_result"] = arr.map((t: string) => ({
        label: t,
        value: t,
      }));
    }
    if (allowedTypeKeys.includes("Label")) {
      const arr = cleanArray(uniq(Array.isArray(para.Label) ? para.Label : []));
      optionsByType["Label"] = arr.map((t: string) => ({ label: t, value: t }));
    }
    if (allowedTypeKeys.includes("operator")) {
      const arr = cleanArray(
        uniq(Array.isArray(para.operator) ? para.operator : [])
      );
      optionsByType["operator"] = arr.map((t: string) => ({
        label: t,
        value: t,
      }));
    }

    // 如果这一行只允许一个类型，可选：默认选中它以减少一次点击
    const defaultConditionType =
      allowedTypeKeys.length === 1 ? allowedTypeKeys[0] : undefined;

    return {
      id: String(para.para_id),
      name: `param${index + 1}`,
      unit: para.para_unit || "",
      type: "",
      value: undefined,
      conditionType: defaultConditionType,
      constantType: undefined,
      allowedTypeKeys,
      optionsByType,
    } as ParamItem & {
      allowedTypeKeys: CanonicalKey[];
      optionsByType: Record<string, { label: string; value: string }[]>;
    };
  };

  // 初始化数据
  const initData = async () => {
    if (!open) return;
    form?.resetFields();

    const ApiFn = type === "INPUT" ? getInParaList : getOutParaList;

    try {
      const needKey = type === "INPUT" ? "inputparams" : "outputparams";
      if (!updateValue?.testcommand) {
        message.warning("缺少命令参数");
        return;
      }

      setFetching(true);
      const { code, data, message: msg } = await ApiFn(updateValue.testcommand);

      if (code !== 0) {
        message.error(msg || "获取参数失败");
        onCancel?.();
        return;
      }

      const list = Array.isArray(data?.para_list) ? data.para_list : [];
      const rows = list.map((p: any, idx: number) =>
        mapBackendParaToRow(p, idx)
      );

      // --- 关键逻辑：解析并回显 updateValue 中的 *inputparams/outputparams* ---
      const rawParamsStr = String(updateValue?.[needKey] ?? "");
      const fromServerValues = rawParamsStr.split(","); // 保留空位

      const formParams: any[] = [];
      const filledRows = rows.map((row, idx) => {
        const raw = fromServerValues[idx] ?? ""; // 若后端字符串短于行数，补空
        const v = String(raw);
        if (v === "") {
          formParams.push({ conditionType: row.conditionType });
          return row; // 空位不改变默认类型
        }

        // 根据值自动匹配类型（先候选后常量推断）
        const picked = autoPickTypeForValue(row, v);

        const nextRow = {
          ...row,
          conditionType: picked.conditionType ?? row.conditionType,
          constantType:
            picked.conditionType === "contants"
              ? picked.constantType
              : row.constantType,
          value: picked.value ?? v,
        } as typeof row;

        formParams.push({
          conditionType: nextRow.conditionType,
          constantType: nextRow.constantType,
          value: nextRow.value,
        });
        return nextRow;
      });

      setDataSource(filledRows);

      // 表单数组与行数对齐
      form.setFieldsValue({ params: formParams });

      setRefreshKey((k) => k + 1);
    } catch (e) {
      onCancel?.();
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (open) {
      initData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    updateValue?.testcommand,
    type,
    updateValue?.inputparams,
    updateValue?.outputparams,
  ]);

  // —— 类型变化（按行独立；value 为后端一致的字符串 key）
  const handleTypeChange = (
    value: string,
    record: ParamItem,
    index: number
  ) => {
    const newDataSource = dataSource.map((item, i) =>
      i === index
        ? {
            ...item,
            conditionType: value,
            constantType: value === "contants" ? item.constantType : undefined,
            value: undefined,
          }
        : item
    );
    setDataSource(newDataSource);

    const current = form.getFieldsValue();
    if (!current.params) current.params = dataSource.map(() => ({}));
    while (current.params.length <= index) current.params.push({});

    current.params[index] = {
      ...current.params[index],
      conditionType: value,
      constantType:
        value === "contants" ? current.params[index]?.constantType : undefined,
      value: undefined,
    };
    form.setFieldsValue(current);
    setRefreshKey((prev) => prev + 1);
  };

  // —— 常量类型变化（按行独立）
  const handleConstantTypeChange = (
    value: string,
    record: ParamItem,
    index: number
  ) => {
    const newDataSource = dataSource.map((item, i) =>
      i === index ? { ...item, constantType: value, value: undefined } : item
    );
    setDataSource(newDataSource);

    const current = form.getFieldsValue();
    if (!current.params) current.params = dataSource.map(() => ({}));
    while (current.params.length <= index) current.params.push({});

    current.params[index] = {
      ...current.params[index],
      constantType: value,
      value: undefined,
    };
    form.setFieldsValue(current);
    setRefreshKey((prev) => prev + 1);
  };

  // —— 值变化（按行独立）
  const handleValueChange = (value: any, record: ParamItem, index: number) => {
    const newDataSource = dataSource.map((item, i) =>
      i === index ? { ...item, value } : item
    );
    setDataSource(newDataSource);
  };

  // 类型列：根据 allowedTypeKeys 过滤 allOptions
  const renderTypeSelect = (record: any, index: number) => {
    const allowed: string[] = record.allowedTypeKeys || [];
    const options = allOptions.filter((op) => allowed.includes(op.value));
    return (
      <Select
        value={record.conditionType}
        placeholder="选择类型"
        options={options as any}
        style={{ width: "100%" }}
        size="small"
        allowClear
        showSearch
        onChange={(value) => handleTypeChange(value, record, index)}
        filterOption={(input, option) =>
          (option?.label?.toString() ?? "")
            .toLowerCase()
            .includes(input.toLowerCase())
        }
      />
    );
  };

  // 值列：Constant → 输入；其他类型 → 若有候选就下拉，否则提示
  const renderInputComponent = (item: any, index: number) => {
    const k = item.conditionType as CanonicalKey | undefined;
    if (!k) {
      return (
        <div style={{ color: "#6c757d", fontSize: 12 }}>
          请先选择符合要求的参数列表
        </div>
      );
    }

    if (k === "contants") {
      if (!item.constantType) {
        return (
          <div style={{ color: "#6c757d", fontSize: 12 }}>请先选择常量类型</div>
        );
      }
      switch (item.constantType) {
        case "int":
          return (
            <Form.Item name={["params", index, "value"]} noStyle>
              <InputNumber
                placeholder="输入整数值"
                style={{ width: "100%" }}
                size="small"
                onChange={(value) => handleValueChange(value, item, index)}
              />
            </Form.Item>
          );
        case "Float":
          return (
            <Form.Item name={["params", index, "value"]} noStyle>
              <InputNumber
                placeholder="输入双精度值"
                step={0.01}
                style={{ width: "100%" }}
                size="small"
                onChange={(value) => handleValueChange(value, item, index)}
              />
            </Form.Item>
          );
        case "Byte":
          return (
            <Form.Item
              name={["params", index, "value"]}
              noStyle
              rules={[
                { pattern: /^[0-9]{1,3}$/, message: "请输入0-255之间的数字" },
              ]}
            >
              <InputNumber
                placeholder="输入字节值(0-255)"
                min={0}
                max={255}
                style={{ width: "100%" }}
                size="small"
                onChange={(value) => handleValueChange(value, item, index)}
              />
            </Form.Item>
          );
        case "HexString":
          return (
            <Form.Item
              name={["params", index, "value"]}
              noStyle
              rules={[
                {
                  pattern: /^[0-9A-Fa-f\s,]+$/,
                  message: "请输入有效的十六进制字符串",
                },
              ]}
            >
              <Input
                placeholder="输入十六进制字符串(如: FF, 0A, 1B)"
                style={{ width: "100%" }}
                size="small"
                onChange={(e) => handleValueChange(e.target.value, item, index)}
              />
            </Form.Item>
          );
        case "String":
          return (
            <Form.Item name={["params", index, "value"]} noStyle>
              <Input
                placeholder="输入字符串值"
                style={{ width: "100%" }}
                size="small"
                onChange={(e) => handleValueChange(e.target.value, item, index)}
              />
            </Form.Item>
          );
        default:
          return (
            <div style={{ color: "#6c757d", fontSize: 12 }}>未知的常量类型</div>
          );
      }
    }

    const opts = item.optionsByType?.[k] || [];
    if (opts.length) {
      return (
        <Form.Item name={["params", index, "value"]} noStyle>
          <Select
            placeholder="请选择"
            options={opts}
            style={{ width: "100%" }}
            size="small"
            allowClear
            showSearch
            onChange={(value) => handleValueChange(value, item, index)}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
      );
    }

    return (
      <div style={{ color: "#6c757d", fontSize: 12 }}>当前类型暂无候选值</div>
    );
  };

  // 表格列
  const getColumns = () => {
    const baseColumns: any[] = [
      {
        title: "参数名",
        dataIndex: "name",
        width: 120,
        render: (_: any, __: any, index: number) => (
          <span>param{index + 1}</span>
        ),
      },
      {
        title: "符合要求的参数列表",
        dataIndex: "type1",
        width: 180,
        render: (_: any, record: ParamItem & any, index: number) =>
          renderTypeSelect(record, index),
      },
    ];

    if (type === "INPUT") {
      baseColumns.push({
        title: "常量类型",
        dataIndex: "constantType",
        width: 140,
        render: (text: string, record: ParamItem & any, index: number) => {
          if (record.conditionType === "contants") {
            return (
              <Select
                value={record.constantType}
                placeholder="选择常量类型"
                options={constantTypeOptions}
                style={{ width: "100%" }}
                size="small"
                allowClear
                showSearch
                onChange={(value) =>
                  handleConstantTypeChange(value, record, index)
                }
                filterOption={(input, option) =>
                  (option?.label?.toString() ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            );
          }
          return <div style={{ color: "#6c757d", fontSize: 12 }}>-</div>;
        },
      });
    }

    baseColumns.push(
      {
        title: "值",
        dataIndex: "value",
        width: 260,
        render: (_: any, record: ParamItem & any, index: number) =>
          renderInputComponent(record, index),
      },
      {
        title: "参数单位",
        dataIndex: "unit",
        width: 120,
        render: (text: string) => text || "-",
      }
    );

    return baseColumns;
  };

  const columns = useMemo(() => getColumns(), [dataSource, type]);

  // 提交
  const handleOk = async () => {
    const values = await form.validateFields();

    try {
      // 按行顺序提取 value
      const rawList = dataSource.map((item, index) => {
        const v = values?.params?.[index]?.value ?? item.value;
        // null / undefined 转为空字符串，但不丢失位置
        return v != null ? String(v).trim() : "";
      });
      // 不过滤空值，保持位置一致
      const finalString = rawList.join(",");
      const params = {
        seq_id: updateValue.seq_id,
        testcommand: updateValue.testcommand,
        inputparams: type === "INPUT" ? finalString : undefined,
        outputparams: type === "OUTPUT" ? finalString : undefined,
      };
      setConfirmLoading(true);
      const ApiFn = type === "INPUT" ? editInPara : editOutPara; //editOutPara
      const { code, message: msg } = await ApiFn(params);
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");

      // 返回字符串和原始数组
      onOk?.({ finalString, rawList });
    } catch (e) {
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    form?.resetFields();
    onCancel?.();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      destroyOnHidden
      title={type === "INPUT" ? "输入参数" : "输出参数"}
      confirmLoading={confirmLoading}
      width={900}
      okText="确定"
      cancelText="取消"
      okButtonProps={{ disabled: fetching }}
      maskClosable={!fetching}
      closable={!fetching}
      styles={{
        body: {
          maxHeight: "70vh",
          overflow: "auto",
          padding: "16px 24px",
        },
      }}
    >
      <Form form={form} layout="vertical" size="small">
        <div style={{ minHeight: 120 }}>
          <Table
            key={refreshKey}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            size="small"
            rowKey="id"
            bordered
            loading={fetching}
            style={{ marginBottom: 0 }}
          />
        </div>
      </Form>
    </Modal>
  );
};

export default ParamForm;
