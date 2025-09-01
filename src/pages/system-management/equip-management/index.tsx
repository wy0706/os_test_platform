import {
  deleteOne,
  getList,
} from "@/services/system-management/user-management.service";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  PageContainer,
  ProTable,
} from "@ant-design/pro-components";
import { useSetState } from "ahooks";
import { Button, List, Modal } from "antd";
import React, { useEffect, useRef } from "react";
import AddModal from "./components/addModal";
import AddTypeModal from "./components/addTypeModal";
// 模拟角色数据
const mockRoles = [
  { id: 1, name: "设备类型1", desc: "" },
  { id: 2, name: "设备类型2", desc: "" },
];

const defaultRolePermissions = {
  1: {
    // 系统管理员
    testTask: ["view", "operate"],
    testCase: ["view", "operate"],
    device: ["view", "operate"],
    tool: ["view", "operate"],
    system: ["view", "operate"],
    cicd: ["view", "operate"],
    log: ["view", "operate"],
  },
  2: {
    // 测试处理
    testTask: ["view", "operate"],
    testCase: ["view", "operate"],
    device: ["view"],
    tool: ["view"],
    system: ["view"],
    cicd: [],
    log: ["view"],
  },
  // 其他角色可继续补充...
};

const Page: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const [state, setState] = useSetState<any>({
    isAddModalOpen: false,
    addEquipValue: {},
    addOptionType: "add", // add | edit
    typeOptionType: "add", // add | edit
    isAddTypeModalOpen: false,
    addTypeValue: {},
    equipTypeData: [],
    currentSelectedTypeId: null,
    typeSearch: "", // 设备类型搜索关键字
  });
  const {
    addEquipValue,
    addOptionType,
    isAddModalOpen,
    typeOptionType,
    isAddTypeModalOpen,
    addTypeValue,
    equipTypeData,
    currentSelectedTypeId,
    typeSearch,
  } = state;

  useEffect(() => {
    fetchTypeData();
  }, []);

  const fetchTypeData: any = async (...args: any) => {
    try {
      const res = await getList({ params: args[0], sort: args[1] });
      return res;
    } catch {
      setState({ equipTypeData: mockRoles });
      return {
        data: mockRoles,
        total: 1,
        success: true,
      };
    }
  };

  // 选择设备类型
  const handleTypeSelect = (id: number) => {
    if (id === currentSelectedTypeId) {
      return;
    }
    requestData();
    setState({ currentSelectedTypeId: id });
  };

  const currentSelectedType = equipTypeData.find(
    (r: any) => r.id === currentSelectedTypeId
  );

  // 设备类型搜索过滤
  const filterEquipType = equipTypeData.filter((item: any) =>
    item.name.includes(typeSearch)
  );

  const columns: any = [
    {
      title: "设备名称",
      dataIndex: "title",
      ellipsis: true,
    },
    {
      title: "设备类型编码",
      dataIndex: "title1",
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: "是否激活",
      dataIndex: "title2",
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: "添加时间",
      dataIndex: "createTime",
      ellipsis: true,
      hideInSearch: true,
      sorter: true,
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      width: 150,
      render: (text: any, record: any, index: any, action: any) => [
        <Button
          color="primary"
          variant="link"
          key="edit"
          icon={<EditOutlined />}
          onClick={() => {
            setState({
              addEquipValue: record,
              isAddModalOpen: true,
              addOptionType: "edit",
            });
          }}
        >
          编辑
        </Button>,
        <Button
          color="danger"
          variant="link"
          key="preview"
          icon={<DeleteOutlined />}
          onClick={() => {
            Modal.confirm({
              title: "确认删除吗？",
              onOk: async () => {
                await deleteOne(record.id);
                if (actionRef.current) {
                  actionRef.current.reload();
                }
              },
            });
          }}
        >
          删除
        </Button>,
      ],
    },
  ];
  const requestData: any = async (...args: any) => {
    if (!currentSelectedTypeId) {
      return {
        data: [],
        total: 0,
        success: true,
      };
    }
    try {
      const res = await getList({ params: args[0], sort: args[1] });
      return res;
    } catch {
      return {
        data: [
          {
            id: 1,
            title: "测试数据",
            title2: true,
            title1: 2,
            createTime: "测试数据",
          },
        ],
        total: 1,
        success: true,
      };
    }
  };
  return (
    <PageContainer>
      <div
        style={{
          display: "flex",
          backgroundColor: "#f5f5f5",
          gap: "16px",
        }}
      >
        {/* 左侧角色列表 */}
        <div
          style={{
            width: 300,
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 200px)", // 设置固定高度，与左侧保持一致
          }}
        >
          {" "}
          {/* <Card
            bordered={false}
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>设备类型</span>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="small"
                  onClick={() => {
                    setState({
                      isAddTypeModalOpen: true,
                      typeOptionType: "add",
                      addTypeValue: {},
                    });
                  }}
                >
                  新建
                </Button>
              </div>
            }
          > */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: 600,
                color: "#262626",
              }}
            >
              设备类型
            </h4>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              onClick={() => {
                setState({
                  isAddTypeModalOpen: true,
                  typeOptionType: "add",
                  addTypeValue: {},
                });
              }}
            >
              新建
            </Button>
          </div>
          {/* <div style={{ padding: 12, display: "flex", gap: 8 }}>
              <Input
                placeholder="搜索角色名称"
                allowClear
                value={roleSearchInput}
                onChange={(e) => setRoleSearchInput(e.target.value)}
                size="small"
                onPressEnter={() => setRoleSearch(roleSearchInput)}
              />
              <Button
                icon={<SearchOutlined />}
                size="small"
                type="primary"
                onClick={() => setRoleSearch(roleSearchInput)}
              >
                搜索
              </Button>
            </div> */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <List
              itemLayout="horizontal"
              dataSource={filterEquipType}
              renderItem={(item: any) => (
                <List.Item
                  style={{
                    background:
                      currentSelectedTypeId === item.id ? "#e6f7ff" : undefined,
                    cursor: "pointer",
                    // paddingLeft: 16,
                  }}
                  onClick={() => handleTypeSelect(item.id)}
                  actions={[
                    <Button
                      icon={<EditOutlined />}
                      size="small"
                      type="link"
                      onClick={(e) => {
                        e.stopPropagation();
                        setState({
                          isAddTypeModalOpen: true,
                          typeOptionType: "edit",
                          addTypeValue: item,
                        });
                      }}
                      key="edit"
                    >
                      {/* 编辑 */}
                    </Button>,
                    <Button
                      size="small"
                      icon={<DeleteOutlined />}
                      type="link"
                      danger
                      onClick={(e) => {
                        e.stopPropagation();
                        Modal.confirm({
                          title: "确认删除吗？",
                          onOk: async () => {
                            await deleteOne(item.id);
                            if (item.id === currentSelectedTypeId) {
                              setState({ currentSelectedTypeId: null });
                            }
                            // fetchRoles();
                          },
                        });
                      }}
                      key="del"
                    ></Button>,
                  ]}
                >
                  <List.Item.Meta title={<span>{item.name}</span>} />
                </List.Item>
              )}
            />
          </div>
        </div>
        {/* </Card> */}

        {/* 右侧 */}
        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 200px)", // 设置固定高度，与左侧保持一致
          }}
        >
          {" "}
          {/* <Card
            title={
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  paddingTop: 5,
                  paddingBottom: 10,
                  boxSizing: "border-box",
                }}
              >
                <span>
                  <b style={{ color: "#1890FF" }}>
                    {currentSelectedType?.name || ""}
                  </b>
                </span>
              </div>
            }
            extra={
              <span style={{ color: "#888" }}>
                {currentSelectedType?.desc || ""}
              </span>
            }
            styles={{
              body: {
                display: "flex",
                flexDirection: "column",
                minHeight: "55vh",
                padding: 0,
              },
            }}
          > */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
                {currentSelectedType
                  ? `设备类型: ${currentSelectedType.name}`
                  : "请选择左侧设备类型"}
              </h2> */}
              <span>
                <b style={{ color: "#1890FF" }}>
                  {currentSelectedType?.name || ""}
                </b>
              </span>
            </div>
          </div>
          <ProTable<any>
            columns={columns}
            actionRef={actionRef}
            cardBordered
            request={async (params, sorter, filter) => {
              // 首次渲染还没选左侧时，不请求或返回空
              if (!params.typeId) {
                return { data: [], success: true, total: 0 };
              }
              return requestData({ ...params, sorter, filter });
            }}
            dateFormatter="string"
            rowKey="id"
            params={{ typeId: currentSelectedTypeId }}
            options={false}
            headerTitle="添加设备"
            pagination={{
              pageSize: 10,
              onChange: (page) => requestData,
            }}
            toolBarRender={() => [
              <Button
                key="button"
                icon={<PlusOutlined />}
                onClick={() => {
                  setState({
                    isAddModalOpen: true,
                    addOptionType: "add",
                  });
                }}
                type="primary"
              >
                新建
              </Button>,
            ]}
          />
          {/* </Card> */}
        </div>
      </div>
      <AddTypeModal
        open={isAddTypeModalOpen}
        type={typeOptionType}
        updateValue={addTypeValue}
        onCancel={() => {
          setState({ isAddTypeModalOpen: false, addTypeValue: {} });
        }}
        onOk={(value) => {
          console.log("values", value);
          setState({ isAddTypeModalOpen: false, addTypeValue: {} });
        }}
      />
      <AddModal
        open={isAddModalOpen}
        type={addOptionType}
        updateValue={addEquipValue}
        onCancel={() => {
          setState({ isAddModalOpen: false, addEquipValue: {} });
        }}
        onOk={(value) => {
          console.log("values", value);
          setState({ isAddModalOpen: false, addEquipValue: {} });
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}
      />
    </PageContainer>
  );
};

export default Page;
