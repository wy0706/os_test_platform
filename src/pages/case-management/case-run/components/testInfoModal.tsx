import {
  getTestInfo,
  updateTestInfo,
} from "@/services/case-management/case-run.service";
import { useSetState } from "ahooks";
import { Form, Input, message, Modal, Select } from "antd";
import { useEffect } from "react";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  autoId: any;
  data?: any;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const TestInfoModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  data,
  autoId,
}) => {
  const [state, setState] = useSetState<any>({
    loading: false,
    isDisabled: true,
    confirmLoading: false,
  });

  const { loading, confirmLoading, isDisabled } = state;
  useEffect(() => {
    getDetails();
  }, [open]);

  const getDetails = async () => {
    if (!open) return;
    form?.resetFields();
    try {
      setState({
        loading: true,
      });
      if (!autoId) {
        message.error("缺少序列ID");
        return;
      }
      const { code, data, message: msg } = await getTestInfo(autoId);
      form?.setFieldsValue({ ...data });
      if (code !== 0) {
        message.error(msg || "获取测试信息失败");
        setState({
          isDisabled: true,
        });
        return;
      }
      setState({
        isDisabled: false,
      });
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
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    try {
      if (!autoId) return;
      setState({
        confirmLoading: true,
      });
      const { code, message: msg } = await updateTestInfo({
        ...values,
        execution_file_id: autoId,
      });
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");
      if (onOk) {
        onOk(values);
      }
    } catch (e) {
    } finally {
      setState({ confirmLoading: false });
    }
  };

  return (
    <Modal
      title="设置测试信息"
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      confirmLoading={confirmLoading}
      afterClose={() => {
        form?.resetFields();
        setState({
          isDisabled: true,
        });
      }}
      styles={{ body: { padding: 20 } }}
      onOk={handleOk}
      loading={loading}
      okButtonProps={{ disabled: isDisabled }}
    >
      <Form {...layout} form={form}>
        <Form.Item
          name="ProjectName"
          label="项目名称"
          rules={[{ required: true }]}
        >
          <Input placeholder="输入项目名称" allowClear disabled />
        </Form.Item>
        <Form.Item name="SampleName" label="样品名称">
          <Input placeholder="输入样品名称" allowClear />
        </Form.Item>
        <Form.Item name="Model" label="型号">
          <Input placeholder="输入型号" allowClear />
        </Form.Item>
        <Form.Item name="TestOrg" label="测试单位">
          <Input placeholder="输入测试单位" allowClear />
        </Form.Item>
        <Form.Item name="Tester" label="检验人员">
          <Input placeholder="输入检验人员" allowClear />

          {/* <Select
            placeholder="选择作者"
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {userList.map((user: any) => (
              <Option key={user.id} value={user.id}>
                {user.name ||
                  user.username ||
                  user.realName ||
                  user.displayName}
              </Option>
            ))}
          </Select> */}
        </Form.Item>
        <Form.Item name="Temperature" label="环境温度">
          <Input placeholder="输入环境温度" allowClear />
        </Form.Item>
        <Form.Item name="Law" label="测试依据">
          <Input placeholder="输入测试依据" allowClear />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TestInfoModal;
