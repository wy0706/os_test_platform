import {
  getInstrumentModal,
  getInstrumentType,
} from "@/services/equipment-management/equipment-library-edit.service";
import {
  deleteModelOne,
  deleteTypeOne,
} from "@/services/system-management/equip-management.service";
import { isArray } from "@/utils";
import { transformParams } from "@/utils/params";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  PageContainer,
  ProTable,
} from "@ant-design/pro-components";
import { useAccess } from "@umijs/max";
import { useSetState } from "ahooks";
import { Button, List, message, Modal } from "antd";
import React, { useEffect, useRef } from "react";
import AddModal from "./components/addModal";
import AddTypeModal from "./components/addTypeModal";
// 模拟角色数据
const mockRoles = [
  { id: "all", name: "全部设备", desc: "", type: "all" },
  { id: 2, name: "设备类型1", desc: "" },
  { id: 3, name: "设备类型2", desc: "" },
];

const Page: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();

  const [state, setState] = useSetState<any>({
    isAddModalOpen: false,
    addEquipValue: {},
    addOptionType: "add", // add | edit
    typeOptionType: "add", // add | edit
    isAddTypeModalOpen: false,
    addTypeValue: {},
    equipTypeData: [],
    currentSelectedTypeId: "all", // 当前选中的设备类型ID
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

  useEffect(() => {
    actionRef.current?.reload();
  }, [currentSelectedTypeId]);

  const fetchTypeData: any = async () => {
    try {
      const { code, data } = await getInstrumentType({ route: 1 });
      if (code !== 0) {
        setState({ equipTypeData: [] });
        return;
      }
      let allItem = {
        group_id: "all",
        group_name: "全部模块",
      };

      let list = !isArray(data?.list_info)
        ? []
        : data?.list_info.length > 0
        ? [allItem, ...data?.list_info]
        : [];
      setState({ equipTypeData: list });
    } catch {
      setState({ equipTypeData: [] });
    }
  };

  // 选择设备类型
  const handleTypeSelect = (id: number) => {
    if (id === currentSelectedTypeId) {
      return;
    }
    // requestData();
    setState({ currentSelectedTypeId: id });
  };

  const currentSelectedType = equipTypeData.find(
    (r: any) => r.group_id === currentSelectedTypeId
  );

  // 设备类型搜索过滤
  // const filterEquipType = equipTypeData.filter((item: any) =>
  //   item.name.includes(typeSearch)
  // );

  const operationColumn = {
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
              await deleteModelOne(record.instr_id);
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
  };
  const schemasColumns = [
    {
      title: "设备型号",
      dataIndex: "instr_name",
      ellipsis: true,
    },
    {
      title: "设备类型编码",
      dataIndex: "instr_id",
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: "是否激活",
      dataIndex: "is_actvie",
      hideInSearch: true,
      ellipsis: true,
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
    },
    {
      title: "添加时间",
      dataIndex: "edittime",
      ellipsis: true,
      hideInSearch: true,
      sorter: true,
    },
  ];
  const columns: any = access["systemManagement-edit"]
    ? [...schemasColumns, operationColumn]
    : schemasColumns;

  // 获取测试用例数据 1,38400,1
  const requestData: any = async (...args: any) => {
    let params = transformParams({ params: args[0], sort: args[1] });
    console.log("params", params);

    const {
      code,
      data,
      message: msg,
    } = await getInstrumentModal({ ...params });
    if (code !== 0) {
      message.error(msg);
      return { data: [], total: 0, success: false };
    }
    return {
      data: data?.list_info || [],
      total: data?.total_cnt,
      success: code === 0,
    };
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
              dataSource={equipTypeData}
              renderItem={(item: any) => {
                const hasEdit = !!access["systemManagement-edit"];
                const actions = hasEdit
                  ? item.group_id !== "all"
                    ? [
                        <Button
                          key="edit"
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
                        />,
                        <Button
                          key="del"
                          size="small"
                          icon={<DeleteOutlined />}
                          type="link"
                          danger
                          onClick={(e) => {
                            e.stopPropagation();
                            Modal.confirm({
                              title: "确认删除吗？",
                              onOk: async () => {
                                await deleteTypeOne(item.group_id);
                                fetchTypeData();
                                if (item.group_id === currentSelectedTypeId) {
                                  setState({ currentSelectedTypeId: "all" });
                                }
                              },
                            });
                          }}
                        />,
                      ]
                    : [
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setState({
                              isAddTypeModalOpen: true,
                              typeOptionType: "add",
                              addTypeValue: {},
                            });
                          }}
                        ></Button>,
                      ]
                  : undefined; // ❗️无编辑权限：完全不渲染 actions，不留空白

                return (
                  <List.Item
                    style={{
                      background:
                        currentSelectedTypeId === item.group_id
                          ? "#e6f7ff"
                          : undefined,
                      cursor: "pointer",
                      paddingLeft: 16,
                    }}
                    onClick={() => handleTypeSelect(item.group_id)}
                    actions={actions}
                  >
                    <List.Item.Meta
                      title={
                        <span
                          style={{
                            fontWeight: 400,
                            fontSize: 12,
                            color: "rgba(0,0,0,.8)",
                          }}
                        >
                          {item.group_name}
                        </span>
                      }
                    />
                  </List.Item>
                );
              }}
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
            request={requestData}
            dateFormatter="string"
            rowKey={(row) => String(row?.instr_id)}
            params={{
              type_code:
                currentSelectedTypeId !== "all" ? currentSelectedTypeId : null,
            }}
            options={false}
            headerTitle="添加设备"
            pagination={{
              pageSize: 10,
              onChange: (page) => requestData,
            }}
            toolBarRender={() =>
              access["systemManagement-edit"]
                ? [
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
                  ]
                : []
            }
          />
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
          setState({ isAddTypeModalOpen: false, addTypeValue: {} });
          fetchTypeData();
        }}
      />
      <AddModal
        open={isAddModalOpen}
        type={addOptionType}
        updateValue={addEquipValue}
        groupId={currentSelectedTypeId}
        onCancel={() => {
          setState({ isAddModalOpen: false, addEquipValue: {} });
        }}
        onOk={(value) => {
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
