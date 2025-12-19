import {
  createModalOne,
  getInstrumentModal,
} from "@/services/equipment-management/equipment-library-edit.service";
import { Form, message, Modal, Select } from "antd";
import { useEffect, useState } from "react";
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

const AddModelModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  data,
}) => {
  const [modelList, setModelList] = useState<any[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  const getModalData = async (type_code: string) => {
    const {
      code,
      data,
      message: msg,
    } = await getInstrumentModal({
      page_index: 1,
      page_size: 9999,
      type_code,
    });
    if (code !== 0) {
      message.error(msg);
      setModelList([]);
      return;
    }
    setModelList(data?.list_info || []);
  };
  useEffect(() => {
    if (open) {
      form?.resetFields();
      console.log("daa===", data);
      if (data.key) {
        getModalData(data.key);
      }
    }
  }, [open, data]);

  const [form] = Form.useForm();

  const handleOk = async () => {
    const { instr_name } = await form.validateFields();
    setSubmitLoading(true);
    try {
      const { code, message: msg } = await createModalOne({
        instr_name: instr_name.label,
      });
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      let obj = modelList.find((item) => item.instr_id == instr_name.value);
      onOk?.({
        ...obj,
        msg: msg || "设备型号添加成功",
      });
    } catch (error) {
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Modal
      title="添加设备型号"
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { padding: 20 } }}
      destroyOnHidden
      confirmLoading={submitLoading}
      onOk={handleOk}
    >
      <Form {...layout} form={form}>
        <Form.Item
          name="instr_name"
          label="设备型号"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="选择设备型号"
            labelInValue
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {modelList.map((item) => (
              <Option key={item.instr_id} value={item.instr_id}>
                {item.instr_name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddModelModal;
