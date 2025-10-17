import {
  deleteAllBatch,
  deleteModalOne,
  deleteTypeOne,
  getAllTypeAndModal,
  getInstrumentTree,
  saveData,
  treeIsUpdate,
  updateTypeAndModal,
} from "@/services/equipment-management/equipment-library-edit.service";
import { createOne } from "@/services/equipment-management/equipment-library.service";
import { addPrefixToLevelKey } from "@/utils";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  FileAddOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  ActionType,
  PageContainer,
  ProTable,
  type ProColumns,
} from "@ant-design/pro-components";
import { history, useParams, useSearchParams } from "@umijs/max";
import { useSetState } from "ahooks";
import {
  Button,
  Card,
  Dropdown,
  Modal,
  Select,
  Space,
  Tree,
  message,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import AddModelModal from "./components/addModelModal";
import AddTypeModal from "./components/addTypeModal";
import CanModal from "./components/canModal";
import ParamModal from "./components/paramModal";
import SaveModal from "./components/saveModal";
import VXIModal from "./components/vxiModal";
import "./index.less";

interface TreeNode {
  title: string;
  key: string;
  children?: TreeNode[];
  level?: number;
}

interface SelfCheckMessage {
  id: number;
  deviceType: string;
  serialNumber: string;
  errorCode: string;
  message: string;
  timestamp: Date;
}

const PeripheralImport: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [deviceConfigData, setDeviceConfigData] = useState<any[]>([]);
  const [channelConfigData, setChannelConfigData] = useState<any[]>([]);
  const [selectedKeysState, setSelectedKeysState] = useState<React.Key[]>([]);
  // 树结构数据
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  // 展开的节点keys
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  const [state, setState] = useSetState<any>({
    isTypeModalOpen: false,
    isModelModalOpen: false,
    oneModelNode: null, //右键种类添加型号的当前种类节点
    isParamModalOpen: false, // RS232 TCPIP PXI LIN
    isVxiModalOpen: false, //VXI
    isCanModalOpen: false, //CAN
    isOtherModalOPen: false, //其他类型 OTHER 预留
    paramType: "", //参数配置类型
    currentParamRecord: {}, //当前编辑表格行数据
    isSelfCheck: false, //是否点击自检
    selfCheckMessages: [], //自检信息列表
    isSelfChecking: false, //是否正在自检中
    isSaveModalOpen: false,
    file_name: null,
    id: null,
    saveType: "save",
    open: false,
    btnType: "",
    backLoading: false,
    addLoading: false,
  });

  const {
    isTypeModalOpen,
    isModelModalOpen,
    oneModelNode,
    isParamModalOpen,
    paramType,
    currentParamRecord,
    isVxiModalOpen,
    isCanModalOpen,
    isSelfCheck,
    selfCheckMessages,
    isSelfChecking,
    isSaveModalOpen,
    isOtherModalOPen,
    file_name,
    id,
    saveType,
    open,
    btnType,
    backLoading,
    addLoading,
  } = state;
  const params = useParams();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    setState({
      id: params.id !== "add" ? params.id : null,
      file_name: searchParams.get("fileName"),
    });
    if (params.id && params.id !== "add") {
      initData();
    } else {
      const data = [
        {
          title: "Instrument",
          key: "instrument",
          level: 1,
        },
      ];
      setTreeData(data);
      // 设置默认展开根节点
      setExpandedKeys(["instrument"]);
    }
  }, []);

  const initData = async () => {
    const { code, data, message: msg } = await getInstrumentTree();
    if (code !== 0) {
      message.error(msg || "获取详情失败");
      history.back();
      return;
    }
    // 防御：data 为空时直接提示并返回
    if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
      // message.warning("未获取到有效的树形数据");
      setTreeData([
        {
          title: "Instrument",
          key: "instrument",
          level: 1,
        },
      ]);
      return;
    }
    const updatedData = addPrefixToLevelKey([data], 3, "child");
    setTreeData(updatedData);
    // setExpandedKeys(getAllKeys(updatedData));
    setExpandedKeys([updatedData[0].key]);
  };

  const actionRef = useRef<ActionType>();
  // 设备配置表格列定义 1
  const deviceConfigColumns: ProColumns<any>[] = [
    {
      title: "设备种类",
      dataIndex: "group_name",
      width: 120,
      editable: false,
    },
    {
      title: "设备型号",
      dataIndex: "instr_name",
      editable: false,
      width: 150,
    },
    {
      title: "接口",
      dataIndex: "interface",
      editable: false,
      width: 100,
    },
    {
      title: "参数配置",
      dataIndex: "paras",
      editable: false,
      // key: "parameterConfig",
      width: 120,
      render: (text, record) => {
        return (
          <div
            onClick={async () => {
              if (actionRef.current?.cancelEditable) {
                try {
                  await actionRef.current?.cancelEditable(
                    String(record.instr_id)
                  );
                } catch (e) {
                  console.warn("取消编辑失败:", e);
                }
              }
              let type = record.interface.toUpperCase();
              setState({
                paramType: type,
                currentParamRecord: record,
              });
              if (type == "CAN") {
                setState({
                  isCanModalOpen: true,
                });
              } else if (
                type == "LIN" ||
                type == "RS232" ||
                type == "TCPIP" ||
                type == "PXI"
              ) {
                setState({
                  isParamModalOpen: true,
                });
              } else if (type == "VXI") {
                setState({
                  isVxiModalOpen: true,
                });
              } else {
                setState({
                  isOtherModalOPen: true,
                  paramType: "OTHER",
                });
              }
            }}
            style={{ cursor: "pointer", color: "#1677ff" }}
          >
            {text}
          </div>
        );
      },
    },
    {
      title: "是否有效",
      dataIndex: "is_active",
      width: 100,
      valueType: "select",
      ellipsis: true,
      editable: (text, record, index) => true,
      valueEnum: {
        1: {
          text: "✓",
          status: "Success",
        },
        0: {
          text: "✗",
          status: "Error",
        },
      },
      renderFormItem: () => {
        return (
          <Select>
            <Select.Option value={1}>✓</Select.Option>
            <Select.Option value={0}>✗</Select.Option>
          </Select>
        );
      },
    },
    {
      title: "操作",
      valueType: "option",
      width: 100,
      key: "option",
      render: (text, record, _, action) => {
        return [
          <Button
            key="editable"
            variant="link"
            color="primary"
            icon={<EditOutlined />}
            onClick={() => {
              action?.startEditable?.(String(record.instr_id));
            }}
          >
            编辑
          </Button>,
        ];
      },
    },
  ];

  // 通道配置表格列定义2
  const channelConfigColumns: ProColumns<any>[] = [
    {
      title: "设备型号",
      dataIndex: "instr_name",
      width: 150,
      editable: false,
    },
    {
      title: "通道号",
      dataIndex: "channel",
      width: 100,
      editable: false,
    },
    {
      title: "指定序号",
      dataIndex: "serial",
      width: 120,
      valueType: "select",
      editable: () => true,
      fieldProps: (_, { entity }) => {
        const max = Number(entity?.list_indexmax) || 0;
        const options = [
          { label: "-1", value: "-1" },
          ...Array.from({ length: max }, (_, i) => {
            const v = String(i + 1);
            return { label: v, value: v };
          }),
        ];
        return { options };
      },
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      width: 100,
      render: (text, record, _, action) => {
        const disabled = !(Number(record?.list_indexmax) > 0);
        return [
          <Button
            key="editable"
            variant="link"
            color="primary"
            disabled={disabled}
            icon={<EditOutlined />}
            onClick={() => {
              if (disabled) {
                message.warning("该行不可编辑（list_indexmax 为 0）");
                return;
              }
              action?.startEditable?.(String(record.instr_id));
            }}
          >
            编辑
          </Button>,
        ];
      },
    },
  ];

  const triggerOnSelectByKey = (key: string, force: boolean = false) => {
    // 先从 treeData 找节点（包含 level）
    let node = findNode(treeData, key) as any;

    // 保险：找不到就按 key 规则兜底一个 node（有 level 就行）
    if (!node) {
      const level = key === "instrument" ? 1 : key.startsWith("child") ? 3 : 2;
      node = { key, level };
    }

    const info = { node };
    void handleSelect([key], info, force);
  };

  // 1) 真正的异步处理函数：显式声明 Promise<void>，内部只用 `return;` 结束分支即可
  const handleSelect = async (
    keys: React.Key[],
    info: any,
    force: boolean = false
  ): Promise<void> => {
    const nextKey = info?.node?.key as string | undefined;
    if (!nextKey) return;

    // 阻止取消选中（除非强制刷新）
    if (!force && selectedKeysState.length > 0 && keys.length === 0) {
      return;
    }
    // 同一节点点击不请求（除非强制刷新）
    if (!force && selectedKeysState[0] === nextKey) {
      return;
    }

    setSelectedKeysState([nextKey]);
    setState({ isSelfCheck: false });
    setDeviceConfigData([]);
    setChannelConfigData([]);
    setSelectedDevice(nextKey);

    const node = info.node as any;
    if (!node?.level) {
      message.error("节点层级信息缺失");
      return;
    }
    if (node.level === 1) {
      const { code, data, message: msg } = await getAllTypeAndModal({});
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      setDeviceConfigData(data?.list_info1 || []);
      setChannelConfigData([]);
      return;
    }

    if (node.level === 2) {
      const {
        code,
        data,
        message: msg,
      } = await getAllTypeAndModal({ type_code: nextKey });
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      setDeviceConfigData(data?.list_info1 || []);
      const list = Array.isArray(data?.list_info2)
        ? data.list_info2.map((i: any) => ({
            ...i,
            list_indexmax: data?.list_indexmax || 0,
          }))
        : [];
      setChannelConfigData(list);
      return;
    }

    if (node.level === 3) {
      const num = Number(String(nextKey).replace("child", ""));
      const {
        code,
        data,
        message: msg,
      } = await getAllTypeAndModal({ id: num });
      if (code !== 0) {
        message.error(msg || "操作失败");
        return;
      }
      const list = Array.isArray(data?.list_info2)
        ? data.list_info2.map((i: any) => ({
            ...i,
            list_indexmax: data?.list_indexmax || 0,
          }))
        : [];
      setDeviceConfigData(data?.list_info1 || []);
      setChannelConfigData(list);
      return;
    }
  };

  const onSelect = (keys: React.Key[], info: any): void => {
    void handleSelect(keys, info);
  };
  // 树节点展开/收起处理
  const onExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys);
  };

  // 根据节点层级获取右键菜单
  const getContextMenu = (node: TreeNode) => {
    const level = node.level || 1;
    const hasChildren =
      Array.isArray(node.children) && node.children.length > 0;

    switch (level) {
      case 1: // Instrument 级别
        return {
          items: [
            {
              key: "addType",
              icon: <PlusOutlined />,
              label: "添加种类",
              onClick: () => {
                setState({ isTypeModalOpen: true });
              },
            },
            {
              key: "deleteAll",
              icon: <DeleteOutlined />,
              label: "删除全部",
              disabled: !hasChildren,
              onClick: () => handleDeleteAll(),
            },
          ],
        };
      case 2: // AC SOURCE 级别
        return {
          items: [
            {
              key: "addModel",
              icon: <PlusOutlined />,
              label: "添加型号",
              onClick: () => handleAddModel(node),
            },
            {
              key: "deleteType",
              icon: <DeleteOutlined />,
              label: "删除种类",
              onClick: () => handleDeleteType(node),
            },
          ],
        };
      case 3: // Chroma 61600 Series 级别
        return {
          items: [
            {
              key: "deleteModel",
              icon: <DeleteOutlined />,
              label: "删除型号",
              onClick: () => handleDeleteModel(node),
            },
          ],
        };
      default:
        return { items: [] };
    }
  };

  // 递归查找节点
  const findNode = (nodes: TreeNode[], key: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.key === key) {
        return node;
      }
      if (node.children) {
        const found = findNode(node.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  // 递归删除节点
  const deleteNode = (nodes: TreeNode[], key: string): TreeNode[] => {
    return nodes.filter((node) => {
      if (node.key === key) {
        return false;
      }
      if (node.children) {
        node.children = deleteNode(node.children, key);
      }
      return true;
    });
  };

  // 递归获取所有节点的key
  const getAllKeys = (nodes: TreeNode[]): React.Key[] => {
    const keys: React.Key[] = [];
    const traverse = (nodeList: TreeNode[]) => {
      nodeList.forEach((node) => {
        keys.push(node.key);
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(nodes);
    return keys;
  };

  // 递归添加节点
  const addNode = (
    nodes: TreeNode[],
    parentKey: string,
    newNode: TreeNode
  ): TreeNode[] => {
    return nodes.map((node) => {
      if (node.key === parentKey) {
        return {
          ...node,
          children: [...(node.children || []), newNode],
        };
      }
      if (node.children) {
        return {
          ...node,
          children: addNode(node.children, parentKey, newNode),
        };
      }
      return node;
    });
  };
  const isTreeUpdate = async (str: string) => {
    const { code, data, message: msg } = await treeIsUpdate();
    if (code === 0) {
      if (str === "add") {
        await addNewDataBase();
      } else {
        history.back();
      }
      return;
    }
    // 弹窗前关闭 loading 状态
    setState({
      open: true,
      addLoading: false,
      backLoading: false,
    });
  };
  // 操作按钮处理
  const handleAdd = async () => {
    setState({ btnType: "add", addLoading: true });
    try {
      await isTreeUpdate("add");
    } finally {
      // 无论成功还是失败，都要关闭 loading
      setState({ addLoading: false });
    }
  };
  const handleAddOk = async () => {
    // 保存数据后创建新的临时库
    const { code, message: msg } = await saveData({
      method: params.id !== "add" ? 1 : 0,
    });
    if (code !== 0) {
      message.error(msg || "操作失败");
      return;
    }
    message.success(msg || "操作成功");
    history.back();
  };
  const handleAddNo = async () => {
    if (btnType == "back") {
      history.back();
      return;
    }

    addNewDataBase();
  };

  const addNewDataBase = async () => {
    // 清空数据创建新的临时库
    const { code, message: msg } = await createOne();
    if (code !== 0) {
      message.error(msg || "操作失败");
      history.back();
      return;
    }
    setTreeData([
      {
        title: "Instrument",
        key: "instrument",
        level: 1,
        children: [],
      },
    ]);
    setDeviceConfigData([]);
    setChannelConfigData([]);
    setSelectedDevice("");
    // 重置展开状态，只展开根节点
    setExpandedKeys(["instrument"]);
    message.success(msg || "新建成功");
  };

  const handleExport = (type: string) => {
    setState({
      isSaveModalOpen: true,
      saveType: type,
    });
  };

  // 添加种类
  const handleAddTypeSuccess = (values: any) => {
    const newNode: TreeNode = {
      title: values.group_name,
      key: values.type_code,
      level: 2,
    };
    setTreeData((prevData) => {
      const newData = addNode(prevData, "instrument", newNode);
      // 更新展开的节点，确保新添加的节点和其父节点都展开
      setExpandedKeys((prevKeys) => [...prevKeys, newNode.key, "instrument"]);
      return newData;
    });
    message.success(values.msg || "设备种类添加成功");
    setState({
      isTypeModalOpen: false,
    });
    // 强制刷新当前选中节点；若没有选中，就刷新根节点
    triggerOnSelectByKey(selectedDevice || "instrument", true);
  };
  // 添加型号成功
  const handleAddModelSuccess = (values: any) => {
    const newNode: TreeNode = {
      title: values.instr_name,
      key: `child${values.instr_id}`,
      level: 3,
    };
    setTreeData((prevData) => {
      const newData = addNode(prevData, oneModelNode.key, newNode);
      // 更新展开的节点，确保新添加的节点和其父节点都展开
      setExpandedKeys((prevKeys) => [
        ...prevKeys,
        newNode.key,
        oneModelNode.key,
        "instrument",
      ]);
      return newData;
    });
    message.success(values.msg || "设备型号添加成功");
    setState({
      isModelModalOpen: false,
      oneModelNode: null,
    });

    // 强制刷新当前选中节点（优先选中项，其次用刚才的父种类）
    triggerOnSelectByKey(
      selectedDevice || oneModelNode?.key || "instrument",
      true
    );
  };
  const handleDeleteAll = () => {
    Modal.confirm({
      title: (
        <div>
          <div>
            确定要删除{" "}
            <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
              所有设备种类
            </span>{" "}
            吗？
          </div>
        </div>
      ),
      onOk: async () => {
        const { code, message: msg } = await deleteAllBatch();
        if (code !== 0) {
          message.error(msg || "操作失败");
          return;
        }
        setTreeData((prevData) =>
          prevData.map((node) => ({
            ...node,
            children: [],
          }))
        );
        // 删除所有子节点后，只保留根节点展开
        setExpandedKeys(["instrument"]);
        setChannelConfigData([]);
        setDeviceConfigData([]);
        message.success(msg || "操作成功");
      },
    });
  };
  const handleGoBack = async () => {
    setState({ backLoading: true, btnType: "back" });
    try {
      await isTreeUpdate("back");
    } finally {
      setState({ backLoading: false });
    }
  };
  // 添加型号
  const handleAddModel = (parentNode: TreeNode) => {
    setState({
      oneModelNode: parentNode,
      isModelModalOpen: true,
    });
  };

  const handleDeleteType = (node: TreeNode) => {
    Modal.confirm({
      title: (
        <div>
          <div>
            确定要删除设备种类{" "}
            <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
              {node.title}
            </span>{" "}
            吗？
          </div>
        </div>
      ),
      onOk: async () => {
        const { code, message: msg } = await deleteTypeOne(node.key);
        if (code !== 0) {
          message.error(msg || "操作失败");
          return;
        }
        setTreeData((prevData) => deleteNode(prevData, node.key));
        // 删除节点后，从展开列表中移除该节点
        setExpandedKeys((prevKeys) =>
          prevKeys.filter((key) => key !== node.key)
        );
        setChannelConfigData([]);
        setDeviceConfigData([]);
        message.success(msg || "操作成功");
      },
    });
  };

  const handleDeleteModel = (node: TreeNode) => {
    Modal.confirm({
      title: (
        <div>
          <div>
            确定要删除设备型号{" "}
            <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
              {node.title}
            </span>{" "}
            吗？
          </div>
        </div>
      ),
      onOk: async () => {
        const num = Number(node.key.replace("child", ""));
        const { code, message: msg } = await deleteModalOne(num);
        if (code !== 0) {
          message.error(msg || "操作失败");
          return;
        }
        setTreeData((prevData) => deleteNode(prevData, node.key));
        // 删除节点后，从展开列表中移除该节点
        setExpandedKeys((prevKeys) =>
          prevKeys.filter((key) => key !== node.key)
        );
        setChannelConfigData([]);
        setDeviceConfigData([]);
        message.success(msg || "操作成功");
      },
    });
  };
  // 自检
  const handleSelfCheck = () => {
    //  程序化清空 Tree 的选中
    setSelectedKeysState([]);
    setSelectedDevice(""); // 如果右侧表格依赖它，顺便清一下
    setDeviceConfigData([]); //清空设备种类表
    // setChannelConfigData([]); // 可选
    console.log("treeData", treeData);
    // 如果没有文件 做出提示
    if (!treeData[0].children || treeData[0].children.length == 0) {
      message.warning("文件为空，请添加设备配置！");
      return;
    }
    //
    setState({
      isSelfCheck: true,
      isSelfChecking: true,
      selfCheckMessages: [],
    });

    // 模拟自检信息
    const mockSelfCheckMessages: SelfCheckMessage[] = [
      {
        id: 1,
        deviceType: "直流源",
        serialNumber: "序号1",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 2,
        deviceType: "直流源",
        serialNumber: "序号2",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 3,
        deviceType: "开关继电器",
        serialNumber: "序号1",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 4,
        deviceType: "开关继电器",
        serialNumber: "序号2",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 5,
        deviceType: "开关继电器",
        serialNumber: "序号3",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 6,
        deviceType: "开关继电器",
        serialNumber: "序号4",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 7,
        deviceType: "数字多用表",
        serialNumber: "序号1",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 8,
        deviceType: "CAN设备",
        serialNumber: "序号1",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 9,
        deviceType: "交流源",
        serialNumber: "序号1",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 10,
        deviceType: "交流源",
        serialNumber: "序号2",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 11,
        deviceType: "负载箱",
        serialNumber: "序号1",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 12,
        deviceType: "负载箱",
        serialNumber: "序号2",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 13,
        deviceType: "温度传感器",
        serialNumber: "序号1",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 14,
        deviceType: "温度传感器",
        serialNumber: "序号2",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 15,
        deviceType: "压力传感器",
        serialNumber: "序号1",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 16,
        deviceType: "压力传感器",
        serialNumber: "序号2",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 17,
        deviceType: "流量计",
        serialNumber: "序号1",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 18,
        deviceType: "流量计",
        serialNumber: "序号2",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 19,
        deviceType: "振动传感器",
        serialNumber: "序号1",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 20,
        deviceType: "振动传感器",
        serialNumber: "序号2",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 21,
        deviceType: "湿度传感器",
        serialNumber: "序号1",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 22,
        deviceType: "湿度传感器",
        serialNumber: "序号2",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 23,
        deviceType: "光电传感器",
        serialNumber: "序号1",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 24,
        deviceType: "光电传感器",
        serialNumber: "序号2",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
      {
        id: 25,
        deviceType: "超声波传感器",
        serialNumber: "序号1",
        errorCode: "-9970",
        message: "自检发生错误:错误代码-9970,命令在对应设备的通信DLL中不存在",
        timestamp: new Date(),
      },
    ];

    // 模拟后端分批返回数据
    setTimeout(() => {
      // 第一批数据（8条）
      setState((prevState) => ({
        ...prevState,
        selfCheckMessages: mockSelfCheckMessages.slice(0, 8),
      }));
    }, 1000);

    setTimeout(() => {
      // 第二批数据（8条）
      setState((prevState) => ({
        ...prevState,
        selfCheckMessages: [
          ...(prevState.selfCheckMessages || []),
          ...mockSelfCheckMessages.slice(8, 16),
        ],
      }));
    }, 2000);

    setTimeout(() => {
      // 第三批数据（9条）
      setState((prevState) => ({
        ...prevState,
        selfCheckMessages: [
          ...(prevState.selfCheckMessages || []),
          ...mockSelfCheckMessages.slice(16, 25),
        ],
        isSelfChecking: false,
      }));
    }, 3000);
  };

  const handleParasOk = (values: any) => {
    // 更新表单对应一条的数据
    const newData = deviceConfigData.map((item) =>
      String(item.instr_id) === String(currentParamRecord.instr_id)
        ? { ...item, paras: values }
        : item
    );
    setDeviceConfigData(newData);
  };
  return (
    <PageContainer
      header={{
        ghost: true,
        extra: [
          <Button key="1" onClick={handleGoBack} loading={backLoading}>
            返回
          </Button>,
        ],
      }}
    >
      <div className="peripheral-import-page">
        {/* 操作栏 */}
        <Card className="operation-bar">
          <Space className="operation-buttons">
            <Button
              icon={<PlusOutlined />}
              onClick={handleAdd}
              loading={addLoading}
            >
              新建
            </Button>

            <Button
              icon={<SaveOutlined />}
              onClick={() => handleExport("save")}
            >
              保存
            </Button>
            <Button
              icon={<FileAddOutlined />}
              onClick={() => handleExport("saveAs")}
            >
              另存为
            </Button>
            <Button icon={<CheckCircleOutlined />} onClick={handleSelfCheck}>
              自检
            </Button>
          </Space>
        </Card>

        {/* 主要内容区域 */}
        <div className="main-content">
          {/* 左侧树结构 Instrument */}
          <Card title=" " className="tree-panel">
            <Tree
              treeData={treeData}
              onSelect={onSelect}
              expandedKeys={expandedKeys}
              selectedKeys={selectedKeysState}
              onExpand={onExpand}
              titleRender={(node) => {
                const menu = getContextMenu(node);
                return (
                  <Dropdown menu={menu} trigger={["contextMenu"]}>
                    <span style={{ display: "inline-block", width: "100%" }}>
                      {node.title}
                    </span>
                  </Dropdown>
                );
              }}
            />
          </Card>

          {/* 右侧区域 */}
          <div className="table-panel">
            {isSelfCheck ? (
              <Card className="table-card">
                <div className="self-check-container">
                  <div className="self-check-header">
                    <h3>自检信息</h3>
                    {isSelfChecking && (
                      <div className="self-check-status">
                        <span className="loading-dot"></span>
                        自检中...
                      </div>
                    )}
                  </div>
                  <div className="self-check-content">
                    {!selfCheckMessages || selfCheckMessages.length === 0 ? (
                      <div className="no-messages">
                        {isSelfChecking
                          ? "正在获取自检信息..."
                          : "暂无自检信息"}
                      </div>
                    ) : (
                      <div
                        className="messages-list"
                        style={{
                          // height: "120px",
                          height: "100%",
                          overflowY: "auto",
                          backgroundColor: "#f8f9fa",
                          // border: "1px solid #e9ecef",
                          borderRadius: "4px",
                          padding: "8px",
                          fontFamily:
                            'Monaco, Consolas, "Courier New", monospace',
                          fontSize: "11px",
                          lineHeight: "1.4",
                        }}
                      >
                        {selfCheckMessages
                          .filter(
                            (message: SelfCheckMessage) =>
                              message && message.deviceType
                          )
                          .map((message: SelfCheckMessage) => (
                            <div key={message.id} className="message-line">
                              <span className="device-name">
                                {message.deviceType} {message.serialNumber}
                              </span>
                              <span className="error-message">
                                {message.message}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="table-card">
                {/* 设备配置表格 */}
                <div className="protable-holder">
                  <ProTable<any>
                    dateFormatter="string"
                    actionRef={actionRef}
                    columns={deviceConfigColumns}
                    dataSource={deviceConfigData}
                    pagination={false}
                    search={false}
                    options={false}
                    size="small"
                    // scroll={{ y: "max-content" }}
                    sticky={{ offsetHeader: 0 }}
                    rowKey={(row) => String(row?.instr_id)}
                    editable={{
                      type: "single",
                      actionRender: (row, config, defaultDoms) => {
                        // 这里只返回 save/cancel 没问题，因为你在列里自定义了“编辑”按钮
                        return [defaultDoms.save, defaultDoms.cancel];
                      },
                      onSave: async (rowKey, data, row) => {
                        const { code, message: msg } = await updateTypeAndModal(
                          {
                            is_active: data.is_active,
                            index: String(rowKey),
                          }
                        );
                        if (code !== 0) {
                          message.error(msg || "操作失败");
                          return;
                        }
                        const newData = deviceConfigData.map((item) =>
                          String(item.instr_id) === String(rowKey)
                            ? { ...item, ...data }
                            : item
                        );
                        setDeviceConfigData(newData);
                        message.success(msg || "操作成功");
                      },
                    }}
                  />
                </div>
              </Card>
            )}

            {/* 设备型号*/}
            <Card className="table-card">
              {/* 指定序号可编辑
               */}
              <div className="protable-holder">
                <ProTable<any>
                  dateFormatter="string"
                  columns={channelConfigColumns}
                  dataSource={channelConfigData}
                  pagination={false}
                  search={false}
                  options={false}
                  size="small"
                  sticky={{ offsetHeader: 0 }}
                  rowKey={(row) => String(row?.instr_id)}
                  editable={{
                    type: "single",
                    actionRender: (row, config, defaultDoms) => {
                      return [defaultDoms.save, defaultDoms.cancel];
                    },
                    onSave: async (rowKey, data, row) => {
                      const { code, message: msg } = await updateTypeAndModal({
                        useindex: data.serial,
                        index: String(rowKey),
                      });
                      if (code !== 0) {
                        message.error(msg || "操作失败");
                        return;
                      }
                      // 更新通道配置数据
                      const newData = channelConfigData.map((item) =>
                        String(item.instr_id) === String(rowKey)
                          ? { ...item, ...data }
                          : item
                      );
                      setChannelConfigData(newData);
                      message.success(msg || "操作成功");
                    },
                    onCancel: async (rowKey, record, originRow) => {
                      message.info("已取消编辑");
                    },
                  }}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* 添加种类 */}
      <AddTypeModal
        open={isTypeModalOpen}
        onCancel={() => {
          setState({ isTypeModalOpen: false });
        }}
        onOk={handleAddTypeSuccess}
      />
      {/* 添加型号 */}
      <AddModelModal
        open={isModelModalOpen}
        onCancel={() => {
          setState({ isModelModalOpen: false });
        }}
        data={oneModelNode}
        onOk={handleAddModelSuccess}
      />
      {/* 配置参数 */}
      <ParamModal
        open={isParamModalOpen}
        data={currentParamRecord}
        type={paramType}
        onCancel={() => {
          setState({
            isParamModalOpen: false,
          });
        }}
        onOk={(values) => {
          handleParasOk(values);
          setState({
            isParamModalOpen: false,
          });
        }}
      />
      {/* can */}
      <CanModal
        open={isCanModalOpen}
        data={currentParamRecord}
        onCancel={() => {
          setState({
            isCanModalOpen: false,
          });
        }}
        onOk={() => {
          setState({
            isCanModalOpen: false,
          });
        }}
      />
      {/* VXI */}
      <VXIModal
        open={isVxiModalOpen}
        data={currentParamRecord}
        onCancel={() => {
          setState({
            isVxiModalOpen: false,
          });
        }}
        onOk={(values) => {
          handleParasOk(values);
          setState({
            isVxiModalOpen: false,
          });
        }}
      />

      {/* 保存另存为 */}
      <SaveModal
        open={isSaveModalOpen}
        id={id}
        type={saveType}
        name={file_name}
        onCancel={() => {
          setState({
            isSaveModalOpen: false,
          });
        }}
        onOk={() => {
          setState({
            isSaveModalOpen: false,
          });
          // history.back();
        }}
      />
      <Modal
        title="提示"
        open={open}
        destroyOnHidden
        onCancel={() => {
          setState({
            open: false,
          });
        }}
        footer={[
          <Button
            key="yes"
            type="primary"
            style={{ marginRight: 10 }}
            onClick={handleAddOk}
          >
            是
          </Button>,
          <Button
            key="no"
            danger
            style={{ marginRight: 10 }}
            onClick={handleAddNo}
          >
            否
          </Button>,
          <Button
            key="cancel"
            style={{ marginRight: 10 }}
            onClick={() => {
              setState({
                open: false,
              });
            }}
          >
            取消
          </Button>,
        ]}
      >
        <p>当前文件有未保存的内容，是否需要保存？</p>
      </Modal>
    </PageContainer>
  );
};

export default PeripheralImport;
