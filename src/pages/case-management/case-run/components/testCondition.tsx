import { getConditionalInfoList } from "@/services/case-management/case-run.service";
import { useSetState } from "ahooks";
import { Checkbox, message, Table } from "antd";
import React, { useEffect } from "react";

interface ResultProps {
  id: any;
}

type ApiItem = {
  itemindex: number;
  UUTType: string;
  itemName: string;
  info: Array<{
    conditionindex: number;
    conditionname: string;
    conditionvalue: any;
  }>;
};

const TestCondition: React.FC<ResultProps> = ({ id }) => {
  /** ---------- 映射函数：API -> Table 树数据 ---------- */
  const mapApiToTree = (list: ApiItem[] = []) => {
    if (!Array.isArray(list) || list.length === 0) return [];

    return list.map((it) => {
      const parentId = `p-${it.itemindex}`;
      return {
        id: parentId,
        level: 0, // 父层
        extension: `${it.UUTType} 测试项目 * ${it.info?.length ?? 0}`,
        sequenceName1: it.itemName,
        testValue: "",
        children: (it.info || []).map((c) => {
          const isArray = Array.isArray(c.conditionvalue);
          return {
            id: `c-${it.itemindex}-${c.conditionindex}`,
            level: 1, // 子层（变量）
            extension: "",
            sequenceName1: isArray
              ? `${c.conditionname}  [ ${c.conditionvalue.length} ]`
              : c.conditionname,
            testValue: c.conditionvalue,
          };
        }),
      };
    });
  };

  /** ---------- 展开数组变量 ---------- */
  const expandArrayItems = (items: any[]): any[] =>
    items.map((item) => {
      const hasChildren = Array.isArray(item.children) && item.children.length;
      if (hasChildren) {
        return { ...item, children: expandArrayItems(item.children) };
      }
      if (Array.isArray(item.testValue)) {
        const baseLevel = item.level ?? 1;
        const children = item.testValue.map((value: any, index: number) => ({
          id: `${item.id}_${index}`,
          level: baseLevel + 1, // 索引行为更深一层
          extension: "",
          sequenceName1: index,
          testValue: value,
          isArrayItem: true, // 标注为数组项（索引行）
        }));
        return { ...item, children };
      }
      return item;
    });

  const collapseArrayItems = (items: any[]): any[] =>
    items.map((item) => {
      if (Array.isArray(item.children) && item.children.length) {
        return { ...item, children: collapseArrayItems(item.children) };
      }
      return item;
    });

  const getAllKeys = (data: any[]): React.Key[] => {
    const keys: React.Key[] = [];
    const dfs = (arr: any[]) => {
      arr.forEach((it) => {
        keys.push(it.id);
        if (Array.isArray(it.children) && it.children.length) dfs(it.children);
      });
    };
    dfs(data);
    return keys;
  };

  const [state, setState] = useSetState<any>({
    isExpandAll: true,
    expandedRowKeys: [],
    originalData: [],
    dataSource: [],

    loading: false,
  });

  const {
    isExpandAll,
    expandedRowKeys,
    originalData,
    dataSource,

    loading,
  } = state;
  const columns: any = [
    {
      title: "扩展名",
      dataIndex: "extension",
      render: (value: any) => (
        <span style={{ color: "#1890ff", fontWeight: 500 }}>{value}</span>
      ),
    },
    {
      title: "变量名",
      dataIndex: "sequenceName1",
      render: (value: any, record: any) => {
        const hasChildren =
          Array.isArray(record.children) && record.children.length;
        const isArrayItem = !!record.isArrayItem; // 0/1/2/3 这些
        const color =
          hasChildren && !Array.isArray(record.testValue)
            ? "#1890ff"
            : "#6c757d";

        return (
          <div style={{ paddingLeft: isArrayItem ? 10 : 0, color }}>
            {value}
          </div>
        );
      },
    },
    {
      title: "设定值",
      dataIndex: "testValue",
      render: (value: any) =>
        Array.isArray(value) ? (
          // <span style={{ color: "#6c757d" }}>{JSON.stringify(value)}</span>
          <span style={{ color: "#6c757d" }}>...</span>
        ) : (
          <span style={{ color: "#6c757d" }}>{value}</span>
        ),
    },
  ];
  /** ---------- 拉取数据并映射 ---------- */
  const requestData = async () => {
    try {
      if (!id) return;
      setState({
        loading: true,
      });
      const { code, data, message: msg } = await getConditionalInfoList(id);
      if (code !== 0) {
        message.error(msg || "获取测试条件失败");
        setState({ originalData: [], dataSource: [], expandedRowKeys: [] });
        return;
      }

      const mapped = mapApiToTree(data as ApiItem[]);
      const ds = isExpandAll
        ? expandArrayItems(mapped)
        : collapseArrayItems(mapped);

      setState({
        originalData: mapped,
        dataSource: ds,
        expandedRowKeys: getAllKeys(ds),
      });
    } catch {
      setState({ originalData: [], dataSource: [], expandedRowKeys: [] });
    } finally {
      setState({
        loading: false,
      });
    }
  };

  useEffect(() => {
    requestData();
  }, [id]);

  return (
    <div className="testCondition-page">
      <div style={{ marginBottom: 10 }}>
        <Checkbox
          style={{ marginRight: 15 }}
          checked={isExpandAll}
          onChange={(e) => {
            const checked = e.target.checked;
            const ds = checked
              ? expandArrayItems(originalData)
              : collapseArrayItems(originalData);
            setState({
              isExpandAll: checked,
              dataSource: ds,
              expandedRowKeys: getAllKeys(ds),
            });
          }}
        >
          展开所有数组变量
        </Checkbox>
      </div>

      <Table
        bordered
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        rowKey={(record) => record.id}
        pagination={false}
        scroll={{ y: 500 }}
        expandable={{
          expandedRowKeys,
          onExpand: (expanded, record) => {
            setState({
              expandedRowKeys: expanded
                ? [...expandedRowKeys, record.id]
                : expandedRowKeys.filter((k: any) => k !== record.id),
            });
          },
          showExpandColumn: false,
        }}
      />
    </div>
  );
};

export default TestCondition;
