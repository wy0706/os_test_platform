import { useSetState } from "ahooks";
import { Checkbox, Table } from "antd";
import React, { useEffect } from "react";
interface ResultProps {
  data?: any; //datasource数据
  id?: any;
}
const TestResult: React.FC<ResultProps> = ({ data, id }) => {
  const [state, setState] = useSetState<any>({
    isExpandAll: true,
    isShowPass: true,
    isShowFail: true,
    // isManualOperation: false, // 标记是否为手动操作
    expandedRowKeys: [],
    originalDataSource: [
      // 保存原始数据
      {
        id: 1,
        extension: "UUT test测试项目 *6",
        result: "PASS",
        varname: "test_add",
        children: [
          {
            id: 2,
            varname: "TestResult",
            testValue: "PASS",
            range: "",
            result: "",
          },
          {
            id: 3,
            varname: "ElapsedTime",
            testValue: "30 ms",
            range: "",
            result: "",
          },
          {
            id: 32,
            varname: "byte_result[4]",
            testValue: ["01", "02", "03", "04"],
            range: ["0 - 2000", "2 - 2000", "3 - 2000", " 0 - 20000"],
            result: "",
          },
          {
            id: 4,
            varname: "b",
            testValue: "3.00",
            range: "0.00---20000.00",
            result: "PASS",
          },
        ],
      },
      {
        id: 6,
        extension: "UUT test测试项目 *7",
        result: "FAIL",
        varname: "test_add",
        children: [
          {
            id: 8,
            varname: "TestResult",
            testValue: "PASS",
            range: "",
            result: "",
          },
          {
            id: 9,
            varname: "ElapsedTime",
            testValue: "49 ms",
            range: "",
            result: "",
          },
          {
            id: 10,
            varname: "b",
            testValue: "5.00",
            range: "0.00---4.00",
            result: "FAIL",
          },
        ],
      },
    ],
    dataSource: [], // 当前显示的数据，会根据过滤条件变化
    columns: [
      {
        title: "扩展名",
        dataIndex: "extension",
        render: (text: string) => (
          <span style={{ color: "#1890ff" }}>{text}</span>
        ),
      },
      {
        title: "变量名",
        dataIndex: "varname",
        render: (text: string, record: any) => (
          <span
            style={{
              color:
                record.children && !Array.isArray(record.testValue)
                  ? "#1890ff"
                  : "#6c757d",
            }}
          >
            {text}
          </span>
        ),
      },
      {
        title: "测试值",
        dataIndex: "testValue",
        render: (text: string, record: any) => {
          if (Array.isArray(text)) {
            return (
              <span style={{ color: "#6c757d" }}>{JSON.stringify(text)}</span>
            );
          } else {
            return (
              <span
                style={{
                  color:
                    record.varname !== "TestResult" && record.result === "FAIL"
                      ? "red"
                      : "inherit",
                }}
              >
                {text}
              </span>
            );
          }
        },
      },
      {
        title: "范围",
        dataIndex: "range",
        render: (text: any, record: any) => {
          if (Array.isArray(text)) {
            return (
              <span style={{ color: "#6c757d" }}>{JSON.stringify(text)}</span>
            );
          } else {
            return <span>{text}</span>;
          }
        },
      },
      {
        title: "结果",
        dataIndex: "result",
        render: (text: string) => (
          <span style={{ color: text === "FAIL" ? "red" : "inherit" }}>
            {text}
          </span>
        ),
      },
    ],
  });
  const {
    isExpandAll,
    isShowPass,
    isShowFail,
    expandedRowKeys,
    originalDataSource,
    dataSource,
    columns,
  } = state;
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
          varname: index,
          testValue: value,
          isArrayItem: true,
          range: Array.isArray(item.range)
            ? item.range[index]
            : item.range || "",
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

  // 根据过滤条件计算当前应显示的数据
  const getFilteredDataSource = (data: any): any[] => {
    let filtered = [...data];
    // 根据PASS和FAIL的勾选状态过滤数据
    if (!isShowPass && !isShowFail) {
      // 两个都不选，显示空数据
      return [];
    } else if (isShowPass && !isShowFail) {
      // 只显示PASS
      filtered = filtered.filter((item: any) => item.result === "PASS");
    } else if (!isShowPass && isShowFail) {
      // 只显示FAIL
      filtered = filtered.filter((item: any) => item.result === "FAIL");
    }
    // 如果两个都选中，显示所有数据（不过滤）

    return filtered;
  };

  const updateDataSource = () => {
    const processed = isExpandAll
      ? expandArrayItems(originalDataSource)
      : originalDataSource;
    const filtered = getFilteredDataSource(processed);
    setState({
      dataSource: filtered,
      expandedRowKeys: getAllKeys(filtered), // 默认展开所有行
    });
  };
  useEffect(() => {
    updateDataSource();
  }, [isShowPass, isShowFail, isExpandAll, originalDataSource]);

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

  return (
    <div className="TestResult-page">
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
              // expandedRowKeys: checked ? getAllKeys(dataSource) : [],
            });
          }}
        >
          展开所有数组变量
        </Checkbox>
        <Checkbox
          style={{ marginRight: 15 }}
          checked={isShowPass}
          onChange={(e) => {
            const checked = e.target.checked;
            setState({
              isShowPass: checked,
            });
          }}
        >
          显示PASS数据
        </Checkbox>
        <Checkbox
          checked={isShowFail}
          onChange={(e) => {
            const checked = e.target.checked;
            setState({
              isShowFail: checked,
            });
          }}
        >
          显示FAIL数据
        </Checkbox>
      </div>
      <Table<any>
        bordered
        scroll={{ y: 500 }}
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        pagination={false}
        expandable={{
          expandedRowKeys,
          onExpand: (expanded, record) => {
            setState({
              expandedRowKeys: expanded
                ? [...expandedRowKeys, record.id]
                : expandedRowKeys.filter((key: any) => key !== record.id),
            });
          },
          showExpandColumn: false,
        }}
      />
    </div>
  );
};

export default TestResult;
