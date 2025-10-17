import {
  createTypeOne,
  getInstrumentType,
} from "@/services/equipment-management/equipment-library-edit.service";
import { Form, message, Modal, Select } from "antd";
import { useEffect, useState } from "react";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  onSelect?: () => void;
  testData?: any;
  type?: string;
  updateValue?: any;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const AddTypeModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  onSelect,
  testData,
  type,
  updateValue,
}) => {
  const [typeList, setTypeList] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const getTypeList = async () => {
    const {
      code,
      data,
      message: msg,
    } = await getInstrumentType({
      route: 0,
    });
    if (code !== 0) {
      message.error(msg);
      setTypeList([]);
      return;
    }
    setTypeList(data?.list_info || []);
  };

  useEffect(() => {
    initData();
  }, [open, type, updateValue]);

  const initData = async () => {
    if (open) {
      form?.resetFields();
      getTypeList();
    }
  };
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    setSubmitLoading(true);
    try {
      const { code, message: msg } = await createTypeOne({ ...values });
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      let obj = typeList.find((item) => item.type_code == values.type_code);
      // onOk?.(obj);
      onOk?.({
        ...obj,
        msg: msg || "设备种类添加成功",
      });
    } catch (error) {
    } finally {
      setSubmitLoading(false);
    }
  };
  return (
    <Modal
      title="添加设备类型"
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      destroyOnHidden
      confirmLoading={submitLoading}
      styles={{ body: { padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form {...layout} form={form}>
        <Form.Item
          name="type_code"
          label="设备类型"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="选择设备类型"
            allowClear
            showSearch
            loading={loading}
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {typeList.map((item) => (
              <Option key={item.type_code} value={item.type_code}>
                {item.group_name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddTypeModal;
