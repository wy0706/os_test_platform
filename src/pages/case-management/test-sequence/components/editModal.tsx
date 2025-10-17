import {
  copySequence,
  getTypeList,
  updateSequence,
} from "@/services/case-management/test-sequence.service";
import { isArray } from "@/utils";
import { useSetState } from "ahooks";
import { Form, Input, message, Modal, Select, TreeSelect } from "antd";
import { useEffect } from "react";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  type: string;
  updateValue?: any;
  currentNode?: string;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const EditModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  type,
  updateValue,
  currentNode,
}) => {
  const [state, setState] = useSetState<any>({
    treeData: [],
    title: "add",
    confirmLoading: false,
  });
  const { treeData, title, confirmLoading } = state;
  const [form] = Form.useForm();
  //  序列类型
  const loadTreeData = async () => {
    try {
      const { code, data, message: msg } = await getTypeList();

      if (code !== 0) {
        message.error(msg || "获取序列类型失败");
        setState({
          treeData: [],
        });
        return;
      }
      let list =
        isArray(data) && data.length > 0
          ? data.map((item) => ({
              ...item,
              selectable: false,
            }))
          : [];
      setState({
        treeData: list,
      });
      console.log("list", list);
    } catch (error) {
      setState({
        treeData: [],
      });
    }
  };
  const initData = async () => {
    if (!open) return;
    form?.resetFields();
    await loadTreeData();
    const name = type == "copy" ? "复制" : "移动";
    setState({
      title: name,
    });
    updateValue && form.setFieldsValue({ ...updateValue });
    if (updateValue?.tigroup) {
      // label 可以等加载完后从 treeData 查一次
      const findLabel = (nodes: any[]): any => {
        for (const n of nodes) {
          if (String(n.key) === String(currentNode)) return n.title;
          if (n.children) {
            const got = findLabel(n.children);
            if (got) return got;
          }
        }
      };
      const label = findLabel(treeData) || "";
      form.setFieldsValue({ tigroup: { value: currentNode, label } });
    }
  };
  useEffect(() => {
    initData();
  }, [open, type, updateValue]);

  const onFinish = (values: any) => {
    console.log(values);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    console.log("Form values:", values);

    try {
      setState({
        confirmLoading: true,
      });
      values["tigroup"] = values.tigroup?.label ?? "";
      values["sequence_id"] = updateValue.sequence_id;
      if (type == "copy") {
        const { code, message: msg } = await copySequence({ ...values });
        if (code !== 0) {
          message.error(msg || "操作失败");
          return;
        }
        message.success(msg || "操作成功");
      }
      if (type == "remove") {
        const { code, message: msg } = await updateSequence({
          ...values,
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
    } finally {
      setState({
        confirmLoading: false,
      });
    }
  };

  return (
    <Modal
      title={`${title}序列`}
      maskClosable={false}
      open={open}
      onCancel={() => {
        onCancel && onCancel();
        form?.resetFields();
      }}
      styles={{ body: { padding: 20 } }}
      width={"50%"}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
        {type && type !== "remove" && (
          <Form.Item
            name="sequence_name"
            label="序列名称"
            rules={[{ required: true }]}
          >
            <Input placeholder="输入序列名称" maxLength={32} />
          </Form.Item>
        )}
        {/* 树级结构 二级 */}
        {type && (type === "copy" || type === "remove") && (
          <Form.Item
            name="tigroup"
            label="序列类型"
            rules={[{ required: true }]}
          >
            <TreeSelect
              labelInValue
              fieldNames={{ label: "title", value: "key" }}
              showSearch
              treeNodeFilterProp="title"
              style={{ width: "100%" }}
              listHeight={400}
              filterTreeNode={(input, treeNode) =>
                String(treeNode?.title ?? "")
                  .toLowerCase()
                  .includes(String(input).toLowerCase())
              }
              placeholder="选择序列类型"
              allowClear
              treeDefaultExpandAll
              treeData={treeData}
            />
          </Form.Item>
        )}
        {type && type !== "remove" && (
          <Form.Item name="is_published" label="是否发布">
            <Select placeholder="选择是否发布">
              <Option value="True">✓</Option>
              <Option value="False">✗</Option>
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default EditModal;
