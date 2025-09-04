import { useSetState } from "ahooks";
import { Checkbox, Table } from "antd";
import React, { useEffect } from "react";
interface ResultProps {
  data?: any; //datasource数据
  id?: any;
}
const TestCondition: React.FC<ResultProps> = ({ data, id }) => {
  // 处理数组展开的函数

  const expandArrayItems = (items: any[]): any[] => {
    return items.map((item) => {
      if (item.children) {
        return {
          ...item,
          children: expandArrayItems(item.children),
        };
      } else if (Array.isArray(item.testValue)) {
        // testValue 是数组 → 转换成子节点
        const children = item.testValue.map((value: any, index: number) => ({
          id: `${item.id}_${index}`,
          sequenceName1: index,
          testValue: value,
          isArrayItem: true,
        }));

        return {
          ...item,
          children, // 把展开的数组作为 children
        };
      } else {
        return item;
      }
    });
  };

  const data2 = [
    {
      id: 1,
      extension: "uut测试项目",
      sequenceName1: "	CAN通信测试",
      children: [
        {
          id: 12,
          extension: "CAN报文",
          sequenceName1: "CAN_MSG",
          testValue: "00 01 00 01",
        },
      ],
    },
    {
      id: 3,
      extension: "UUT test测试项目 *2",
      sequenceName1: "LIN通信测试",
      children: [
        {
          id: 5,
          extension: "输入电压",
          sequenceName1: "Vdc",
          testValue: "5.00",
        },
        {
          id: 6,
          extension: "PBZ20 20电压",
          sequenceName1: "V PBZ2020",
          testValue: "5.00",
        },
        {
          id: 7,
          extension: "CAN报文",
          sequenceName1: "CAN_MSG",
          testValue: "5.00",
        },
        {
          id: 8,
          extension: "CAN通道使能",
          sequenceName1: "CAN通道[(2)]",
          testValue: [1, 1],
        },
        {
          id: 10,
          extension: "示波器通道",
          sequenceName1: "示波器通道[(4)]",
          testValue: [0, 1, 0, 0],
        },
      ],
    },
  ];

  const [state, setState] = useSetState<any>({
    isExpandAll: true,
    expandedRowKeys: [],
    originalData: data2,
    dataSource: [],
    columns: [
      {
        title: "扩展名",
        dataIndex: "extension",
        render: (value: any, record: any) => {
          return (
            <span
              style={{
                color:
                  record.children && !Array.isArray(record.testValue)
                    ? "#1890ff"
                    : "#6c757d",
              }}
            >
              {value}
            </span>
          );
        },
      },
      {
        title: "变量名",
        dataIndex: "sequenceName1",
        render: (value: any, record: any) => {
          return (
            <span
              style={{
                color:
                  record.children && !Array.isArray(record.testValue)
                    ? "#1890ff"
                    : "#6c757d",
              }}
            >
              {value}
            </span>
          );
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
              // <span>......</span>
            );
          }
          return <span style={{ color: "#6c757d" }}>{value}</span>;
        },
      },
    ],
  });
  const { isExpandAll, expandedRowKeys, dataSource, columns, originalData } =
    state;

  // 初始化时设置dataSource为原始数据
  useEffect(() => {
    const filteredData = expandArrayItems(data2);
    setState({
      dataSource: filteredData,
      expandedRowKeys: getAllKeys(filteredData), // 这里控制展开});
    });
  }, []);
  // 递归取出所有 key
  const getAllKeys = (data: any[]): React.Key[] => {
    const keys: React.Key[] = [];
    const dfs = (items: any[]) => {
      items.forEach((item) => {
        keys.push(item.id); // 用 rowKey 对应的字段
        if (item.children) {
          dfs(item.children);
        }
      });
    };
    dfs(data);
    return keys;
  };

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
        scroll={{ y: 500 }}
        expandable={{
          expandedRowKeys: expandedRowKeys,
          onExpand: (expanded, record) => {
            setState({
              expandedRowKeys: expanded
                ? [...expandedRowKeys, record.id]
                : expandedRowKeys.filter((key: any) => key !== record.id),
            });
          },
          showExpandColumn: false, // 隐藏展开列
        }}
      />
    </div>
  );
};

export default TestCondition;
