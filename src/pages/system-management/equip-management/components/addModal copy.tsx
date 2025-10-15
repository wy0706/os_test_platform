import { getInstrumentType } from "@/services/equipment-management/equipment-library-edit.service";
import {
  updateModelOne,
  uploadFile as uploadFileService,
} from "@/services/system-management/equip-management.service";
import { isArray } from "@/utils";
import { InfoCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { useSetState } from "ahooks";
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Upload,
} from "antd";
import { useEffect } from "react";
import { interfOptons } from "../schemas";
interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  type: string;
  updateValue?: any;
  group_id: any;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const AddModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  type,
  updateValue,
  group_id,
}) => {
  const options = Array.from({ length: 20 }, (_, i) => ({
    label: String(i + 1),
    value: i + 1,
  }));

  const [state, setState] = useSetState<any>({
    title: "新建",
    typeList: [],
    confirmLoading: false,
    fileList: [], // ✅ 用于回显/展示
  });
  const { title, typeList, confirmLoading, fileList } = state;
  const fetchTypeData: any = async () => {
    try {
      const { code, data } = await getInstrumentType({ route: 1 });
      if (code !== 0) {
        setState({ typeList: [] });
        return;
      }
      setState({ typeList: data?.list_info || [] });
    } catch {
      setState({ typeList: [] });
    }
  };

  const getNameFromPath = (p?: string) => {
    if (!p) return "";
    try {
      const url = new URL(p, window.location.origin); // 兼容绝对/相对
      const pathname = url.pathname || p;
      return decodeURIComponent(pathname.split("/").pop() || p);
    } catch {
      // 不是 URL，当作路径或纯文件名
      return decodeURIComponent((p.split("/").pop() || p).split("?")[0]);
    }
  };

  const initData = async () => {
    if (open) {
      form?.resetFields();
      const name = type === "add" ? "新建" : "编辑";
      setState({ title: name });
      await fetchTypeData();
      if (type === "edit") {
        form?.setFieldsValue({
          ...updateValue,
          instr_model: updateValue.instr_name,
          file: updateValue.file || undefined, // ✅ 回填隐藏字段
        });

        if (updateValue?.file) {
          const existed = {
            uid: "-1",
            name: getNameFromPath(updateValue.file) || "已上传文件.dll",
            status: "done" as const,
            url: updateValue.file, // 如果可下载/可预览，Upload 列表名可点
          };
          setState({ fileList: [existed] });
        }
      } else {
        form?.setFieldsValue({
          group_id: group_id == "all" ? undefined : group_id,
        });
      }
    }
  };
  useEffect(() => {
    initData();
  }, [open, type, updateValue]);

  const [form] = Form.useForm();
  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      const { code, data, message: msg } = await uploadFileService({ file });
      if (code !== 0) {
        message.error(msg || "上传失败");
        setState({ fileList: [] });
        onError?.(new Error(msg || "上传失败"));
        return;
      }

      // 上传成功：更新 fileList 与表单字段
      const newFile = {
        uid: file.uid,
        name: file.name,
        status: "done" as const,
        url:
          data ||
          "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimage109.360doc.com%2FDownloadImg%2F2025%2F04%2F0321%2F296122601_4_20250403090445718&refer=http%3A%2F%2Fimage109.360doc.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1763088297&t=5ebfe24c31fc65667d74afd53c02bbcc",
      };
      setState({ fileList: [newFile] });
      form.setFieldsValue({ file: data });
      message.success("上传成功");
      onSuccess?.(data, file);
    } catch (err) {
      message.error("上传异常");
      setState({ fileList: [] });
      onError?.(err);
    }
  };

  const beforeUpload = (file: any) => {
    // 生产环境改为 /\.dll$/i.test(file.name)
    const isTestMode = true; // 只是测试时允许
    const isAllowed = isTestMode || /\.dll$/i.test(file.name);
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isAllowed) {
      message.error("仅允许上传 .dll 文件");
      return Upload.LIST_IGNORE;
    }
    if (!isLt2M) {
      message.error("文件必须小于 2MB");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleOk = async () => {
    const values = await form.validateFields();

    const { code, message: msg } = await updateModelOne({
      instr_id: updateValue && updateValue.instr_id,
      ...values,
    });
    if (code !== 0) {
      message.error(msg || "操作失败");
      return;
    }
    message.success(msg || "操作成功");
    console.log("Form values:", values);
    if (onOk) {
      onOk(values);
    }
  };

  return (
    <Modal
      title={`${title}设备`}
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      afterClose={() => form?.resetFields()}
      confirmLoading={confirmLoading}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
    >
      <Form {...layout} form={form}>
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Form.Item
              name="group_id"
              label="设备类型"
              rules={[{ required: true }]}
            >
              {/* 不可编辑，设备类选中就已确定 */}
              <Select
                placeholder="选择设备类型"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {isArray(typeList) &&
                  typeList.length > 0 &&
                  typeList.map((item) => (
                    <Option value={item.group_id} key={item.group_id}>
                      {item.group_name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            {" "}
            <Form.Item
              name="is_active"
              // rules={[{ required: true }]}
              label="激活"
              initialValue={"1"}
            >
              <Select placeholder="选择是否激活" allowClear>
                <Option value="1">✓</Option>
                <Option value="0">✗</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col span={12}>
            {" "}
            <Form.Item
              name="instr_model"
              label="设备型号"
              rules={[{ required: true }]}
            >
              <Input placeholder="输入设备型号" allowClear />
            </Form.Item>
          </Col>{" "}
          <Col span={12}>
            {" "}
            <Form.Item
              name="interface"
              label="接口"
              // rules={[{ required: true }]}
            >
              <Select
                placeholder="选择接口"
                allowClear
                showSearch
                options={interfOptons}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Form.Item
              name="modulesmax"
              label="通道"
              // rules={[{ required: true }]}
              initialValue={1}
            >
              <Select
                placeholder="选择通道"
                options={options}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "").toString().includes(input)
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            {" "}
            <Form.Item
              name="defaultparas"
              label="默认参数"
              // rules={[{ required: true }]}
            >
              <Input
                allowClear
                placeholder="输入默认参数，各参数间用逗号分隔"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Form.Item
              label="API DLL"
              rules={[
                {
                  validator: (_, v) => {
                    // 如果已有回显或已上传新的，就通过
                    if (form.getFieldValue("file")) return Promise.resolve();
                    return Promise.reject(new Error("请上传 DLL 文件"));
                  },
                },
              ]}
              tooltip={{
                title: "支持扩展名： .dll",
                icon: <InfoCircleOutlined />,
              }}
            >
              <Upload
                customRequest={handleUpload}
                beforeUpload={beforeUpload}
                accept=".xls,.xlsx, .docx, .dll"
                fileList={fileList}
                maxCount={1}
                showUploadList={false}
                onRemove={() => {
                  form.setFieldsValue({ file: undefined });
                  setState({ fileList: [] });
                }}
              >
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="file" hidden>
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddModal;
