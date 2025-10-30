import {
  editInPara,
  editOutPara,
  getInParaList,
  getOutParaList,
} from "@/services/case-management/test-sequence-edit.service";
import { Form, Input, message, Modal, Select, Table } from "antd";
import React, { useEffect, useMemo, useState } from "react";

interface ParamItem {
  id: string;
  name: string;
  unit: string;
  type: string;
  type1?: string;
  conditionType?: string; // 选中的大类：test_result / ... / contants
  constantType?: string; // 当 conditionType === 'contants' 时的子类型：int / Float / ...
  value?: any; // 显示/提交的值
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
const cleanArray = (arr: any[]) =>
  Array.isArray(arr)
    ? arr.filter((v) => v != null && String(v).trim() !== "")
    : [];

// 规范化常量子类型，兼容大小写/别名
const normalizeConstantType = (t?: string) => {
  const k = (t ?? "").trim().toLowerCase();
  switch (k) {
    case "int":
      return "int";
    case "float":
      return "Float";
    case "byte":
      return "Byte";
    case "hexstring":
      return "HexString";
    case "string":
      return "String";
    default:
      return t || "";
  }
};

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
  const [hasParams, setHasParams] = useState(true);

  // 根据值，优先匹配非 contants 的类型
  const autoPickTypeForValue = (
    row: ParamItem & {
      allowedTypeKeys?: CanonicalKey[];
      optionsByType?: Record<string, { label: string; value: string }[]>;
    },
    value: string | undefined
  ): { conditionType?: CanonicalKey; value?: any } => {
    const v = value == null ? "" : String(value);
    const allowed = row.allowedTypeKeys || [];

    for (const key of allowed) {
      if (key === "contants") continue;
      const opts = row.optionsByType?.[key] || [];
      if (opts.some((o) => o.value === v)) {
        return { conditionType: key, value: v };
      }
    }
    // 匹配不上时不决定为 contants，交由外层根据是否允许 contants 决定
    return { value: v };
  };

  // 把后端 para 映射为行
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

    // 每行自己的 contants 提示（如 ["int"]）
    const rowConstantHint = normalizeConstantType(
      Array.isArray(para.contants) ? para.contants[0] : undefined
    );

    const defaultConditionType =
      allowedTypeKeys.length === 1 ? allowedTypeKeys[0] : undefined;

