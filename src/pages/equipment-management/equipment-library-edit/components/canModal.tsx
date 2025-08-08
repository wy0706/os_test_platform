import { getAll as getUserList } from "@/services/system-management/user-management.service";
import { useSetState } from "ahooks";
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  InputRef,
  message,
  Modal,
  Row,
  Select,
  Space,
  Tooltip,
} from "antd";

import { InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { arbitrationOption, domainOption } from "../schemas";
interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  onSelect?: () => void;
  data?: any;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const CanModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  onSelect,
  data,
}) => {
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // 仲裁与域波特率
  const inputArbitRef = useRef<InputRef>(null);
  // 数据域波特率
  const inputdomainRef = useRef<InputRef>(null);

  const [state, setSate] = useSetState<any>({
    arbitOptions: arbitrationOption,
    arbitName: "",
    domainOptions: domainOption,
    domainName: "",
    busProtocol: "", //CAN 总线协议
    arbitCheck: false, //是否选择计算器
    domainCheck: false, //是否选择计算器
    arbitPoint: 0, //仲裁域采样点
    arbitBaudRate: 0,
    domainPoint: 0, //数据域采样点
    domainBaudRate: 0,
  });
  const {
    arbitCheck,
    domainCheck,
    arbitOptions,
    arbitName,
    domainOptions,
    domainName,
    busProtocol,
    arbitPoint,
    arbitBaudRate,
    domainPoint,
    domainBaudRate,
  } = state;
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
    if (open) {
      form?.resetFields();
      // 打开弹窗时获取所有用户列表
      // fetchAllUsers();
      // if (isUpdate && data) {
      //   console.log("uodateCalue", data);
      //   formRef.current?.setFieldsValue(data);
      // }
    }
  }, [open, data]);

  const [form] = Form.useForm();

  //  监听 仲裁域波特率计算采样点 波特率
  const name2 = Form.useWatch("name2", form);
  const name3 = Form.useWatch("name3", form);
  const name4 = Form.useWatch("name4", form);
  const name5 = Form.useWatch("name5", form);
  const name61 = Form.useWatch("name61", form);
  const remember = Form.useWatch("remember", form);

  //name7 name8 name9 name10 name62 remember1
  const name7 = Form.useWatch("name7", form);
  const name8 = Form.useWatch("name8", form);
  const name9 = Form.useWatch("name9", form);
  const name10 = Form.useWatch("name10", form);
  const name62 = Form.useWatch("name62", form);
  const remember1 = Form.useWatch("remember1", form);
  useEffect(() => {
    setSate({
      arbitCheck: remember,
    });
    setSate({
      arbitPoint: name4 && name5 ? handlePoint(name4, name5) : 0,
    });
    if (remember) {
      if (name3 && name4 && name5 && name61) {
        console.log("111", 1);

        setSate({
          arbitBaudRate: handleRate(name61, name3, name4, name5),
        });
      } else {
        setSate({
          arbitBaudRate: name2 ? name2 : 0,
        });
      }
    } else {
      setSate({
        arbitBaudRate: name2 ? name2 : 0,
      });
    }
  }, [name2, name3, name4, name5, name61, remember]);

  useEffect(() => {
    setSate({
      domainCheck: remember1,
    });
    setSate({
      doaminPoint: name9 && name10 ? handlePoint(name9, name10) : 0,
    });
    if (remember1) {
      if (name8 && name9 && name10 && name62) {
        setSate({
          domainBaudRate: handleRate(name62, name8, name9, name10),
        });
      } else {
        setSate({
          domainBaudRate: name7 ? name7 : 0,
        });
      }
    } else {
      setSate({
        domainBaudRate: name7 ? name7 : 0,
      });
    }
  }, [name7, name8, name9, name10, name62, remember1]);

  const handleOk = () => {
    console.log("ok");

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
    console.log("eeee", event.target.value);
    setSate({
      domainName: event.target.value,
    });
  };
  const arbitNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("eeee", event.target.value);
    setSate({
      arbitName: event.target.value,
    });
  };
  const addDemainItem = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    e.preventDefault();
    if (!domainName) {
      message.info("请先输入波特率");
      return;
    }
    setSate({
      domainOptions: [
        ...domainOptions,
        {
          value: domainName,
          label: `${domainName} Kbps`,
        },
      ],
      domainName: "",
    });
    setTimeout(() => {
      inputdomainRef.current?.focus();
    }, 0);
  };
  const addArbitItem = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    e.preventDefault();
    if (!arbitName) {
      message.info("请先输入波特率");
      return;
    }
    setSate({
      arbitOptions: [
        ...arbitOptions,
        {
          value: arbitName,
          label: `${arbitName} Kbps`,
        },
      ],
      arbitName: "",
    });
    setTimeout(() => {
      inputdomainRef.current?.focus();
    }, 0);
  };
  // 波特率计算： Clk/(brp * (1+bs1+bs2))
  const handleRate = (CLK: any, BRP: any, BS1: any, BS2: any) => {
    let rate = (
      Number(CLK) /
      (Number(BRP) * (1 + Number(BS1) + Number(BS2)))
    ).toFixed(1);
    return rate;
  };
  // 采样点计算
  const handlePoint = (BS1: any, BS2: any, rate?: any) => {
    let ponit = (
      ((1 + Number(BS1)) / (1 + Number(BS1) + Number(BS2))) *
      100
    ).toFixed(1);
    return `${ponit}%`;
  };

  return (
    <>
      <Modal
        title="设备种类参数配置"
        maskClosable={false}
        open={open}
        onCancel={() => {
          form?.resetFields();
          onCancel && onCancel();
        }}
        styles={{ body: { minHeight: 100, padding: 20 } }}
        width={"50%"}
        onOk={handleOk}
      >
        <Form {...layout} form={form} name="control-hooks">
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
                setSate({ busProtocol: value });
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
              <Form.Item
                name="name2"
                label="波特率"
                tooltip={{
                  title: "可通过选择波特率计算器进行计算",
                  icon: <InfoCircleOutlined />,
                }}
              >
                <Select
                  placeholder="选择波特率"
                  allowClear
                  showSearch
                  options={arbitOptions}
                  // loading={loading}
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
                          ref={inputArbitRef}
                          value={arbitName}
                          onChange={(e) => {
                            const value = e.target.value;
                            // 只允许输入数字
                            if (/^\d*$/.test(value)) {
                              arbitNameChange(e);
                            }
                          }}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={addArbitItem}
                        >
                          自定义波特率
                        </Button>
                      </Space>
                    </>
                  )}
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
              <Form.Item
                name="name6"
                label="SJW"
                tooltip={{
                  title: "若CAN系统时钟误差较大，可以适当调大SJW值",
                  icon: <InfoCircleOutlined />,
                }}
              >
                <InputNumber
                  placeholder="输入SJW"
                  min={1}
                  max={128}
                  style={{ width: "100%" }}
                />
              </Form.Item>
              {arbitCheck ? (
                <Form.Item
                  initialValue={40}
                  name="name61"
                  label="CAN时钟"
                  tooltip={{
                    title: "BaudRate=CLK/(BRP*(1+BS1+BS2))",
                    icon: <InfoCircleOutlined />,
                  }}
                >
                  <InputNumber
                    placeholder="输入CAN时钟进行波特率计算"
                    min={1}
                    style={{ width: "100%" }}
                    addonAfter="MHz"
                    onChange={(value) => {
                      console.log("输入CAN时钟进行波特率计算", value);

                      const { name3, name4, name5 } = form.getFieldsValue();
                      if (value && name3 && name4 && name5) {
                        let m = handleRate(value, name3, name4, name5);
                        setSate({
                          arbitBaudRate: m,
                        });
                      }
                    }}
                  />
                </Form.Item>
              ) : null}
              <Form.Item name="remember" valuePropName="checked">
                <Checkbox>波特率计算器</Checkbox>
              </Form.Item>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: " 12px 0",
                }}
              >
                <span>采样点 :</span>
                {/* 采样点计算公式:SamplePoint=((1+BS1)/(1+BS1+BS2))*100% */}
                {/* name4 name5  bs1相当于seg1*/}
                {/* 采样点设置推荐:波特率大于800K时设置为75%，大于500K时设置为80%，小于等于500K时设置为87.5% */}
                <span> {arbitPoint}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: " 12px 0",
                }}
              >
                <div>
                  波特率 &nbsp;
                  <Tooltip title="最好选择误差值为0的波特率参数，或者误差尽量小的参数">
                    <InfoCircleOutlined />
                  </Tooltip>{" "}
                  :
                </div>
                <span>{arbitBaudRate} Kbps</span>
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
                  // loading={loading}
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
                          onChange={(e) => {
                            const value = e.target.value;
                            // 只允许输入数字
                            if (/^\d*$/.test(value)) {
                              demainNameChange(e);
                            }
                          }}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={addDemainItem}
                        >
                          自定义波特率
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
              {domainCheck ? (
                <Form.Item
                  initialValue={40}
                  name="name62"
                  label="CAN时钟"
                  tooltip={{
                    title: "BaudRate=CLK/(BRP*(1+BS1+BS2))",
                    icon: <InfoCircleOutlined />,
                  }}
                >
                  <InputNumber
                    placeholder="输入CAN时钟进行波特率计算"
                    min={1}
                    style={{ width: "100%" }}
                    addonAfter="MHz"
                  />
                </Form.Item>
              ) : null}
              <Form.Item name="remember1" valuePropName="checked">
                <Checkbox>波特率计算器</Checkbox>
              </Form.Item>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: " 12px 0",
                }}
              >
                <span>采样点 :</span>
                <span> {domainPoint}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: " 12px 0",
                }}
              >
                <div>
                  波特率 &nbsp;
                  <Tooltip title="最好选择误差值为0的波特率参数，或者误差尽量小的参数">
                    <InfoCircleOutlined />
                  </Tooltip>{" "}
                  :
                </div>
                <span>{domainBaudRate}Mbps</span>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default CanModal;
