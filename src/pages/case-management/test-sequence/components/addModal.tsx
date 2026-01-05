import { saveData } from "@/services/case-management/test-sequence-edit.service";
import {
  createSequence,
  getTypeList,
  updateSequence,
} from "@/services/case-management/test-sequence.service";
import { isArray } from "@/utils";
import { useSetState } from "ahooks";
import { Button, Form, Input, message, Modal, Select, TreeSelect } from "antd";
import { useEffect } from "react";
import PlanModal from "./planModal";
interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  updateValue?: any;
  currentNode?: string;
  type: "add" | "edit" | "saveAs" | "save"; //'add' 'edit' 'saveAs' 'save'
  onSelect?: () => void;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const AddModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  updateValue,
  currentNode,
  type,
  onSelect,
}) => {
  const [state, setState] = useSetState<any>({
    treeData: [],
    title: "add",
    isPlanModalOpen: false,
    selectTestData: [],
    confirmLoading: false,
    columns: [
      {
        title: "名称",
        dataIndex: "title",
        // render: (text: any, record: any) => {
        //   return (
        //     <div>
        //       {record?.text} {record?.description}
        //     </div>
        //   );
        // },
      },
      {
        title: "重要程度",
        dataIndex: "importance",
      },
    ],
  });
  const {
    treeData,
    title,
    isPlanModalOpen,
    selectTestData,
    columns,
    confirmLoading,
  } = state;

  //  序列类型
  const loadTreeData = async () => {
    try {
      const { code, data, message: msg } = await getTypeList();
      if (code !== 0) {
        message.error(msg || "获取序列类型失败");
        setState({
          treeData: [],
        });
        return [];
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
      return list;
    } catch (error) {
      setState({
        treeData: [],
      });
      return [];
    }
  };

  const initData = async () => {
    if (!open) return;
    const name = type === "add" ? "新建" : type === "edit" ? "编辑" : "另存为";
    setState({ title: name });
    form.resetFields();

    const list = await loadTreeData(); // 用返回的“新鲜”list

    if (type !== "edit" && currentNode) {
      const findLabel = (nodes: any[]): any => {
        for (const n of nodes) {
          if (String(n.key) === String(currentNode)) return n.title;
          if (n.children) {
            const got = findLabel(n.children);
            if (got) return got;
          }
        }
      };

      form.setFieldsValue({ tigroup: { value: currentNode } });

      // form.setFieldsValue({ tigroup: { value: currentNode, label: findLabel(list) || "" } });
    }

    if (type === "edit" && updateValue) {
      form.setFieldsValue({ ...updateValue });
      const list = Array.isArray(updateValue?.tc_title)
        ? updateValue.tc_title.map((row: any) => ({
            ...row,
            id: Number(row.id),
          }))
        : [];
      setState({ selectTestData: list });
    }
  };

  useEffect(() => {
    initData();
  }, [open, updateValue]);

  const [form] = Form.useForm();
  const lookupLabelByValue = (nodes: any[], value: any): string | undefined => {
    for (const n of nodes || []) {
      if (String(n.key) === String(value)) return n.title;
      const got = lookupLabelByValue(n.children || [], value);
      if (got) return got;
    }
  };
  const handleOk = async () => {
    const values = await form.validateFields();

    const apiFn =
      type === "add"
        ? createSequence
        : type === "edit"
        ? updateSequence
        : saveData;
    try {
      let label = values?.tigroup?.label;
      const value = values?.tigroup?.value;
      if (!label && value) {
        label = lookupLabelByValue(treeData, value) || "";
      }
      const params: any = {
        ...values,
        tigroup: label ?? "",
        sequence_id: updateValue?.sequence_id,
      };

      if (type === "edit" && !params?.sequence_id) {
        message.error("缺少必要的参数 sequence_id");
        return;
      }
      if (type === "add" && !params.tigroup) {
        message.warning("请选择序列类型");
        return;
      }
      // 另存为和新建时， 不传 sequence_id
      if (type === "saveAs" || type === "add") delete params.sequence_id;

      if (type === "edit") delete params.tigroup;
      setState({
        confirmLoading: true,
      });
      const { code, message: msg } = await apiFn({ ...params });
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      message.success(msg || "操作成功");
      onOk && onOk(params);
    } finally {
      setState({
        confirmLoading: false,
      });
    }
  };

  return (
    <>
      <Modal
        title={`${title}测试序列`}
        maskClosable={false}
        open={open}
        onCancel={() => {
          setState({
            selectTestData: [],
          });
          form?.resetFields();
          onCancel && onCancel();
        }}
        afterClose={() => {}}
        styles={{ body: { padding: 20 } }}
        onOk={handleOk}
        confirmLoading={confirmLoading}
      >
        <Form {...layout} form={form}>
          <Form.Item
            name="sequence_name"
            label="序列名称"
            rules={[{ required: true }]}
          >
            <Input placeholder="输入序列名称" maxLength={32} />
          </Form.Item>

          {type == "edit" && (
            <Form.Item
              name="is_published"
              label="是否发布"
              rules={[{ required: true }]}
            >
              <Select placeholder="选择是否发布">
                <Option value="True">✓</Option>
                <Option value="False">✗</Option>
              </Select>
            </Form.Item>
          )}

          {type != "edit" && (
            <Form.Item
              name="tigroup"
              label="序列类型"
              rules={[
                { required: true, message: "请选择序列类型" },
                {
                  validator: (_, v) =>
                    v?.label?.trim?.() || v?.value
                      ? Promise.resolve()
                      : Promise.reject("请选择序列类型"),
                },
              ]}
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

          <Form.Item name="TST" label="测试流程" rules={[{ required: true }]}>
            <Select placeholder="选择测试流程" allowClear>
              <Option value="Pre">Pre测试</Option>
              <Option value="UUT">UUT测试</Option>
              <Option value="Post">Post测试</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="tc_title"
            label="关联测试用例"
            rules={[{ required: true, message: "请选择关联测试用例" }]}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                flexDirection: "column",
              }}
            >
              <Button
                style={{ marginBottom: 10 }}
                onClick={() => {
                  setState({
                    isPlanModalOpen: true,
                  });
                  onSelect && onSelect();
                }}
              >
                选择测试用例
              </Button>
              {/* 
              {selectTestData && selectTestData.length > 0 ? (
                <>
                  <div>已关联测试用例：</div>{" "}
                  <div>
                    {selectTestData.map((item: any) => item.title).join(",")}
                  </div>
                </>
              ) : (
                <span></span>
              )} */}
              {selectTestData && selectTestData.length > 0 ? (
                <div>
                  <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
                    已关联测试用例：
                  </div>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                  >
                    {selectTestData.map((item: any, index: number) => (
                      <span
                        key={index}
                        style={{
                          background: "#f0f0f0",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "14px",
                        }}
                      >
                        {item.title}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                // <span>暂无关联用例</span>
                <span></span>
              )}
            </div>
          </Form.Item>
        </Form>
      </Modal>
      <PlanModal
        onCancel={() => {
          setState({
            isPlanModalOpen: false,
          });
        }}
        selectData={selectTestData}
        onOk={(values) => {
          setState({
            selectTestData: values,
          });

          form?.setFieldsValue({
            tc_title: isArray(values)
              ? values.map((item) => ({ id: item.id, title: item.title }))
              : [],
          });
          setState({
            isPlanModalOpen: false,
          });
        }}
        open={isPlanModalOpen}
      />
    </>
  );
};

export default AddModal;
