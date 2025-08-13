import ProTable from "@ant-design/pro-table";
import { Button, Spin, Tabs } from "antd";
import { useEffect, useState } from "react";

// 模拟接口请求
const fetchTabsData = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        tab1: [{ id: 1, name: "Tab1-行1" }],
        tab2: [{ id: 2, name: "Tab2-行1" }],
        tab3: [{ id: 3, name: "Tab3-行1" }],
        tab4: [{ id: 4, name: "Tab4-行1" }],
      });
    }, 800);
  });

const TabTable = ({ dataSource, onChange }) => {
  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "名称", dataIndex: "name" },
    {
      title: "操作",
      valueType: "option",
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            const newName = prompt("请输入新名称", record.name);
            if (newName !== null) {
              onChange(
                dataSource.map((item) =>
                  item.id === record.id ? { ...item, name: newName } : item
                )
              );
            }
          }}
        >
          编辑
        </a>,
      ],
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        style={{ marginBottom: 8 }}
        onClick={() =>
          onChange([
            ...dataSource,
            { id: Date.now(), name: `新行-${Date.now()}` },
          ])
        }
      >
        添加行
      </Button>

      <ProTable
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        search={false}
        pagination={false}
        toolBarRender={false}
      />
    </div>
  );
};

export default function App() {
  const [activeKey, setActiveKey] = useState("tab1");
  const [tablesData, setTablesData] = useState({});
  const [loading, setLoading] = useState(true);

  // 页面初次加载时一次性请求所有 tab 数据
  useEffect(() => {
    setLoading(true);
    fetchTabsData().then((data) => {
      setTablesData(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <Spin tip="加载中..." style={{ marginTop: 50 }} />;
  }

  const tabItems = [
    { key: "tab1", label: "测试流程" },
    { key: "tab2", label: "设备管理" },
    { key: "tab3", label: "用例管理" },
    { key: "tab4", label: "系统管理" },
  ];

  return (
    <Tabs
      activeKey={activeKey}
      onChange={setActiveKey}
      destroyInactiveTabPane={false} // ✅ 不销毁组件，保留状态
      items={tabItems.map(({ key, label }) => ({
        key,
        label,
        children: (
          <TabTable
            dataSource={tablesData[key] || []}
            onChange={(newData) =>
              setTablesData((prev) => ({ ...prev, [key]: newData }))
            }
          />
        ),
      }))}
    />
  );
}
