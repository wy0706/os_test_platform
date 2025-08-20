import { DemoService } from "@/services/case-management/test-sequence.service";
import { ProTable } from "@ant-design/pro-components";
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
  type: "add" | "save";
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
    columns: [
      {
        title: "名称",
        dataIndex: "title",
        render: (text: any, record: any) => {
          return (
            <div>
              {record?.text} {record?.description}
            </div>
          );
        },
      },
      {
        title: "重要程度",
        dataIndex: "importance",
      },
    ],
  });
  const { treeData, title, isPlanModalOpen, selectTestData, columns } = state;

  // 加载树数据
  const loadTreeData = async () => {
    try {
      const response = await DemoService.getTreeData();
      if (response.code === 200) {
        let list =
          response.data.length > 0 &&
          response.data.map((item) => ({
            ...item,
            selectable: false,
          }));
        setState({
          treeData: list || [],
        });
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("加载树数据失败");
    } finally {
      // setTreeLoading(false);
    }
  };

  useEffect(() => {
    console.log("currentNode", currentNode);
    const name = type === "add" ? "新建" : "另存为";
    setState({ title: name });
    if (open) {
      loadTreeData();
      form?.resetFields();
      updateValue &&
        form?.setFieldsValue({ ...updateValue, gender: currentNode });
    }
  }, [open, updateValue]);

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
          onOk({ ...values, lists: selectTestData });
        }
      })
      .catch((errorInfo) => {
        console.error("Validation failed:", errorInfo);
      });
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
          onCancel && onCancel();
        }}
        styles={{ body: { padding: 20 } }}
        width={"50%"}
        onOk={handleOk}
      >
        <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
          <Form.Item name="name" label="序列名称" rules={[{ required: true }]}>
            <Input placeholder="输入序列名称" maxLength={32} />
          </Form.Item>

          <Form.Item name="gender" label="序列类型">
            <TreeSelect
              fieldNames={{ label: "name", value: "id" }}
              showSearch
              style={{ width: "100%" }}
              styles={{
                popup: { root: { maxHeight: 400, overflow: "auto" } },
              }}
              placeholder="选择序列类型"
              allowClear
              treeDefaultExpandAll
              treeData={treeData}
            />
          </Form.Item>

          <Form.Item name="status" label="测试流程">
            <Select placeholder="选择测试流程">
              <Option value="Pre测试">Pre测试</Option>
              <Option value="UUT测试">UUT测试</Option>
              <Option value="Post测试">Post测试</Option>
            </Select>
          </Form.Item>
          <Form.Item name="testSequence" label="关联测试用例">
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

              {selectTestData && selectTestData.length > 0 ? (
                <div style={{ width: "100%" }}>
                  <ProTable<any>
                    search={false}
                    columns={columns}
                    cardBordered
                    options={false}
                    dataSource={selectTestData}
                    rowKey="id"
                    pagination={{
                      pageSize: 100,
                    }}
                    headerTitle="已关联测试用例"
                  />
                </div>
              ) : (
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
