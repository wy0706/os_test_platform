import {
  GetExcelList,
  getReportInfo,
  getServerList,
} from "@/services/case-management/case-run.service";
import { useSetState } from "ahooks";
import { Checkbox, Col, Form, Input, message, Modal, Row, Select } from "antd";
import { useEffect } from "react";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  data?: any;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const ReportInfoModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  data,
}) => {
  const [state, setState] = useSetState<any>({
    loading: false,
    isDisabled: true,
    confirmLoading: false,
    serveList: [],
    excelList: [],
  });

  const { loading, confirmLoading, isDisabled } = state;
  useEffect(() => {
    if (open) {
      form?.resetFields();
      if (data) {
        form?.setFieldsValue({ ...data });
      }
    }
  }, [open, data]);

  const [form] = Form.useForm();
  const getReport = async () => {
    try {
      setState({
        loading: true,
      });
      const { code, data, message: msg } = await getReportInfo();
      if (code !== 0) {
        message.error(msg || "获取报告详情失败");
        setState({
          isDisabled: true,
        });
        return;
      }
      setState({
        isDisabled: false,
      });
      console.log("data", data);
    } catch (e) {
      setState({
        isDisabled: true,
      });
    } finally {
      setState({
        loading: false,
      });
    }
  };
  const getServer = async () => {
    try {
      const { code, data, message: msg } = await getServerList();
      if (code !== 0) {
        message.error(msg || "获取服务器列表失败");
        setState({
          serveList: [],
        });
        return;
      }
      setState({
        serveList: data || [],
      });
    } catch (e) {
      setState({
        serveList: [],
      });
    }
  };

  const getExcel = async () => {
    try {
      const { code, data, message: msg } = await GetExcelList();
      if (code !== 0) {
        message.error(msg || "获取Excel模板失败");
        setState({ excelList: [] });
        return;
      }
      setState({ excelList: data || [] });
    } catch (e) {
      setState({ excelList: [] });
    }
  };

  const handleOk = async () => {
    try {
      const values = await form;

      console.log("Form values:", values);
      setState({
        confirmLoading: true,
      });
      if (onOk) {
        onOk(values);
      }
    } catch (e) {
    } finally {
      setState({
        confirmLoading: false,
      });
    }
  };
  const plainOptions = ["Apple", "Pear", "Orange"];
  return (
    <Modal
      title="报表导出设置"
      maskClosable={false}
      loading={loading}
      okButtonProps={{ disabled: isDisabled }}
      confirmLoading={confirmLoading}
      afterClose={() => {
        form?.resetFields();
        setState({
          isDisabled: true,
        });
      }}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      width={"35%"}
      onOk={handleOk}
    >
      <Form
        {...layout}
        form={form}
        initialValues={{
          name2: true,
          name4: true,
          name6: true,
        }}
      >
        <Form.Item
          name="name"
          label=""
          rules={[{ required: true, message: "请选择导出设置" }]}
        >
          <Checkbox.Group style={{ width: "100%" }}>
            <Row gutter={16}>
              <Col span={8}>
                <Checkbox value="1">报表显示</Checkbox>
              </Col>

              <Col span={8}>
                <Checkbox value="3">报表保存</Checkbox>
              </Col>

              <Col span={8}>
                <Checkbox value="4">仅记录UDS</Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="name2" label="" valuePropName="checked">
              <Checkbox
                onChange={(e) => {
                  if (!e.target.checked) {
                    form.setFieldValue("name3", undefined);
                  }
                }}
              >
                报表名后缀日期
              </Checkbox>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.name2 !== currentValues.name2
              }
            >
              {({ getFieldValue }) => {
                const isChecked = getFieldValue("name2");
                return (
                  <Form.Item
                    name="name3"
                    label=""
                    rules={[
                      {
                        required: isChecked,
                        message: "请输入间隔符",
                      },
                    ]}
                  >
                    <Input
                      placeholder="输入间隔符"
                      allowClear
                      addonAfter="间隔符"
                      disabled={!isChecked}
                      style={{ color: isChecked ? "#000000" : "#6c757d" }}
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="name4" label="" valuePropName="checked">
              <Checkbox
                onChange={(e) => {
                  if (!e.target.checked) {
                    form.setFieldValue("name5", undefined);
                  }
                }}
              >
                上传服务器
              </Checkbox>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.name4 !== currentValues.name4
              }
            >
              {({ getFieldValue }) => {
                const isChecked = getFieldValue("name4");
                return (
                  <Form.Item
                    name="name5"
                    label=""
                    rules={[
                      {
                        required: isChecked,
                        message: "请选择服务器",
                      },
                    ]}
                  >
                    <Select
                      placeholder="选择服务器"
                      allowClear
                      disabled={!isChecked}
                      style={{ color: isChecked ? "#000000" : "#6c757d" }}
                    >
                      <Option value="1">服务器1</Option>
                      <Option value="2">服务器2</Option>
                      <Option value="3">服务器3</Option>
                    </Select>
                  </Form.Item>
                );
              }}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="name6" label="" valuePropName="checked">
              <Checkbox
                onChange={(e) => {
                  if (!e.target.checked) {
                    form.setFieldValue("name7", undefined);
                  }
                }}
              >
                EXCEL模板
              </Checkbox>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.name6 !== currentValues.name6
              }
            >
              {({ getFieldValue }) => {
                const isChecked = getFieldValue("name6");
                return (
                  <Form.Item
                    name="name7"
                    label=""
                    rules={[
                      {
                        required: isChecked,
                        message: "请选择EXCEL模板路径",
                      },
                    ]}
                  >
                    <Select
                      placeholder="EXCEl模版路径"
                      allowClear
                      disabled={!isChecked}
                      style={{
                        color: isChecked ? "#000000" : "#6c757d",
                      }}
                    >
                      <Option value="1">路径1</Option>
                      <Option value="2">路径2</Option>
                      <Option value="3">路径3</Option>
                    </Select>
                  </Form.Item>
                );
              }}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ReportInfoModal;
