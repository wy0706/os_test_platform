import {
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
const { Title, Text } = Typography;

const { Option } = Select;

interface ParamItem {
  id: string;
  name: string;
  unit: string;
  type: string;
  type1?: string;
  conditionType?: number; // 测试条件类型
  constantType?: string; // 常量类型：Integer、Double、Byte、HexString、String
  value?: any; // 输入的值
}

interface ParamFormProps {
  type?: string;
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
  type,
}) => {
  const [form] = Form.useForm();
  const [title, setTitle] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // 用于强制重新渲染

  const [testConditionOptions, setTestConditionOptions] = useState<any>([]);

  // 常量类型选项
  const constantTypeOptions = [
    { value: "Integer", label: "整数" },
    { value: "Double", label: "双精度型" },
    { value: "Byte", label: "字节型" },
    { value: "HexString", label: "十六进制字符" },
    { value: "String", label: "字符型" },
  ];

  useEffect(() => {
    const name = type === "INPUT" ? "输入" : "输出";
    setTitle(`${name}参数`);
    // 输入参数支持的类型
    let op1 = [
      { value: 1, label: "测试条件" }, //输入参数
      { value: 2, label: "测试结果" }, //输入参数 输出参数
      { value: 3, label: "临时变量" }, //输入参数  输出参数
      { value: 4, label: "运算符", disabled: true }, //判断是否是运算符 如果是 可以选择 ，否则不可选
      { value: 5, label: "标签", disabled: true }, //测试流程中包含这个标签才可以选择
      { value: 6, label: "常量" }, //  输入参数,
      // 当选择常量时，单元格中参数类型与常量类型进行关联，一对一关联，常量展开类型:整形、双精度、字符型、十六进制字符、字符型。
    ];
    //  输出参数支持的类型
    let op2 = [
      { value: 2, label: "测试结果" },
      { value: 3, label: "临时变量" },
    ];

    setTestConditionOptions(type === "INPUT" ? op1 : op2);
  }, [open]);
  // 初始数据源
  const [dataSource, setDataSource] = useState<ParamItem[]>(initialData || []);

  // 获取下拉选项（模拟数据）
  const getSelectOptions = (conditionType: number) => {
    switch (conditionType) {
      case 1: // 测试条件
        return [
          { value: "voltage_condition", label: "供电典型值" },
          { value: "current_condition", label: "CAN_MSG" },
          { value: "resistance_condition", label: "CAN通道" },
        ];
      case 2: // 测试结果
        return [{ value: "pass", label: "CAN4发送命令" }];
      case 3: // 测试变量
        return [
          { value: "input_voltage", label: "flag" },
          { value: "output_voltage", label: "上拉电阻临时变量" },
        ];
      case 4: // 运算符
        return [
          { value: "eq", label: "==" },
          { value: "gt", label: ">" },
          { value: "gte", label: ">=" },
          { value: "lt", label: "<" },
          { value: "lte", label: "<=" },
          { value: "ne", label: "!=" },
        ];
      case 5: // 标签
        return [
          //实际 根据测试流程中的标签获取，选择标签
          { value: "step_start", label: "COM" },
          { value: "step_end", label: "1" },
        ];
      default:
        return [];
    }
  };

  // 渲染输入组件
  const renderInputComponent = (item: ParamItem, index: number) => {
    // 使用当前行数据中的conditionType，确保每行独立
    const conditionType = item.conditionType;

    // 如果没有选择测试条件类型，显示提示信息
    if (!conditionType) {
      return (
        <div style={{ color: "#6c757d", fontSize: "12px" }}>
          {/* 请先选择测试条件 */}
        </div>
      );
    }

    // 只有常量类型（conditionType === 6）使用输入框
    if (conditionType === 6) {
      // 如果没有选择常量类型，显示提示信息
      if (!item.constantType) {
        return (
          <div style={{ color: "#6c757d", fontSize: "12px" }}>
            请先选择常量类型
          </div>
        );
      }

      // 根据常量类型决定输入组件类型
      switch (item.constantType) {
        case "Integer":
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
        case "Double":
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
            <div style={{ color: "#6c757d", fontSize: "12px" }}>
              未知的常量类型
            </div>
          );
      }
    }

    // 其他所有类型（测试条件、测试结果、测试变量、运算符、标签）都使用下拉选择
    const selectOptions = getSelectOptions(conditionType);

    return (
      <Form.Item name={["params", index, "value"]} noStyle>
        <Select
          placeholder="选择"
          options={selectOptions}
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
  };

  // 处理类型选择变化 - 确保每行数据完全独立
  const handleTypeChange = (
    value: number,
    record: ParamItem,
    index: number
  ) => {
    // 仅更新数据源中对应行的conditionType，其他行保持不变
    const newDataSource = dataSource.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          conditionType: value,
          constantType: value === 6 ? undefined : item.constantType, // 如果不是常量类型，清空常量类型
          value: undefined, // 清空当前行的值，因为类型变了
        };
      }
      return item; // 其他行保持原样
    });
    setDataSource(newDataSource);

    // 只更新表单中当前行的数据，其他行不受影响
    const currentFormValues = form.getFieldsValue();
    if (!currentFormValues.params) {
      currentFormValues.params = dataSource.map(() => ({}));
    }

    // 确保表单数组有足够的元素
    while (currentFormValues.params.length <= index) {
      currentFormValues.params.push({});
    }

    // 只更新当前行的表单字段
    currentFormValues.params[index] = {
      ...currentFormValues.params[index],
      conditionType: value,
      constantType:
        value === 6 ? undefined : currentFormValues.params[index]?.constantType,
      value: undefined,
    };

    form.setFieldsValue(currentFormValues);

    // 强制重新渲染表格
    setRefreshKey((prev) => prev + 1);
  };

  // 处理常量类型选择变化
  const handleConstantTypeChange = (
    value: string,
    record: ParamItem,
    index: number
  ) => {
    // 仅更新数据源中对应行的constantType，其他行保持不变
    const newDataSource = dataSource.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          constantType: value,
          value: undefined, // 清空当前行的值，因为常量类型变了
        };
      }
      return item; // 其他行保持原样
    });
    setDataSource(newDataSource);

    // 只更新表单中当前行的数据，其他行不受影响
    const currentFormValues = form.getFieldsValue();
    if (!currentFormValues.params) {
      currentFormValues.params = dataSource.map(() => ({}));
    }

    // 确保表单数组有足够的元素
    while (currentFormValues.params.length <= index) {
      currentFormValues.params.push({});
    }

    // 只更新当前行的表单字段
    currentFormValues.params[index] = {
      ...currentFormValues.params[index],
      constantType: value,
      value: undefined,
    };

    form.setFieldsValue(currentFormValues);

    // 强制重新渲染表格
    setRefreshKey((prev) => prev + 1);
  };

  // 处理值变化 - 确保每行数据完全独立
  const handleValueChange = (value: any, record: ParamItem, index: number) => {
    // 仅更新数据源中对应行的value，其他行保持不变
    const newDataSource = dataSource.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          value: value,
        };
      }
      return item; // 其他行保持原样
    });
    setDataSource(newDataSource);
  };

  // 表格列定义
  const getColumns = () => {
    const baseColumns = [
      {
        title: "参数名",
        dataIndex: "name",
        width: 120,
      },

      {
        title: "符合要求的参数列表",
        dataIndex: "type1",
        width: 100,
        render: (text: string, record: ParamItem, index: number) => {
          return (
            <Select
              value={record.conditionType}
              placeholder="选择测试条件"
              options={testConditionOptions}
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
        },
      },
    ];

    // 只有输入参数类型才显示常量类型列
    if (type === "INPUT") {
      baseColumns.push({
        title: "常量类型",
        dataIndex: "constantType",
        width: 120,
        render: (text: string, record: ParamItem, index: number) => {
          // 只有当选择了常量类型（conditionType === 6）时才显示常量类型选择
          if (record.conditionType === 6) {
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
          return <div style={{ color: "#6c757d", fontSize: "12px" }}>-</div>;
        },
      });
    }
    // 添加值列
    baseColumns.push(
      {
        title: "值",
        dataIndex: "value",
        width: 200,
        render: (text: any, record: ParamItem, index: number) => {
          return renderInputComponent(record, index);
        },
      },
      {
        title: "参数单位",
        dataIndex: "unit",
        width: 100,
        render: (text: string) => text || "-",
      }
    );

    return baseColumns;
  };

  const columns = getColumns();

  // useEffect(() => {
  //   // 初始化表单数据
  //   const initialValues = {
  //     params: dataSource.map((item) => ({
  //       id: item.id,
  //       conditionType: item.conditionType,
  //       value: item.value,
  //     })),
  //   };
  //   form.setFieldsValue(initialValues);
  // }, [dataSource, form]);

  // 处理确定按钮
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        // 合并表单数据到dataSource
        const updatedDataSource = dataSource.map((item, index) => ({
          ...item,
          conditionType: values.params[index]?.conditionType,
          constantType: values.params[index]?.constantType,
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
      title={title}
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
      <div>
        <div className="param-content">
          {/* 输入参数 */}
          <div className="param-section" style={{ marginBottom: 15 }}>
            <div className="param-section-title">
              <Text strong>
                {title}：{initialData?.length}个参数{" "}
              </Text>
            </div>

            {initialData?.map((param: any, index: number) => (
              <div key={index} className="param-line">
                Parameter：
                <Text className="param-name">{param.name}</Text>
                <Text type="secondary" className="param-type">
                  {param.type} ({param.dataType})
                </Text>
                <Text className="param-desc">{param.description}</Text>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Form form={form} layout="vertical" size="small">
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
        
        </div> */}
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
