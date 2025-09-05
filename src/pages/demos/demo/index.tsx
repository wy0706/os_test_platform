import { Button, Table } from "antd";
import { useState } from "react";
import "./index.less";

interface DataType {
  id: number;
  name: string;
  breakpoint?: boolean;
  children?: DataType[];
}

const initialData: DataType[] = [
  {
    id: 1,
    name: "任务 A",
    children: [
      { id: 11, name: "任务 A-1" },
      { id: 12, name: "任务 A-2" },
    ],
  },
  {
    id: 2,
    name: "任务 B",
    children: [{ id: 21, name: "任务 B-1" }],
  },
  { id: 3, name: "任务 C" },
];

const BreakpointTreeTableWithDot = () => {
  const [data, setData] = useState<DataType[]>(initialData);

  // 打断点（递归）
  const setBreakpoint = (id: number, nodes: DataType[] = data) => {
    const newData: any = nodes.map((item) => {
      if (item.id === id) return { ...item, breakpoint: true };
      if (item.children)
        return { ...item, children: setBreakpoint(id, item.children) };
      return item;
    });
    if (nodes === data) setData(newData);
    return newData;
  };

  // 取消断点（递归）
  const cancelBreakpoint = (id: number, nodes: DataType[] = data) => {
    const newData: any = nodes.map((item) => {
      if (item.id === id) return { ...item, breakpoint: false };
      if (item.children)
        return { ...item, children: cancelBreakpoint(id, item.children) };
      return item;
    });
    if (nodes === data) setData(newData);
    return newData;
  };

  // 取消所有断点（递归）
  const clearAllBreakpoints = (nodes: DataType[] = data) => {
    const newData: any = nodes.map((item) => ({
      ...item,
      breakpoint: false,
      children: item.children ? clearAllBreakpoints(item.children) : undefined,
    }));
    if (nodes === data) setData(newData);
    return newData;
  };

  const columns = [
    {
      title: "任务名称",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: DataType) => (
        <span style={{ display: "flex", alignItems: "center" }}>
          {record.breakpoint && (
            <span
              style={{
                width: "10px",
                height: "10px",
                marginRight: "8px",
                backgroundColor: "red",
                borderRadius: "50%",
              }}
            />
          )}
          {text}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Button
        onClick={() => clearAllBreakpoints()}
        style={{ marginBottom: 16 }}
        danger
      >
        取消所有断点
      </Button>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        pagination={false}
        expandable={{ defaultExpandAllRows: true }}
        onRow={(record) => ({
          onClick: () => cancelBreakpoint(record.id),
          onDoubleClick: () => setBreakpoint(record.id),
        })}
      />
    </div>
  );
};

export default BreakpointTreeTableWithDot;
