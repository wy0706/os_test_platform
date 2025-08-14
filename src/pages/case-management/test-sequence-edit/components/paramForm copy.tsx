import { Form, Input, InputNumber, Modal, Select } from "antd";
import React, { useEffect, useState } from "react";

const { Option } = Select;

interface ParamItem {
  id: string;
  name: string;
  unit: string;
  type: string;
  conditionType?: number; // 测试条件类型
  value?: any; // 输入的值
}

interface ParamFormProps {
  open?: boolean;
  onCancel?: () => void;
  onOk?: (values: any) => void;
  initialData?: ParamItem[];
}

const ParamForm: React.FC<ParamFormProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
}) => {
  const [form] = Form.useForm();
  const [refreshKey, setRefreshKey] = useState(0); // 用于强制重新渲染

  // 初始数据源
  const [dataSource, setDataSource] = useState<ParamItem[]>(
    initialData || [
      {
        id: "1",
        name: "stepCon2",
        unit: "",
        type: "String",
      },
      {
        id: "2",
        name: "0",
        unit: "Integer",
        type: "Integer",
      },
      {
        id: "3",
        name: "sendString",
        unit: "String",
        type: "String",
      },
    ]
  );

  // 测试条件选项
  const testConditionOptions = [
    { value: 1, label: "测试条件" },
    { value: 2, label: "测试结果" },
    { value: 3, label: "测试变量" },
    { value: 4, label: "运算符" },
    { value: 5, label: "标签" },
    { value: 6, label: "常量" },
  ];

  // 获取下拉选项（模拟数据）
  const getSelectOptions = (conditionType: number) => {
    switch (conditionType) {
      case 1: // 测试条件
        return [
          { value: "voltage_condition", label: "电压条件" },
          { value: "current_condition", label: "电流条件" },
          { value: "resistance_condition", label: "电阻条件" },
          { value: "temperature_condition", label: "温度条件" },
          { value: "frequency_condition", label: "频率条件" },
        ];
      case 2: // 测试结果
        return [
          { value: "pass", label: "通过(Pass)" },
          { value: "fail", label: "失败(Fail)" },
          { value: "error", label: "错误(Error)" },
          { value: "skip", label: "跳过(Skip)" },
          { value: "pending", label: "待定(Pending)" },
        ];
      case 3: // 测试变量
        return [
          { value: "input_voltage", label: "输入电压" },
          { value: "output_voltage", label: "输出电压" },
          { value: "input_current", label: "输入电流" },
          { value: "output_current", label: "输出电流" },
          { value: "power_consumption", label: "功耗" },
          { value: "test_duration", label: "测试时长" },
        ];
      case 4: // 运算符
        return [
          { value: "eq", label: "等于 (==)" },
          { value: "ne", label: "不等于 (!=)" },
          { value: "gt", label: "大于 (>)" },
          { value: "gte", label: "大于等于 (>=)" },
          { value: "lt", label: "小于 (<)" },
          { value: "lte", label: "小于等于 (<=)" },
          { value: "in", label: "包含 (in)" },
          { value: "not_in", label: "不包含 (not in)" },
        ];
      case 5: // 标签
        return [
          { value: "step_start", label: "步骤开始" },
          { value: "step_end", label: "步骤结束" },
          { value: "measurement", label: "测量点" },
          { value: "checkpoint", label: "检查点" },
          { value: "warning", label: "警告点" },
          { value: "critical", label: "关键点" },
        ];
      default:
        return [];
    }
  };

  // 渲染输入组件
  const renderInputComponent = (item: ParamItem, index: number) => {
    const conditionType = form.getFieldValue([
      "params",
      index,
      "conditionType",
    ]);

    // 如果没有选择测试条件类型，显示提示信息
    if (!conditionType) {
      return (
        <div style={{ color: "#6c757d", fontSize: "12px" }}>
          请先选择测试条件
        </div>
      );
    }

    // 只有常量类型（conditionType === 6）使用输入框
    if (conditionType === 6) {
      // 根据参数类型决定输入组件类型
      if (item.type === "Integer") {
        return (
          <Form.Item
            name={["params", index, "value"]}
            noStyle
            rules={[{ required: true, message: "请输入常量值" }]}
          >
            <InputNumber
              placeholder="输入整数常量值"
              style={{ width: "100%" }}
              size="small"
            />
          </Form.Item>
        );
      } else if (item.type === "String") {
        return (
          <Form.Item
            name={["params", index, "value"]}
            noStyle
            rules={[{ required: true, message: "请输入常量值" }]}
          >
            <Input placeholder="输入字符串常量值" size="small" />
          </Form.Item>
        );
      } else {
        // 其他类型（Double等）也使用输入框
        return (
          <Form.Item
            name={["params", index, "value"]}
            noStyle
            rules={[{ required: true, message: "请输入常量值" }]}
          >
            <Input placeholder="输入常量值" size="small" />
          </Form.Item>
        );
      }
    }

    // 其他所有类型（测试条件、测试结果、测试变量、运算符、标签）都使用下拉选择
    const selectOptions = getSelectOptions(conditionType);

    return (
      <Form.Item
        name={["params", index, "value"]}
        noStyle
        rules={[{ required: true, message: "选择值" }]}
      >
        <Select
          placeholder={`选择${
            testConditionOptions.find((opt) => opt.value === conditionType)
              ?.label || "值"
          }`}
          options={selectOptions}
          style={{ width: "100%" }}
          size="small"
          allowClear
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>
    );
  };

  // 表格列定义
  const columns = [
    {
      title: "参数名",
      dataIndex: "name",
      width: 120,
    },
    {
      title: "参数单位",
      dataIndex: "unit",
      width: 100,
      render: (text: string) => text || "-",
    },
    {
      title: "参数类型",
      dataIndex: "type",
      width: 100,
    },
  ];

  useEffect(() => {
    // 初始化表单数据
    const initialValues = {
      params: dataSource.map((item) => ({
        id: item.id,
        conditionType: item.conditionType,
        value: item.value,
      })),
    };
    form.setFieldsValue(initialValues);
  }, [dataSource, form]);

  // 处理确定按钮
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        // 合并表单数据到dataSource
        const updatedDataSource = dataSource.map((item, index) => ({
          ...item,
          conditionType: values.params[index]?.conditionType,
          value: values.params[index]?.value,
        }));

        console.log("更新后的数据源:", updatedDataSource);
        onOk?.(updatedDataSource);
      })
      .catch((errorInfo) => {
        console.error("表单验证失败:", errorInfo);
      });
  };
  const handleCancel = () => {
    onCancel?.();
    form.resetFields();
  };
  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      title="参数配置"
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
        {/* 参数列表展示 */}
        {/* <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 500,
              marginBottom: 8,
              color: "#262626",
            }}
          >
            参数
          </div>
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            size="small"
            rowKey="id"
            bordered
            style={{ marginBottom: 0 }}
          />
        </div> */}

        {/* 动态表单区域 - 更紧凑的布局 */}
        <div
          style={{
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: 12,
            color: "#262626",
          }}
        >
          参数配置
        </div>

        <Form.List name="params">
          {(fields) => (
            <div
              style={{ maxHeight: "45vh", overflow: "auto", padding: "0 4px" }}
            >
              {/* 表头 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 100px 200px 1fr",
                  gap: "12px",
                  padding: "8px 12px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "4px",
                  marginBottom: "8px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#262626",
                  borderBottom: "1px solid #d9d9d9",
                }}
              >
                <div>参数名</div>
                <div>参数单位</div>
                <div>条件</div>
                <div>值</div>
              </div>

              {/* 参数行 */}
              {fields.map((field, index) => {
                const currentItem = dataSource[index];
                if (!currentItem) return null;

                return (
                  <div
                    key={field.key}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "120px 100px 200px 1fr",
                      gap: "12px",
                      padding: "12px",
                      marginBottom: "8px",
                      border: "1px solid #f0f0f0",
                      borderRadius: "4px",
                      backgroundColor: "#fafafa",
                      alignItems: "center",
                    }}
                  >
                    {/* 参数名 */}
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#262626",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={currentItem.name}
                    >
                      {currentItem.name}
                    </div>

                    {/* 参数单位 */}
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#8c8c8c",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={currentItem.unit || currentItem.type}
                    >
                      {currentItem.unit || currentItem.type}
                    </div>

                    {/* 测试条件选择 */}
                    <div>
                      <Form.Item
                        {...field}
                        name={[field.name, "conditionType"]}
                        noStyle
                      >
                        <Select
                          placeholder="选择条件"
                          size="small"
                          style={{ width: "100%" }}
                          options={testConditionOptions}
                          onChange={(value) => {
                            console.log(value, field.name, currentItem);
                            // 清空当前参数值，因为测试条件类型变了，之前的值可能不适用
                            const currentParams =
                              form.getFieldValue("params") || [];
                            const newParams = [...currentParams];
                            if (newParams[field.name]) {
                              newParams[field.name] = {
                                ...newParams[field.name],
                                conditionType: value,
                                value: undefined, // 清空参数值
                              };
                            } else {
                              newParams[field.name] = {
                                conditionType: value,
                                value: undefined,
                              };
                            }
                            form.setFieldsValue({ params: newParams });
                            // 强制重新渲染输入组件
                            setRefreshKey((prev) => prev + 1);
                          }}
                        />
                      </Form.Item>
                    </div>

                    {/* 动态输入组件 */}
                    <div key={`${field.name}-${refreshKey}`}>
                      {renderInputComponent(currentItem, field.name)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default ParamForm;
