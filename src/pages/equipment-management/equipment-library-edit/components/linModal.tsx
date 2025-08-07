import { getAll as getUserList } from "@/services/system-management/user-management.service";
import { Form, InputRef, Modal, Select } from "antd";

import { useEffect, useRef, useState } from "react";
import {
  COMOptions,
  dataBitsOption,
  domainOption,
  rateOption,
} from "../schemas";
interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  onSelect?: () => void;
  type?: string;
  data?: any;
}
const { Option } = Select;

let index = 0;
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
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [busProtocol, setBusProtocol] = useState(null); //CAN 总线协议

  const [domainOptions, setDomainOptions] = useState(domainOption);
  const [domainName, setDomainName] = useState("");
  const inputdomainRef = useRef<InputRef>(null);

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
    console.log("type====", type);

    if (open) {
      form?.resetFields();
      // 打开弹窗时获取所有用户列表
      // fetchAllUsers();
      // if (isUpdate && data) {
      //   console.log("uodateCalue", data);
      //   formRef.current?.setFieldsValue(data);
      // }
      if ((type === "edit" || type === "copy") && data) {
        console.log("uodateCalue====", data);
        form?.setFieldsValue(data);
      }
    }
  }, [open, type, data]);

  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log(values);
  };

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

  const demainNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDomainName(event.target.value);
  };

  const addDemainItem = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    e.preventDefault();
    setDomainOptions;
    setDomainOptions([
      ...domainOptions,
      {
        value: domainName || `New item ${index++}`,
        label: domainName || `New item ${index++}`,
      },
    ]);
    setDomainName(e.target.value);
    setTimeout(() => {
      inputdomainRef.current?.focus();
    }, 0);
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
      <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
        <Form.Item name="port" label="主从模式">
          <Select
            placeholder="选择主从模式"
            allowClear
            showSearch
            loading={loading}
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {COMOptions.map((com) => (
              <Option key={com} value={com}>
                {com}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="rate" label="波特率">
          <Select
            placeholder="选择波特率 "
            allowClear
            showSearch
            options={rateOption}
            loading={loading}
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          ></Select>
        </Form.Item>
        <Form.Item name="databits" label="同步间隔宽度">
          <Select
            placeholder="选择间隔宽度"
            allowClear
            showSearch
            loading={loading}
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {dataBitsOption.map((item) => (
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
