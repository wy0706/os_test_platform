import { getAll as getUserList } from "@/services/system-management/user-management.service";
import { Form, Modal, Select } from "antd";

import { useEffect, useState } from "react";
import { linRateOption, spaceOptions } from "../schemas";
interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  onSelect?: () => void;
  type?: string;
  data?: any;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const LinModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  onSelect,
  type,
  data,
}) => {
  const [form] = Form.useForm();
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const port = Form.useWatch("port", form);

  // 获取所有用户列表
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        pageSize: 1000, // 获取足够多的用户数据
      };
      const result = await getUserList(params);
      if (result?.data) {
        setUserList(result.data);
      }
    } catch (error) {
      console.error("获取用户列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    //当“主从模式”选择从机时，“同步间隔宽度（bit）”不可配，只能为13
    if (port == 2) {
      form.setFieldsValue({
        databits: 13,
      });
    }
  }, [port]);
  useEffect(() => {
    console.log("type====", type);

    if (open) {
      form?.resetFields();
      // 打开弹窗时获取所有用户列表
      // fetchAllUsers();
      // if (isUpdate && data) {
      //   console.log("uodateCalue", data);
      //   formRef.current?.setFieldsValue(data);
      // }

      console.log("uodateCalue====", data);
      form?.setFieldsValue(data);
    }
  }, [open, type, data]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Form values:", values);
        if (onOk) {
          onOk(values);
        }
      })
      .catch((errorInfo) => {
        console.error("Validation failed:", errorInfo);
      });
  };

  return (
    <Modal
      title="设备种类参数配置"
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      styles={{ body: { minHeight: 100, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form {...layout} form={form} name="control-hooks">
        <Form.Item name="port" label="主从模式">
          <Select placeholder="选择主从模式" allowClear>
            <Option value="1">主机</Option>
            <Option value="2">丛机</Option>
          </Select>
        </Form.Item>
        <Form.Item name="rate" label="波特率值">
          <Select
            placeholder="选择波特率值"
            allowClear
            showSearch
            options={linRateOption}
            loading={loading}
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          ></Select>
        </Form.Item>
        <Form.Item name="databits" label="同步间隔宽度(bit)">
          <Select
            placeholder="选择间隔宽度"
            allowClear
            disabled={port == 2}
            showSearch
            // loading={loading}
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {spaceOptions.map((item) => (
              <Option value={item.value} key={item.value}>
                {item.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LinModal;
