import {
  GetExcelList,
  getReportInfo,
  updateReportOne,
} from "@/services/case-management/case-run.service";
import { useSetState } from "ahooks";
import { Checkbox, Col, Form, Input, message, Modal, Row, Select } from "antd";
import { useEffect } from "react";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  autoId: any;
}
const { Option } = Select;

const layout = { labelCol: { span: 24 } };

const OPERATE_OPTIONS = [
  { label: "报表显示", value: "display" },
  { label: "报表保存", value: "save" },
  { label: "仅记录UDS", value: "uds" },
];

const n2b = (v: any) => v === 1 || v === "1" || v === true;
const b2n = (v: any) => (v ? 1 : 0);

// 操作选项转换函数
const operateFromBackend = (arr: any): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((v, i) => (v === 1 || v === "1" ? OPERATE_OPTIONS[i]?.value : null))
    .filter(Boolean) as string[];
};

const operateToBackend = (selected: string[] | undefined | null): number[] => {
  const len = OPERATE_OPTIONS.length;
  const res = Array(len).fill(0) as number[];
  (selected || []).forEach((v) => {
    const i = OPERATE_OPTIONS.findIndex((opt) => opt.value === v);
    if (i !== -1) res[i] = 1;
  });
  return res;
};

const ReportInfoModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,

  autoId,
}) => {
  const [state, setState] = useSetState<any>({
    loading: false,
    isDisabled: true,
    confirmLoading: false,
    serveList: [],
    excelList: [],
  });
  const { loading, confirmLoading, isDisabled, excelList } = state;
  const [form] = Form.useForm();
  useEffect(() => {
    initData();
  }, [open, autoId]);

  const initData = async () => {
    if (!open) return;
    form?.resetFields();
    await Promise.all([getReport(), getExcel()]);
  };
  const getReport = async () => {
    if (!autoId) {
      message.error("缺少文件ID");
      return;
    }
    try {
      setState({ loading: true });
      const { code, data: report, message: msg } = await getReportInfo(autoId);
      if (code !== 0) {
        message.error(msg || "获取报告详情失败");
        setState({ isDisabled: true });
        return;
      }

      // 映射后端数据到表单
      const formValues = {
        ReportOperate: operateFromBackend(report?.ReportOperate),
        ReportSufxflag: n2b(report?.ReportSufxflag),
        ReportServerflag: n2b(report?.ReportServerflag),
        ReportModuleflag: n2b(report?.ReportModuleflag),
        ReportSufx: report?.ReportSufx ?? undefined,
        ReportServer: report?.ReportServer ?? undefined,
        ReportModule: report?.ReportModule ?? undefined,
      };
      form?.setFieldsValue(formValues);
      setState({ isDisabled: false });
    } catch {
      setState({ isDisabled: true });
    } finally {
      setState({ loading: false });
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
    } catch {
      setState({ excelList: [] });
    }
  };

  const handleOk = async () => {
    try {
      setState({
        confirmLoading: true,
      });
      const values = await form.validateFields();

      //  表单 → 后端
      const payload = {
        execution_file_id: autoId,
        ...values,
        ReportSufxflag: b2n(values.ReportSufxflag),
        ReportServerflag: b2n(values.ReportServerflag),
        ReportModuleflag: b2n(values.ReportModuleflag),
        ReportOperate: operateToBackend(values.ReportOperate),
      };

      const { code, message: msg } = await updateReportOne(payload);
      if (code !== 0) {
        throw new Error(msg || "操作失败");
      }
      message.success(msg || "操作成功");
      onOk?.(payload);
    } catch {
      // 校验未通过
    } finally {
      setState({ confirmLoading: false });
    }
  };

  return (
    <Modal
      title="报表导出设置"
      maskClosable={false}
      okButtonProps={{ disabled: isDisabled }}
      confirmLoading={confirmLoading}
      destroyOnHidden
      open={open}
      onCancel={() => {
        form?.resetFields();
        setState({ isDisabled: true });
        onCancel?.();
      }}
      styles={{ body: { padding: 20 } }}
      width={"35%"}
      onOk={handleOk}
      loading={loading}
    >
      <Form
        {...layout}
        form={form}
        initialValues={{
          ReportSufxflag: false,
          ReportServerflag: false,
          ReportModuleflag: false,
          ReportOperate: [],
        }}
      >
        {/*  导出设置 */}
        <Form.Item
          name="ReportOperate"
          rules={[{ required: true, message: "请选择导出设置" }]}
        >
          <Checkbox.Group style={{ width: "100%" }}>
            <Row gutter={16}>
              {OPERATE_OPTIONS.map((opt) => (
                <Col span={8} key={opt.value}>
                  <Checkbox value={opt.value}>{opt.label}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>

        {/* 报表名后缀 */}
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="ReportSufxflag" valuePropName="checked">
              <Checkbox
                onChange={(e) => {
                  if (!e.target.checked) {
                    form?.setFieldValue("ReportSufx", undefined);
                  }
                }}
              >
                报表名后缀日期
              </Checkbox>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              shouldUpdate={(prev, cur) =>
                prev.ReportSufxflag !== cur.ReportSufxflag
              }
            >
              {({ getFieldValue }) => {
                const isChecked = getFieldValue("ReportSufxflag");
                return (
                  <Form.Item
                    name="ReportSufx"
                    rules={[{ required: isChecked, message: "请输入间隔符" }]}
                  >
                    <Input
                      placeholder="输入间隔符"
                      allowClear
                      addonAfter="间隔符"
                      disabled={!isChecked}
                      style={{ color: isChecked ? "#000" : "#6c757d" }}
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>
          </Col>
        </Row>

        {/* 上传服务器 */}
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="ReportServerflag" valuePropName="checked">
              <Checkbox>上传服务器</Checkbox>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              shouldUpdate={(prev, cur) =>
                prev.ReportServerflag !== cur.ReportServerflag
              }
            >
              <Form.Item name="ReportServer">
                <Input disabled placeholder="服务器" />
              </Form.Item>
            </Form.Item>
          </Col>
        </Row>

        {/* EXCEL模板 */}
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="ReportModuleflag" valuePropName="checked">
              <Checkbox
                onChange={(e) => {
                  if (!e.target.checked) {
                    form?.setFieldValue("ReportModule", undefined);
                  }
                }}
              >
                EXCEL模板
              </Checkbox>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              shouldUpdate={(prev, cur) =>
                prev.ReportModuleflag !== cur.ReportModuleflag
              }
            >
              {({ getFieldValue }) => {
                const isChecked = getFieldValue("ReportModuleflag");
                return (
                  <Form.Item
                    name="ReportModule"
                    rules={[
                      { required: isChecked, message: "请选择EXCEL模板路径" },
                    ]}
                  >
                    <Select
                      placeholder="EXCEL模板路径"
                      allowClear
                      disabled={!isChecked}
                      style={{ color: isChecked ? "#000" : "#6c757d" }}
                    >
                      {excelList.map((item: any) => (
                        <Option value={item} key={item}>
                          {item}
                        </Option>
                      ))}
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
