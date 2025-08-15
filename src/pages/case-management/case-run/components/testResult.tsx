import { useSetState } from "ahooks";
import { Checkbox, Table } from "antd";
import React, { useEffect } from "react";
const testResult: React.FC = () => {
  const [state, setState] = useSetState<any>({
    isExpandAll: false,
    isShowPass: false,
    isShowFail: false,
    expandedRowKeys: [],
    dataSource: [],
    columns: [
      {
        title: "扩展名",
        dataIndex: "extension",
      },
      {
        title: "变量名",
        dataIndex: "varname",
      },
      {
        title: "测试值",
        dataIndex: "testValue",
      },
      {
        title: "范围",
        dataIndex: "range",
      },
      {
        title: "结果",
        dataIndex: "result",
      },
    ],
  });
  const {
    isExpandAll,
    isShowPass,
    isShowFail,
    expandedRowKeys,
    dataSource,
    columns,
  } = state;

  useEffect(() => {}, []);

  return (
    <div className="testResult-page">
      <div
        style={{
          marginBottom: 10,
        }}
      >
        <Checkbox
          style={{ marginRight: 15 }}
          checked={isExpandAll}
          onChange={(e) => {
            setState({ isExpandAll: e.target.checked });
            const checked = e.target.checked;
          }}
        >
          展开所有数组变量
        </Checkbox>
        <Checkbox
          style={{ marginRight: 15 }}
          checked={isShowPass}
          onChange={(e) => {
            const checked = e.target.checked;
            setState({ isShowPass: checked });
          }}
        >
          显示PASS数据
        </Checkbox>
        <Checkbox
          checked={isShowFail}
          onChange={(e) => {
            const checked = e.target.checked;
            setState({ isShowFail: checked });
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
        // expandable={{
        //   expandedRowKeys: expandedRowKeys,
        //   onExpand: (expanded, record) => {
        //     let newExpandedKeys: any[];
        //     const recordKey = record.key || record.id;
        //     if (expanded) {
        //       // 展开行：添加到expandedRowKeys
        //       newExpandedKeys = [...expandedRowKeys, recordKey];
        //     } else {
        //       // 收起行：从expandedRowKeys中移除
        //       newExpandedKeys = expandedRowKeys.filter(
        //         (key: any) => key !== recordKey
        //       );
        //     }

        //     // 检查是否所有可展开的行都已展开
        //     const allExpandableKeys = dataSource
        //       .filter((item: any) => item.children && item.children.length > 0)
        //       .map((item: any) => item.key || item.id);
        //     const allExpanded = allExpandableKeys.every((key: any) =>
        //       newExpandedKeys.includes(key)
        //     );

        //     setState({
        //       expandedRowKeys: newExpandedKeys,
        //       isExpandAll: allExpanded,
        //     });
        //   },
        //   // 只有有children的行才显示展开按钮
        //   rowExpandable: (record) =>
        //     !!(record.children && record.children.length > 0),
        // }}
      />
    </div>
  );
};

export default testResult;
