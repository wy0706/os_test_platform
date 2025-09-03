import { CloseCircleFilled } from "@ant-design/icons";
import { Table } from "antd";
import { useState } from "react";

const DebugTable = () => {
  const data = [
    { id: 1, name: "任务1", desc: "初始化系统" },
    { id: 2, name: "任务2", desc: "加载配置" },
    { id: 3, name: "任务3", desc: "启动服务" },
    { id: 4, name: "任务4", desc: "检查状态" },
    { id: 5, name: "任务5", desc: "完成" },
  ];

  // 存储断点（key = 行id）
  const [breakpoints, setBreakpoints] = useState<Record<number, boolean>>({});

  // 点击第一列切换断点
  const toggleBreakpoint = (id: number) => {
    console.log("点击断点列，行ID:", id); // ✅ 调试用
    setBreakpoints((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const columns = [
    {
      title: "断点",
      dataIndex: "id",
      width: 80,
      align: "center",
      render: (_: any, record: any) => (
        <div
          onClick={() => toggleBreakpoint(record.id)}
          style={{ cursor: "pointer" }}
        >
          {breakpoints[record.id] ? (
            <CloseCircleFilled style={{ color: "red", fontSize: 18 }} />
          ) : null}
        </div>
      ),
    },
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "任务名",
      dataIndex: "name",
    },
    {
      title: "描述",
      dataIndex: "desc",
    },
  ];

  return (
    <Table rowKey="id" dataSource={data} columns={columns} pagination={false} />
  );
};

export default DebugTable;
