import { getAll as getUserList } from "@/services/system-management/user-management.service";
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  InputRef,
  Modal,
  Row,
  Select,
  Space,
} from "antd";

import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import {
  arbitrationOption,
  COMOptions,
  dataBitsOption,
  domainOption,
  parityOption,
  rateOption,
  stopBitsOption,
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

const ParamModal: React.FC<SetMemberModalProps> = ({
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
        {type === "CAN" && (
          <div>
            <Divider>基础设置</Divider>
            <Form.Item name="name1" label="总线协议">
              <Select
                placeholder="选择总线协议"
                allowClear
                showSearch
                loading={loading}
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                onChange={(value) => {
                  setBusProtocol(value);
                }}
              >
                <Option value="CAN">CAN</Option>
                <Option value="ISO CAN FD">ISO CAN FD</Option>
                <Option value="NON-ISOFD">NON-ISOFD</Option>
              </Select>
            </Form.Item>
            <Row
              gutter={24}
              style={{
                padding: "16px",
              }}
            >
              <Col
                span={12}
                style={{
                  borderRight: "1px solid #f0f0f0",
                  paddingRight: "12px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: "-1px",
                    top: "20%",
                    bottom: "20%",
                    width: "1px",
                    background:
                      "linear-gradient(to bottom, transparent, #e8e8e8, transparent)",
                  }}
                />
                <Divider>仲裁域波特率</Divider>
                <Form.Item name="name2" label="波特率">
                  <Select
                    placeholder="选择波特率"
                    allowClear
                    showSearch
                    options={arbitrationOption}
                    loading={loading}
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  ></Select>
                </Form.Item>
                <Form.Item name="name3" label="BRP">
                  <InputNumber
                    placeholder="输入BRP"
                    min={1}
                    max={255}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item name="name4" label="SEG1">
                  <InputNumber
                    placeholder="输入SEG1"
                    min={2}
                    max={255}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item name="name5" label="SEG2">
                  <InputNumber
                    placeholder="输入SEG2"
                    min={1}
                    max={128}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item name="name6" label="SJW">
                  <InputNumber
                    placeholder="输入SJW"
                    min={1}
                    max={128}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: " 12px 0",
                  }}
                >
                  <span>采样点 :</span>
                  <span> 75.0%</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: " 12px 0",
                  }}
                >
                  <span>波特率 :</span>
                  <span>1.0Mbps</span>
                </div>
              </Col>

              <Col span={12} style={{ paddingLeft: "12px" }}>
                <Divider>数据域波特率</Divider>
                <Form.Item name="name7" label="波特率">
                  <Select
                    disabled={busProtocol === "CAN"}
                    placeholder="选择波特率"
                    allowClear
                    showSearch
                    options={domainOptions}
                    loading={loading}
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    popupRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: "8px 0" }} />
                        <Space style={{ padding: "0 8px 4px" }}>
                          <Input
                            placeholder="输入波特率"
                            ref={inputdomainRef}
                            value={domainName}
                            onChange={demainNameChange}
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                          <Button
                            type="text"
                            icon={<PlusOutlined />}
                            onClick={addDemainItem}
                          >
                            自定义
                          </Button>
                        </Space>
                      </>
                    )}
                  ></Select>
                </Form.Item>
                <Form.Item name="name8" label="BRP">
                  <InputNumber
                    disabled={busProtocol === "CAN"}
                    placeholder="输入BRP"
                    min={1}
                    max={255}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item name="name9" label="SEG1">
                  <InputNumber
                    min={1}
                    max={32}
                    disabled={busProtocol === "CAN"}
                    placeholder="输入SEG1"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item name="name10" label="SEG2">
                  <InputNumber
                    min={1}
                    max={16}
                    disabled={busProtocol === "CAN"}
                    placeholder="输入SEG2"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item name="name11" label="SJW">
                  <InputNumber
                    min={1}
                    max={16}
                    disabled={busProtocol === "CAN"}
                    placeholder="输入SJW"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: " 12px 0",
                  }}
                >
                  <span>采样点 :</span>
                  <span> 75.0%</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: " 12px 0",
                  }}
                >
                  <span>波特率 :</span>
                  <span>1.0Mbps</span>
                </div>
              </Col>
            </Row>
          </div>
        )}
        {type === "LIN" && <div>LIN</div>}
        {type !== "CAN" && type !== "LIN" && (
          <div>
            <Form.Item name="port" label="端口">
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
            <Form.Item name="databits" label="数据位">
              <Select
                placeholder="选择数据位"
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
            <Form.Item name="stopbits" label="停止位">
              <Select
                placeholder="选择停止位"
                allowClear
                showSearch
                loading={loading}
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {stopBitsOption.map((item) => (
                  <Option value={item.value} key={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="parity" label="奇偶校验">
              <Select
                placeholder="选择奇偶校验"
                allowClear
                showSearch
                loading={loading}
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {parityOption.map((item) => (
                  <Option value={item.value} key={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default ParamModal;
