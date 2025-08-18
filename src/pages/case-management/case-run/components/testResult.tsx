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
    isManualOperation: false, // 标记是否为手动操作
    expandedRowKeys: [],
    originalDataSource: [
      // 保存原始数据
      {
        id: 1,
        extension: "UUT test测试项目 *6",
        result: "PASS",
        children: [
          {
            id: 5,
            sequenceName: "test_add",
            // varname: "testResult",
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
                id: 4,
                varname: "b",
                testValue: "3.00",
                range: "0.00---20000.00",
                result: "PASS",
              },
            ],
          },
        ],
      },
      {
        id: 6,
        extension: "UUT test测试项目 *7",
        result: "FAIL",
        children: [
          {
            id: 7,
            sequenceName: "test_add",
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
      },
    ],
    dataSource: [], // 当前显示的数据，会根据过滤条件变化
    columns: [
      {
        title: "扩展名",
        dataIndex: "extension",
      },
      {
        title: "变量名",
        dataIndex: "sequenceName",
        render: (text: string) => (
          <span style={{ color: "#1890ff" }}>{text}</span>
        ),
      },
      {
        title: "变量名",
        dataIndex: "varname",
      },
      {
        title: "测试值",
        dataIndex: "testValue",
        render: (text: string, record: any) => (
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
        ),
      },
      {
        title: "范围",
        dataIndex: "range",
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
    isManualOperation,
    expandedRowKeys,
    originalDataSource,
    dataSource,
    columns,
  } = state;

  // 根据过滤条件计算当前应显示的数据
  const getFilteredDataSource = (): any[] => {
    let filtered = [...originalDataSource];

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

  // 计算应该展开的行键
  const getExpandedKeys = (): any[] => {
    let keys: any[] = [];
    dataSource.forEach((item: any) => {
      if (item.children && item.children.length > 0) {
        // 第一级始终展开
        keys.push(item.id);

        // 如果"展开所有数组变量"勾选，则展开第二级
        if (isExpandAll) {
          item.children.forEach((child: any) => {
            if (child.children && child.children.length > 0) {
              keys.push(child.id);
            }
          });
        }
      }
    });
    return keys;
  };

  // 初始化时设置dataSource为原始数据
  useEffect(() => {
    const filteredData = getFilteredDataSource();
    setState({ dataSource: filteredData });
  }, [isShowPass, isShowFail, originalDataSource]);

  useEffect(() => {
    // 只有在非手动操作时才根据isExpandAll计算展开状态
    if (!isManualOperation) {
      const newExpandedKeys = getExpandedKeys();
      setState({ expandedRowKeys: newExpandedKeys });
    }
  }, [dataSource, isExpandAll]);

  // 当isExpandAll状态通过复选框改变时，重置手动操作标记
  useEffect(() => {
    if (!isManualOperation) {
      // 延迟重置，确保状态更新完成
      setTimeout(() => {
        setState({ isManualOperation: false });
      }, 0);
    }
  }, [isExpandAll]);

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
              isManualOperation: false, // 复选框操作不是手动操作
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
        columns={columns}
        dataSource={dataSource}
        rowKey={(record) => record.key || record.id}
        pagination={false}
        expandable={{
          expandedRowKeys: expandedRowKeys,
          onExpand: (expanded, record) => {
            let newExpandedKeys: any[];
            const recordKey = record.key || record.id;
            if (expanded) {
              // 展开行：添加到expandedRowKeys
              newExpandedKeys = [...expandedRowKeys, recordKey];
            } else {
              // 收起行：从expandedRowKeys中移除
              newExpandedKeys = expandedRowKeys.filter(
                (key: any) => key !== recordKey
              );
            }

            // 检查是否所有第二级都已展开，更新"展开所有数组变量"状态
            const getAllSecondLevelKeys = (): any[] => {
              let keys: any[] = [];
              dataSource.forEach((item: any) => {
                if (item.children && item.children.length > 0) {
                  item.children.forEach((child: any) => {
                    if (child.children && child.children.length > 0) {
                      keys.push(child.id);
                    }
                  });
                }
              });
              return keys;
            };

            const allSecondLevelKeys = getAllSecondLevelKeys();
            const allSecondLevelExpanded = allSecondLevelKeys.every((key) =>
              newExpandedKeys.includes(key)
            );

            setState({
              expandedRowKeys: newExpandedKeys,
              isExpandAll: allSecondLevelExpanded,
              isManualOperation: true, // 标记为手动操作
            });
          },
          // 只有有children的行才显示展开按钮
          rowExpandable: (record) =>
            !!(record.children && record.children.length > 0),
        }}
      />
    </div>
  );
};

export default TestResult;
