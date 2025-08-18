import { useSetState } from "ahooks";
import { Checkbox, Table } from "antd";
import React from "react";
interface ResultProps {
  data?: any; //datasource数据
  id?: any;
}
const TestCondition: React.FC<ResultProps> = ({ data, id }) => {
  // 处理数组展开的函数
  const expandArrayItems = (items: any[]): any[] => {
    const result: any[] = [];

    items.forEach((item) => {
      if (item.children) {
        const expandedChildren = expandArrayItems(item.children);
        result.push({
          ...item,
          children: expandedChildren,
        });
      } else if (Array.isArray(item.testValue)) {
        // 如果testValue是数组，展开为多行
        item.testValue.forEach((value: any, index: number) => {
          result.push({
            ...item,
            id: `${item.id}_${index}`,
            testValue: value,
            arrayIndex: index,
            isArrayItem: true,
            // 只有第一行显示完整信息，其他行只显示值
            extension: index === 0 ? item.extension : "",
            sequenceName2: index === 0 ? item.sequenceName2 : "",
          });
        });
      } else {
        result.push(item);
      }
    });

    return result;
  };

  const rawData = [
    // 保存原始数据
    {
      id: 1,
      extension: "UUT test测试项目 *1",
      children: [
        {
          id: 2,
          sequenceName1: "CAN通信测试",
          children: [
            {
              id: 12,
              extension: "CAN报文",
              sequenceName2: "CAN_MSG",
              testValue: "00 01 00 01",
            },
          ],
        },
      ],
    },
    {
      id: 3,
      extension: "UUT test测试项目 *2",
      children: [
        {
          id: 4,
          sequenceName1: "LIN通信测试",
          children: [
            {
              id: 5,
              extension: "输入电压",
              sequenceName2: "Vdc",
              testValue: "5.00",
            },
            {
              id: 6,
              extension: "PBZ20 20电压",
              sequenceName2: "V PBZ2020",
              testValue: "5.00",
            },
            {
              id: 7,
              extension: "CAN报文",
              sequenceName2: "CAN_MSG",
              testValue: "5.00",
            },
            {
              id: 8,
              extension: "CAN通道使能",
              sequenceName2: "CAN通道[(2)]",
              testValue: [1, 1],
            },
            {
              id: 10,
              extension: "示波器通道",
              sequenceName2: "示波器通道[(4)]",
              testValue: [0, 1, 0, 0],
            },
          ],
        },
      ],
    },
  ];

  const [state, setState] = useSetState<any>({
    isExpandAll: true,
    expandedRowKeys: [],
    originalData: rawData,
    dataSource: expandArrayItems(rawData),
    columns: [
      {
        title: "扩展名",
        dataIndex: "extension",
        render: (value: any, record: any) => {
          return <span style={{ color: "#6c757d" }}>{value}</span>;
        },
      },
      {
        title: "变量名",
        dataIndex: "sequenceName1",
        render: (value: any, record: any) => {
          return <span style={{ color: "#6c757d" }}>{value}</span>;
        },
      },
      {
        title: "变量名",
        dataIndex: "sequenceName2",
        render: (value: any, record: any) => {
          return <span style={{ color: "#6c757d" }}>{value}</span>;
        },
      },
      {
        title: "数组",
        dataIndex: "arrayIndex",
        render: (value: any, record: any) => {
          if (record.isArrayItem && typeof value === "number") {
            return <span style={{ color: "#6c757d" }}>{value}</span>;
          }
          return null;
        },
      },
      {
        title: "设定值",
        dataIndex: "testValue",
        render: (value: any, record: any) => {
          if (Array.isArray(value)) {
            // 如果是数组且未展开，显示完整数组
            return (
              <span style={{ color: "#6c757d" }}>{JSON.stringify(value)}</span>
            );
          }
          return <span style={{ color: "#6c757d" }}>{value}</span>;
        },
      },
    ],
  });
  const { isExpandAll, expandedRowKeys, dataSource, columns, originalData } =
    state;

  // 处理非数组展开的函数 - 保持数组为原始格式
  const collapseArrayItems = (items: any[]): any[] => {
    const result: any[] = [];

    items.forEach((item) => {
      if (item.children) {
        const collapsedChildren = collapseArrayItems(item.children);
        result.push({
          ...item,
          children: collapsedChildren,
        });
      } else {
        result.push(item);
      }
    });

    return result;
  };

  return (
    <div className="testCondition-page">
      <div
        style={{
          marginBottom: 10,
        }}
      >
        <Checkbox
          style={{ marginRight: 15 }}
          checked={isExpandAll}
          onChange={(e) => {
            const checked = e.target.checked;
            setState({
              isExpandAll: checked,
              dataSource: checked
                ? expandArrayItems(originalData)
                : collapseArrayItems(originalData),
              isManualOperation: false, // 复选框操作不是手动操作
            });
          }}
        >
          展开所有数组变量
        </Checkbox>
      </div>
      <Table<any>
        bordered
        columns={columns}
        dataSource={dataSource}
        rowKey={(record) => record.key || record.id}
        pagination={false}
        expandable={{
          // expandedRowKeys: expandedRowKeys,
          defaultExpandAllRows: true,
        }}
      />
    </div>
  );
};

export default TestCondition;
