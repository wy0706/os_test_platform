import { getList as getUserList } from "@/services/backend-management/user-management.service";
import { createOne } from "@/services/case-management/test-sequence-integration.service";
import { getList as getFiles } from "@/services/equipment-management/equipment-library.service";
import { useModel } from "@umijs/max";
import { useSetState } from "ahooks";
import {
  DatePicker,
  type DatePickerProps,
  Form,
  Input,
  message,
  Modal,
  Select,
} from "antd";
import dayjs, { isDayjs } from "dayjs";
import { useEffect } from "react";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  id?: string | number;
  type: string; //add 新建 edit编辑
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const runSequenceModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  id,
  type,
}) => {
  const [form] = Form.useForm();
  const { initialState } = useModel("@@initialState");
  const { currentUser } = initialState || {};
  const [state, setState] = useSetState<any>({
    confirmLoading: false,
    userList: [],
    fileList: [],
    autoId: null,
  });
  const { confirmLoading, userList, fileList, autoId } = state;
  // 加载树数据
  const getFileList = async () => {
    try {
      const params = {
        page_index: 1,
        page_size: 9999,
        sort: {},
      };
      const { data, code, message: msg } = await getFiles(params);
      if (code !== 0) {
        setState({
          fileList: [],
        });
        message.error(msg || "获取配置文件失败");
        return;
      }
      setState({
        fileList: data?.list_info || [],
      });
    } catch (error) {
      setState({
        fileList: [],
      });
    } finally {
    }
  };
  // 获取所有用户列表
  const fetchAllUsers = async () => {
    try {
      const params = {
        page_index: 1,
        page_size: 9999,
      };
      const { code, data, message: msg } = await getUserList(params);
      if (code !== 0) {
        setState({
          userList: [],
        });
        message.error(msg || "获取用户列表失败");
        return;
      }
      setState({
        userList: data?.list || [],
      });
    } catch (error) {
      setState({
        userList: [],
      });
    }
  };

  useEffect(() => {
    initData();
  }, [open]);

  const initData = async () => {
    if (!open) return;
    form?.resetFields();
    setState({
      autoId: id,
    });
    await fetchAllUsers();
    await getFileList();
    form?.setFieldsValue({
      user_id: {
        label: currentUser?.name,
        value: currentUser?.id,
      },
    });
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    const dt = values.edittime
      ? isDayjs(values.edittime)
        ? values.edittime
        : dayjs(values.edittime)
      : null;
    const edittime = dt ? dt.format("YYYY-MM-DD HH:mm:ss") : null;
    values["edittime"] = edittime;
    let users = values.user_id;
    values["username"] = users?.label;
    values["user_id"] = users?.value;

    // if (!autoId) {
    //   message.error("缺少执行文件ID");
    //   return;
    // }
    try {
      setState({
        confirmLoading: false,
      });

      console.log(values);

      const { code, message: msg } = await createOne({
        ...values,
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
      setState({
        confirmLoading: false,
      });
    }
  };

  return (
    <Modal
      title="测试程序文件信息"
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
      }}
      afterClose={() => {
        form?.resetFields();
        setState({
          autoId: null,
        });
      }}
      confirmLoading={confirmLoading}
      styles={{ body: { padding: 20 } }}
      onOk={handleOk}
    >
      <Form {...layout} form={form}>
        <Form.Item name="model" label="型号">
          <Input placeholder="输入型号" maxLength={32} allowClear />
        </Form.Item>
        <Form.Item name="user_id" label="作者">
          <Select
            placeholder="选择作者"
            labelInValue
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
          </Select>
        </Form.Item>
        <Form.Item name="edittime" label="时间" initialValue={dayjs()}>
          <DatePicker
            showTime
            style={{ width: "100%" }}
            onChange={(value, dateString) => {
              console.log("Selected Time: ", value);
              console.log("Formatted Selected Time: ", dateString);
            }}
            onOk={(value: DatePickerProps["value"]) => {
              console.log("time", value);
            }}
          />
        </Form.Item>
        <Form.Item name="comments" label="说明">
          <Input.TextArea rows={4} placeholder="输入说明" />
        </Form.Item>
        <Form.Item
          name="configfile"
          label="配置文件"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="选择配置文件"
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {fileList.map((item: any) => (
              <Option value={item.file_name} key={item.id}>
                {item.file_name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default runSequenceModal;
