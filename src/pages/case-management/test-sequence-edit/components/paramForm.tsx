import {
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
  conditionType?: string; // "test_condition" | "test_result" | "temporary_variable" | "label" | "operator" | "Constant"
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
  { label: "标签", value: "label" },
  { label: "操作符", value: "operator" },
  { label: "常量", value: "Constant" },
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

  const [dataSource, setDataSource] = useState<
    Array<
      ParamItem & {
        allowedTypeKeys?: CanonicalKey[];
        optionsByType?: Record<string, { label: string; value: string }[]>;
      }
    >
  >(initialData || []);

  // 将后端 para 行转为前端行（key 与后端一致）
  const mapBackendParaToRow = (para: any, index: number) => {
    const allowedTypeKeys: CanonicalKey[] = uniq(
      (Array.isArray(para.paratype) ? para.paratype : []) as CanonicalKey[]
    );

    // 为每个允许的类型收集候选（若该类型需要下拉），并清洗空值
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
    if (allowedTypeKeys.includes("label")) {
      const arr = cleanArray(uniq(Array.isArray(para.label) ? para.label : []));
      optionsByType["label"] = arr.map((t: string) => ({ label: t, value: t }));
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
      if (!updateValue?.testcommand) {
        message.warning("缺少命令参数");
        return;
      }
      const { code, data, message: msg } = await ApiFn("IF_THEN"); //updateValue.testcommand

      if (code !== 0) {
        message.error(msg || "获取参数失败");
        onCancel?.();
        return;
      }

      const list = Array.isArray(data?.para_list) ? data.para_list : [];
      const rows = list.map((p: any, idx: number) =>
        mapBackendParaToRow(p, idx)
      );

      setDataSource(rows);

      // 表单数组与行数对齐
      form.setFieldsValue({
        params: rows.map((row) => ({
          conditionType: row.conditionType,
        })),
      });

      setRefreshKey((k) => k + 1);
    } catch (e) {
      onCancel?.();
    }
  };

  useEffect(() => {
    if (open) {
      initData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, updateValue?.testcommand, type]);

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
            constantType: value === "Constant" ? item.constantType : undefined,
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
        value === "Constant" ? current.params[index]?.constantType : undefined,
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
        <div style={{ color: "#6c757d", fontSize: 12 }}>请选择上面的类型</div>
      );
    }

    if (k === "Constant") {
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
          if (record.conditionType === "Constant") {
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
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        // 按行顺序提取 value
        const rawList = dataSource.map((item, index) => {
          const v = values?.params?.[index]?.value ?? item.value;
          // null / undefined 转为空字符串，但不丢失位置
          return v != null ? String(v).trim() : "";
        });

        // 不过滤空值，保持位置一致
        const finalString = rawList.join(",");

        console.log("finalString:", finalString);
        return;
        // 返回字符串和原始数组
        onOk?.({ finalString, rawList });
      })
      .catch((errorInfo) => {
        console.error("表单验证失败:", errorInfo);
      });
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
      destroyOnClose
      title={type === "INPUT" ? "输入参数" : "输出参数"}
      width={900}
      okText="确定"
      cancelText="取消"
      styles={{
        body: {
          maxHeight: "70vh",
          overflow: "auto",
          padding: "16px 24px",
        },
      }}
    >
      <Form form={form} layout="vertical" size="small">
        <Table
          key={refreshKey}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          size="small"
          rowKey="id"
          bordered
          style={{ marginBottom: 0 }}
        />
      </Form>
    </Modal>
  );
};

export default ParamForm;