    return {
      id: String(para.para_id),
      name: `param${index + 1}`,
      unit: para.para_unit || "",
      type: "",
      value: undefined,
      conditionType: defaultConditionType,
      constantType: rowConstantHint || undefined, // 仅作默认保存；是否显示由 conditionType 决定
      allowedTypeKeys,
      optionsByType,
    };
  };

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

      const rawParamsStr = String(updateValue?.[needKey] ?? "");
      const fromServerValues = rawParamsStr.split(",");

      const formParams: any[] = [];
      const filledRows = rows.map((row, idx) => {
        const raw = fromServerValues[idx] ?? "";
        const v = String(raw);

        // 先试图匹配非 contants 的类型
        const picked = autoPickTypeForValue(row, v);
        let nextRow = {
          ...row,
          conditionType: picked.conditionType ?? row.conditionType,
          value: picked.value ?? v,
        };

        // 如果未匹配到非 contants，且允许 contants，则选择 contants 并回显常量类型为该行后端提示
        if (
          !picked.conditionType &&
          nextRow.allowedTypeKeys?.includes("contants")
        ) {
          nextRow.conditionType = "contants";
          // 行级后端 hint 已在 map 时放入了 row.constantType
        }

        formParams.push({
          conditionType: nextRow.conditionType,
          value: nextRow.value,
          constantType:
            nextRow.conditionType === "contants"
              ? nextRow.constantType
              : undefined,
        });

        return nextRow;
      });

      setDataSource(filledRows);
      form.setFieldsValue({ params: formParams });
      setRefreshKey((k) => k + 1);
      setHasParams(filledRows.length > 0);
    } catch (e) {
      onCancel?.();
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (open) {
      setHasParams(true); // 初始先允许
      initData();
    }
  }, [
    open,
    updateValue?.testcommand,
    type,
    updateValue?.inputparams,
    updateValue?.outputparams,
  ]);

  // 切到 contants 时保留当前 constantType；切走则清空
  const handleTypeChange = (
    value: string,
    record: ParamItem,
    index: number
  ) => {
    const keepConstant =
      value === "contants" ? dataSource[index]?.constantType : undefined;

    const newDataSource = dataSource.map((item, i) =>
      i === index
        ? {
            ...item,
            conditionType: value,
            value: undefined,
            constantType: keepConstant,
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
      value: undefined,
      constantType: keepConstant,
    };
    form.setFieldsValue(current);
    setRefreshKey((prev) => prev + 1);
  };

  const handleConstantTypeChange = (
    value: string,
    record: ParamItem,
    index: number
  ) => {
    const newDataSource = dataSource.map((item, i) =>
      i === index ? { ...item, constantType: value } : item
    );
    setDataSource(newDataSource);

    const current = form.getFieldsValue();
    if (!current.params) current.params = dataSource.map(() => ({}));
    while (current.params.length <= index) current.params.push({});
    current.params[index] = { ...current.params[index], constantType: value };
    form.setFieldsValue(current);
  };

  const handleValueChange = (value: any, record: ParamItem, index: number) => {
    const newDataSource = dataSource.map((item, i) =>
      i === index ? { ...item, value } : item
    );
    setDataSource(newDataSource);
  };

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

  const renderInputComponent = (item: any, index: number) => {
    const k = item.conditionType as CanonicalKey | undefined;
    if (!k)
      return (
        <div style={{ color: "#6c757d", fontSize: 12 }}>
          请先选择符合要求的参数列表
        </div>
      );

    if (k === "contants") {
      return (
        <Form.Item name={["params", index, "value"]} noStyle>
          <Input
            placeholder="请输入常量值"
            style={{ width: "100%" }}
            size="small"
            onChange={(e) => handleValueChange(e.target.value, item, index)}
          />
        </Form.Item>
      );
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
          />
        </Form.Item>
      );
    }
    return (
      <div style={{ color: "#6c757d", fontSize: 12 }}>当前类型暂无候选值</div>
    );
  };

  const getColumns = () => {
    const hasConstantType = dataSource.some((row) =>
      row.allowedTypeKeys?.includes("contants")
    );
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

    if (hasConstantType) {
      baseColumns.push({
        title: "常量类型",
        dataIndex: "constantType",
        width: 140,
        render: (_: string, record: ParamItem & any, index: number) => {
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

  const handleOk = async () => {
    const values = await form.validateFields();
    try {
      // 值数组（与行顺序一致）
      const rawList = dataSource.map((item, index) => {
        const v = values?.params?.[index]?.value ?? item.value;
        return v != null ? String(v).trim() : "";
      });

      // 仅当选择了 contants 时，保存常量类型；否则为空串
      const inputparamstype: string[] = dataSource.map((item, index) => {
        const chosenType =
          values?.params?.[index]?.conditionType ?? item.conditionType;
        if (chosenType === "contants") {
          const ct = values?.params?.[index]?.constantType ?? item.constantType;
          return ct ? String(ct) : "";
        }
        return "";
      });

      const finalString = rawList.join(",");

      const params: any = {
        seq_id: updateValue.seq_id,
        testcommand: updateValue.testcommand,
        inputparams: type === "INPUT" ? finalString : undefined,
        outputparams: type === "OUTPUT" ? finalString : undefined,
        inputparamstype: type === "INPUT" ? inputparamstype : undefined,
      };

      setConfirmLoading(true);
      const ApiFn = type === "INPUT" ? editInPara : editOutPara;
      const { code, message: msg } = await ApiFn(params);
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");
      onOk?.({ finalString, rawList, inputparamstype });
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
      okButtonProps={{ disabled: fetching || !hasParams }}
      maskClosable={!fetching}
      closable={!fetching}
      styles={{
        body: { maxHeight: "70vh", overflow: "auto", padding: "16px 24px" },
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
