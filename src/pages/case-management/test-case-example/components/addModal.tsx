import { getList as getUserList } from "@/services/backend-management/user-management.service";
import {
  createCase,
  getList as getModule,
  getModuleOptions,
} from "@/services/case-management/test-case-example.service";
import { getList as getLib } from "@/services/case-management/test-case.service";
import { isArray } from "@/utils";
import { useModel } from "@umijs/max";
import { useSetState } from "ahooks";

import { Col, Divider, Form, Input, message, Modal, Row, Select } from "antd";
import { useEffect } from "react";

interface SetMemberModalProps {
  open: boolean;
  onOk?: (values: any) => void;
  onCancel?: () => void;
  onSelect?: () => void;
  testData?: any;
  libId?: any;
  mouduleId?: any;
}
const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
};

const AddModal: React.FC<SetMemberModalProps> = ({
  open,
  onOk,
  onCancel,
  onSelect,
  testData,
  libId,
  mouduleId,
}) => {
  const { initialState } = useModel("@@initialState");
  const { currentUser } = initialState || {};

  const [state, setState] = useSetState<any>({
    userList: [], // 用户列表
    libList: [],
    moduleList: [],
    loading: false,
    submitLoading: false,
  });
  const { userList, libList, moduleList, loading, submitLoading } = state;
  // 获取测试用例库

  const getLibList = async () => {
    try {
      const {
        code,
        data,
        message: msg,
      } = await getLib({ page_index: 1, page_size: 9999 });
      if (code === 0) {
        if (isArray(data?.list)) {
          setState({ libList: data?.list || [] });
        }
      } else {
        message.error(msg);
        setState({ libList: [] });
      }
    } catch (error) {
      console.error("获取用例库列表失败:", error);
      setState({ libList: [] });
    }
  };
  // 获取模块列表

  const getModuleList = async (libId: any) => {
    try {
      const params = {
        lib_id: libId,
        page_index: 1,
        page_size: 9999,
      };
      const { code, data, message: msg } = await getModule(params);
      if (code === 0) {
        if (isArray(data?.list)) {
          setState({ moduleList: data?.list || [] });
        }
      } else {
        message.error(msg);
        setState({ moduleList: [] });
      }
    } catch (error) {
      console.error("获取模块列表失败:", error);
      setState({ moduleList: [] });
    }
  };

  const fetchAllUsers = async () => {
    try {
      const params = {
        page_index: 1,
        page_size: 9999,
      };
      const { code, data, message: msg } = await getUserList(params);
      if (code === 0) {
        setState({ userList: data?.list || [] });
      } else {
        setState({ userList: [] });
        message.error(msg);
      }
    } catch (error) {
      console.error("获取用户列表失败:", error);
    }
  };

  const fetchTreeSelect = async () => {
    try {
      const { code, data, message: msg } = await getModuleOptions();
      if (code === 0) {
        if (isArray(data?.lib_list)) {
          const fixedData = data?.lib_list.map((parent: any) => ({
            ...parent,
            fullLabel: parent.name, // 拼好的文字
            disabled: true, // 禁用父节点
            // id: `parent-${parent.id}`, // 给父节点加前缀，防止和子节点id冲突
            module_list: (parent.module_list || []).map((child: any) => ({
              ...child,
              id: `child-${child.id}`, // 给子节点加前缀
              parentId: parent.id, // 给父节点加前缀，防止和子节点id冲突
              fullLabel: `${parent.name} / ${child.name}`, // 拼好的文字
            })),
          }));
          setState({
            TreeDataList: fixedData || [],
          });
        }
      } else {
        message.error(msg);
        setState({
          TreeDataList: [],
        });
      }
    } catch (error) {
      console.error("获取用户列表失败:", error);
    }
  };

  useEffect(() => {
    form?.resetFields();
    fetchData();
  }, [open, libId, mouduleId]);

  const [form] = Form.useForm();
  const fetchData = async () => {
    if (open) {
      try {
        setState({ loading: true });
        await getLibList();
        await getModuleList(libId);
        await fetchAllUsers();
        form?.setFieldsValue({
          user_id: currentUser?.id,
          tc_module_id: mouduleId ? Number(mouduleId) : null,
          tc_lib_id: Number(libId) || null,
        });
      } catch (error) {
      } finally {
        setState({ loading: false });
      }
    }
  };
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setState({
        submitLoading: true,
      });
      const { code, message: msg } = await createCase({
        ...values,
      });
      if (code === 0) {
        message.success(msg);
      } else {
        message.error(msg);
        return;
      }
      onOk?.(values);
    } catch (error) {
    } finally {
      setState({
        submitLoading: false,
      });
    }
  };

  return (
    <Modal
      title="创建用例"
      maskClosable={false}
      open={open}
      onCancel={() => {
        form?.resetFields();
        onCancel && onCancel();
      }}
      confirmLoading={submitLoading}
      styles={{ body: { minHeight: 200, padding: 20 } }}
      width={"60%"}
      onOk={handleOk}
      destroyOnHidden
    >
      <Form {...layout} form={form} name="control-hooks">
        <Form.Item name="tc_title" label="标题" rules={[{ required: true }]}>
          <Input placeholder="输入标题" maxLength={32} />
        </Form.Item>
        <Form.Item name="precondition" label="前置条件">
          <Input.TextArea
            rows={4}
            placeholder="输入前置条件"
            maxLength={2048}
          />
        </Form.Item>

        <Divider plain>用例步骤</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="step_desc" label="步骤描述">
              <Input.TextArea
                rows={4}
                placeholder="输入步骤描述"
                // style={{ resize: "none" }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="except_result" label="预期结果">
              <Input.TextArea
                rows={4}
                placeholder="输入预期结果"
                // style={{ resize: "none" }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="comment" label="备注">
          <Input.TextArea
            rows={4}
            placeholder="输入任务备注"
            maxLength={2048}
          />
        </Form.Item>

        <Row gutter={16}>
          {/* 树型结构 包含测试库和所属模块 */}
          {/* <Col span={8}>
            <Form.Item
              name="tc_module_id"
              label="所属测试库/模块"
              rules={[{ required: true }]}
            >
              <TreeSelect
                allowClear
                treeDefaultExpandAll
                treeData={TreeDataList}
                disabled
                fieldNames={{
                  label: "fullLabel",
                  value: "id",
                  children: "module_list",
                }}
                placeholder="选择所属测试库/模块"
                onSelect={(value, node) => {
                  setState({ tc_lib_id: node?.parentId });
                }}
                onChange={(value) => {
                  if (!value) {
                    setState({ tc_lib_id: null });
                  }
                }}
              />
            </Form.Item>
          </Col> */}
          <Col span={12}>
            <Form.Item
              name="tc_lib_id"
              label="所属测试库"
              rules={[{ required: true }]}
            >
              <Select placeholder="选择所属测试库" disabled>
                {libList.map((lib: any) => (
                  <Option key={lib.id} value={lib.id}>
                    {lib.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tc_module_id"
              label="模块"
              rules={[{ required: true }]}
            >
              <Select placeholder="选择模块" allowClear>
                {moduleList.map((lib: any) => (
                  <Option key={lib.id} value={lib.id}>
                    {lib.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            {" "}
            <Form.Item name="importance" label="重要程度">
              <Select placeholder="选择重要程度">
                <Option value="P0">P0</Option>
                <Option value="P1">P1</Option>
                <Option value="P2">P2</Option>
                <Option value="P3">P3</Option>
                <Option value="P4">P4</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            {" "}
            <Form.Item
              name="user_id"
              label="维护人"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="选择维护人"
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
                    {user.name || user.username || "-"}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          {/* 预留界面，暂时不接入 */}
          {/* <Col span={8}>
            {" "}
            <Form.Item name="gender22" label="关联测试序列">
              <Button
                onClick={() => {
                  onSelect && onSelect();
                }}
              >
                {updateValue?.projectName || "选择测试序列"}

                <span></span>
              </Button>
            </Form.Item>
          </Col> */}
        </Row>
      </Form>
    </Modal>
  );
};

export default AddModal;
