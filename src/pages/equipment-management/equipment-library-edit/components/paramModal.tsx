import { updateTypeAndModal } from "@/services/equipment-management/equipment-library-edit.service";
import { Form, Input, message, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import {
  COMOptions,
  dataBitsOption,
  isValidIP,
  isValidPort,
  linRateOption,
  parityOption,
  rateOption,
  spaceOptions,
  stopBitsOption,
} from "../schemas";
interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  data?: any;
  type: any;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const ParamModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  data,
  type,
}) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const port = Form.useWatch("param6", form); // "1" | "2"

  useEffect(() => {
    initData();
  }, [open, data, type]);
  // 1) 拆分：保留空位 + 去两侧空格
  const splitParas = (paras?: any) =>
    String(paras ?? "")
      .split(",")
      .map((s) => s.trim());

  // 2) 选择器值校验：值在 options 中则用之；不在则取第一个；但空字符串 "" 原样保留
  const getValidValue = (value: any, options: any[]) => {
    if (value === "") return ""; // 用户传空就保持空
    if (!options || options.length === 0) return value;
    const values = options.map((o) =>
      typeof o === "object" ? o.value ?? o : o
    );
    return values.includes(value) ? value : values[0];
  };

  // 3) 生成赋值数组：
  //    - FRONT: 从开头取 n 个；PXI 用 BACK：从末尾取 n 个
  //    - 截断/补齐长度
  const pickForType = (parts: string[], n: number, mode: "FRONT" | "BACK") => {
    let picked = mode === "BACK" ? parts.slice(-n) : parts.slice(0, n);
    if (picked.length < n)
      picked = picked.concat(Array(n - picked.length).fill(""));
    if (picked.length > n) picked = picked.slice(0, n);
    return picked;
  };

  // 4) 仅过滤 undefined，保留空字符串
  const setIfAny = (obj: Record<string, any>) =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
  const initData = () => {
    if (!open) return;
    form?.resetFields();

    const parts = splitParas(data?.paras);

    switch (type) {
      /** ------------ RS232：前 5 个 -------------- */
      case "RS232": {
        const [p1, p2, p3, p4, p5] = pickForType(parts, 5, "FRONT");
        form.setFieldsValue(
          setIfAny({
            param1: getValidValue(p1, COMOptions),
            param2: getValidValue(p2, rateOption),
            param3: getValidValue(p3, dataBitsOption),
            param4: getValidValue(p4, stopBitsOption),
            param5: getValidValue(p5, parityOption),
          })
        );
        return;
      }

      /** -------------- LIN：前 3 个 -------------- */
      case "LIN": {
        const [mode, rate, space] = pickForType(parts, 3, "FRONT");
        form.setFieldsValue(
          setIfAny({
            param6: getValidValue(mode, [{ value: "1" }, { value: "2" }]),
            param7: getValidValue(rate, linRateOption),
            param8: getValidValue(space, spaceOptions),
          })
        );
        return;
      }

      /** -------- TCPIP：前 2 个（多余丢弃） -------- */
      case "TCPIP": {
        // 例："192.168.110.212,30000,  " -> ["192.168.110.212","30000",""]
        // 赋值只取前两位 -> IP/端口
        const [ip, port] = pickForType(parts, 2, "FRONT");
        form.setFieldsValue(
          setIfAny({
            param9: ip,
            param10: port,
          })
        );
        return;
      }

      /** -------- PXI：后 2 个（默认取后两位） ------- */
      case "PXI": {
        const [chassis, slot] = pickForType(parts, 2, "BACK");

        console.log("chassis", chassis);
        console.log("slot", slot);

        form.setFieldsValue(
          setIfAny({
            param11: chassis,
            param12: slot,
          })
        );
        return;
      }

      default:
        return;
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (type === "TCPIP") {
        const ip = values.param9;
        const port = values.param10;

        if (!ip || !isValidIP(ip)) {
          form.setFields([
            { name: "param9", errors: ["请输入合法的 IP 地址"] },
          ]);
          form.scrollToField("param9", { block: "center" });
          return;
        }

        if (!port || !isValidPort(port)) {
          form.setFields([
            { name: "param10", errors: ["端口号必须为 0-65535 的整数"] },
          ]);
          form.scrollToField("param10", { block: "center" });
          return;
        }
      }
      let parasArr: string[] = [];
      switch (type) {
        case "RS232":
          parasArr = [
            values.param1,
            values.param2,
            values.param3,
            values.param4,
            values.param5,
          ];
          break;
        case "LIN":
          parasArr = [values.param6, values.param7, values.param8];
          break;
        case "TCPIP":
          parasArr = [values.param9, values.param10];
          break;
        case "PXI":
          parasArr = [0, values.param11, values.param12];
          break;
        default:
          parasArr = [];
      }

      const hasEmpty = parasArr.some(
        (item) =>
          item === undefined || item === null || String(item).trim() === ""
      );
      if (hasEmpty) {
        Modal.warning({
          title: "参数不完整",
          content: "请填写所有必填参数后再提交。",
        });
        return;
      }
      const paras = parasArr.join(",");

      const submitData = { paras, type };
      setConfirmLoading(true);
      // await Promise.resolve(onOk?.(submitData));
      console.log("data", data);
      const params = {
        index: data.instr_id,
        paras,
      };
      const { code, message: msg } = await updateTypeAndModal(params);
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");
      onOk?.(paras);
    } catch (err) {
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <Modal
      title="设备种类参数配置"
      maskClosable={false}
      open={open}
      onCancel={() => {
        form?.resetFields();
        onCancel && onCancel();
      }}
      destroyOnHidden
      confirmLoading={confirmLoading}
      styles={{ body: { minHeight: 100, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form {...layout} form={form}>
        {type && type == "RS232" && (
          <>
            <Form.Item name="param1" label="端口" rules={[{ required: true }]}>
              <Select
                placeholder="选择设备类型"
                showSearch
                allowClear
                options={COMOptions}
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              ></Select>
            </Form.Item>
            <Form.Item
              name="param2"
              label="波特率"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="选择波特率"
                showSearch
                allowClear
                options={rateOption}
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              ></Select>
            </Form.Item>
            <Form.Item
              name="param3"
              label="数据位"
              initialValue={"8"}
              rules={[{ required: true }]}
            >
              <Select
                placeholder="选择数据位"
                showSearch
                allowClear
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
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
            <Form.Item
              name="param4"
              label="停止位"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="选择停止位"
                showSearch
                allowClear
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
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
            <Form.Item
              name="param5"
              label="奇偶校验"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="选择奇偶校验"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
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
          </>
        )}
        {type && type == "LIN" && (
          <>
            <Form.Item
              name="param6"
              label="主从模式"
              rules={[{ required: true }]}
            >
              <Select placeholder="选择主从模式" allowClear>
                <Option value="1">master</Option>
                <Option value="2">slave</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="param7"
              label="波特率值"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="选择波特率值"
                showSearch
                allowClear
                options={linRateOption}
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              ></Select>
            </Form.Item>
            <Form.Item
              name="param8"
              label="同步间隔宽度(bit)"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="选择间隔宽度"
                disabled={port == "2"}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
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
          </>
        )}
        {type && type == "TCPIP" && (
          <>
            <Form.Item
              name="param9"
              label="IP地址"
              rules={[{ required: true }]}
            >
              <Input placeholder="输入IP地址" allowClear />
            </Form.Item>
            <Form.Item
              name="param10"
              label="端口号"
              rules={[{ required: true }]}
            >
              <Input placeholder="输入端口号" allowClear />
            </Form.Item>
          </>
        )}{" "}
        {type && type == "PXI" && (
          <>
            <Form.Item
              name="param11"
              label="PXI机箱地址"
              rules={[{ required: true }]}
            >
              <Input placeholder="输入PXI机箱地址" allowClear />
            </Form.Item>
            <Form.Item name="param12" label="Slot" rules={[{ required: true }]}>
              <Input placeholder="输入Slot" allowClear />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default ParamModal;
