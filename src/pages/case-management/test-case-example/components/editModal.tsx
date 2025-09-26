import {
  copyCase,
  getList as getModule,
  updateCase,
} from "@/services/case-management/test-case-example.service";
import { getList as getLib } from "@/services/case-management/test-case.service";
import { isArray } from "@/utils";
import { useSetState } from "ahooks";
import { Form, Input, message, Modal, Select } from "antd";
import { useEffect } from "react";
interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  onSelect?: () => void;
  testData?: any;
  type: string;
  updateValue?: any;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const AddModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  onSelect,
  testData,
  type,
  updateValue,
}) => {
  const [state, setState] = useSetState<any>({
    libList: [], //用例库列表
    moduleList: [], //模块列表
    submitLoading: false,
  });
  const { submitLoading, libList, moduleList } = state;
  const [form] = Form.useForm();
  useEffect(() => {
    fetchData();
  }, [open, type, updateValue]);

  const fetchData = async () => {
    if (open && updateValue) {
      await getLibList();
      if (updateValue?.lib_info?.id) {
        await getModuleList(updateValue?.lib_info?.id);
      }
      form?.setFieldsValue({
        tc_module_id: updateValue?.module_info?.id,
        tc_lib_id: updateValue?.lib_info?.id,
      });
    }
  };

  const getLibList = async () => {
    try {
      const {
        code,
        data,
        message: msg,
      } = await getLib({ page_index: 1, page_size: 9999 });
      if (code === 0) {
        if (isArray(data?.list)) {
          setState({ libList: data?.list || [] });
        }
      } else {
        message.error(msg);
        setState({ libList: [] });
      }
    } catch (error) {
      console.error("获取用例库列表失败:", error);
      setState({ libList: [] });
    }
  };
  // 获取模块列表

  const getModuleList = async (libId: any) => {
    try {
      const params = {
        lib_id: libId,
        page_index: 1,
        page_size: 9999,
      };
      const { code, data, message: msg } = await getModule(params);
      if (code === 0) {
        if (isArray(data?.list)) {
          setState({ moduleList: data?.list || [] });
        }
      } else {
        message.error(msg);
        setState({ moduleList: [] });
      }
    } catch (error) {
      console.error("获取模块列表失败:", error);
      setState({ moduleList: [] });
    }
  };

  const onFinish = (values: any) => {
    console.log(values);
  };
  const handleLibChange = (value: any) => {
    form?.setFieldsValue({
      tc_module_id: undefined,
    });
    try {
      if (value) {
        getModuleList(value);
      } else {
        setState({
          moduleList: [],
        });
      }
    } catch (error) {
      setState({
        moduleList: [],
      });
    }
  };
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setState({ submitLoading: true });
      if (type === "copy") {
        const { code, message: msg } = await copyCase({
          ...values,
          tc_id: updateValue?.id,
        });
        if (code !== 0) {
          message.error(msg || "操作失败");
          return;
        }
        message.success(msg || "操作成功");
      } else {
        const { code, messsage: msg } = await updateCase({
          ...values,
          tc_id: updateValue?.id,
        });
        if (code !== 0) {
          message.error(msg || "操作失败");
          return;
        }
        message.success(msg || "操作成功");
      }
      if (onOk) {
        onOk(values);
      }
    } catch (error) {
    } finally {
      setState({ submitLoading: false });
    }
  };

  return (
    <Modal
      title={type == "copy" ? "复制测试库" : "移动测试库"}
      maskClosable={false}
      open={open}
      destroyOnHidden
      onCancel={() => {
        form?.resetFields();
        onCancel && onCancel();
      }}
      confirmLoading={submitLoading}
      styles={{ body: { padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
        {type == "copy" && (
          <Form.Item name="tc_title" label="标题" rules={[{ required: true }]}>
            <Input placeholder="输入标题" maxLength={32} />
          </Form.Item>
        )}

        <Form.Item
          name="tc_lib_id"
          label="所属测试库"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="选择所属测试库"
            allowClear
            onChange={handleLibChange}
          >
            {libList.map((lib: any) => (
              <Option key={lib.id} value={lib.id}>
                {lib.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="tc_module_id"
          label="模块"
          rules={[{ required: true }]}
        >
          <Select placeholder="选择模块" allowClear>
            {moduleList.map((lib: any) => (
              <Option key={lib.id} value={lib.id}>
                {lib.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddModal;
