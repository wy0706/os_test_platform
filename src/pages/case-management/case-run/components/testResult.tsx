import { useSetState } from "ahooks";
import { Checkbox, Table } from "antd";
import React, { useEffect, useImperativeHandle, useRef } from "react";

interface BackendResultItem {
  itemindex?: number;
  itemname: string; // 父级变量名
  itemtype: string; // 扩展名来源
  resultinfo: Array<{
    resultid?: number;
    name: string; // 子级变量名
    Value: any; // 测试值
    result?: "PASS" | "FAIL" | ""; // 结果
    resultarray?: Array<"PASS" | "FAIL" | "">;
  }>;
}

interface ResultProps {
  itemResults: BackendResultItem[]; // 后端返回数据
}

const TestResult = React.forwardRef<any, ResultProps>(
  ({ itemResults }, ref) => {
    const [state, setState] = useSetState<any>({
      isExpandAll: true,
      isShowPass: true,
      isShowFail: true,
      expandedRowKeys: [],
      originalDataSource: [],
      dataSource: [],
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
                color: record.__isParent ? "#1890ff" : "#6c757d",
                paddingLeft: !!record.isArrayItem ? 10 : 0,
              }}
            >
              {text}
            </span>
          ),
        },
        {
          title: "测试值",
          dataIndex: "testValue",
          render: (text: any, record: any) => {
            if (Array.isArray(text)) {
              return <span style={{ color: "#6c757d" }}>...</span>;
            }
            return (
              <span
                style={{
                  color:
                    record.varname !== "TestResult" && record.result === "FAIL"
                      ? "red"
                      : "inherit",
                }}
              >
                {String(text ?? "")}
              </span>
            );
          },
        },
        {
          title: "范围",
          dataIndex: "range",
          render: (text: any) =>
            Array.isArray(text) ? (
              <span style={{ color: "#6c757d" }}>...</span>
            ) : (
              <span>{text}</span>
            ),
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
      activeParentId: undefined, //  当前要高亮/滚动的父级itemindex
      pendingScrollId: undefined, //  等数据就绪后再滚动
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
    const rootRef = useRef<HTMLDivElement>(null);
    // 暴露给父组件/RunLeftPage 调用
    useImperativeHandle(ref, () => ({
      ensureVisibleByItemIndex: (idx: number | string) => {
        setState({
          isExpandAll: true, // 展开，保证父行可见
          pendingScrollId: idx, // 等数据刷新后滚
        });
      },
    }));

    // —— 新增：把后端数据转成表格 datasource ——
    const transformFromBackend = (items: BackendResultItem[]) => {
      const rows = items.map((it, parentIdx) => {
        const children =
          it.resultinfo?.map((ri, idx) => {
            const { MinValue, MaxValue, Value, resultarray } = ri as any;

            return {
              id: `${it.itemindex ?? parentIdx + 1}-${ri.resultid ?? idx + 1}`,
              varname: ri.name,
              testValue: Value ?? "",
              range: buildRange(MinValue, MaxValue, Value),
              result: ri.result ?? "",
              resultarray: Array.isArray(resultarray) ? resultarray : undefined, // ⭐新增
            };
          }) ?? [];

        // 父级汇总（可要可不要，与你的过滤逻辑一致即可）
        const hasFail = children.some((c: any) => c.result === "FAIL");
        const hasAny = children.some(
          (c: any) => c.result === "PASS" || c.result === "FAIL"
        );
        // const parentResult = hasAny ? (hasFail ? "FAIL" : "PASS") : "";

        return {
          id: it.itemindex ?? parentIdx + 1,
          __isParent: true,
          extension: `${it.itemtype} 测试项目 * ${it.resultinfo?.length ?? 0}`,
          result: "",
          varname: it.itemname,
          children,
        };
      });

      return rows;
    };

    // 判断是否保留某个结果
    const includeByResult = (r: string) =>
      (state.isShowPass || r !== "PASS") && (state.isShowFail || r !== "FAIL");

    // 核心递归过滤函数
    const filterTreeByChildrenResult = (items: any[]): any[] => {
      return items
        .map((item) => {
          const result = item.result ?? "";
          const hasSelfResult = result === "PASS" || result === "FAIL";

          // 1️⃣ 如果自身是 PASS/FAIL 且被过滤掉，则整个节点（含子树）删除
          if (hasSelfResult && !includeByResult(result)) {
            return null;
          }

          // 2️⃣ 处理子节点（递归）
          let keptChildren: any[] = [];
          if (Array.isArray(item.children) && item.children.length > 0) {
            keptChildren = filterTreeByChildrenResult(item.children);
          }

          // 3️⃣ 决定是否保留父节点：
          // - 有子节点 ⇒ 只保留那些子节点不为空的父节点
          // - 没有子节点 ⇒ 如果自身 result 被保留则保留，否则删掉
          const shouldKeep =
            keptChildren.length > 0 ||
            (!hasSelfResult && !item.children?.length) ||
            (hasSelfResult && includeByResult(result));

          if (!shouldKeep) return null;

          return keptChildren.length > 0
            ? { ...item, children: keptChildren }
            : { ...item, children: [] };
        })
        .filter(Boolean) as any[];
    };
    const buildRange = (MinValue: any, MaxValue: any, Value: any) => {
      const toText = (v: any) =>
        v !== undefined && v !== "" ? String(v) : "占位";

      // 数组范围：一一对应
      if (Array.isArray(MinValue) && Array.isArray(MaxValue)) {
        const len = Math.max(
          MinValue.length,
          MaxValue.length,
          Array.isArray(Value) ? Value.length : 0
        );
        const arr: string[] = [];
        for (let i = 0; i < len; i++) {
          arr.push(`${toText(MinValue[i])} ~ ${toText(MaxValue[i])}`);
        }
        return arr; // ← 保留为数组，供 expandArrayItems 对应到子行
      }

      // 标量范围：单个字符串
      if (MinValue !== undefined || MaxValue !== undefined) {
        return `${toText(MinValue)} ~ ${toText(MaxValue)}`;
      }

      return ""; // 无范围
    };
    useEffect(() => {
      // 后端数据到达时，刷新原始数据并触发过滤/展开
      if (Array.isArray(itemResults)) {
        setState({ originalDataSource: transformFromBackend(itemResults) });
      }
    }, [itemResults]);
    useEffect(() => {
      updateDataSource();
    }, [isShowPass, isShowFail, isExpandAll, originalDataSource]);
    useEffect(() => {
      const targetId = state.pendingScrollId;
      if (!targetId) return;

      // antd 表体
      const body =
        rootRef.current?.querySelector<HTMLElement>(".ant-table-body");
      const row = body?.querySelector<HTMLElement>(
        `tr[data-row-key="${targetId}"]`
      );

      if (body && row) {
        const rowTop = row.offsetTop;
        const rowBottom = rowTop + row.offsetHeight;
        const viewTop = body.scrollTop;
        const viewBottom = viewTop + body.clientHeight;

        // 若不在可视区，滚到近邻位置
        if (rowTop < viewTop || rowBottom > viewBottom) {
          body.scrollTo({ top: Math.max(rowTop - 24, 0), behavior: "smooth" });
        }
      }

      // 清理 pending
      setState({ pendingScrollId: undefined });
    }, [state.dataSource, state.pendingScrollId]);
    // —— 展开数组/合并逻辑保留（以防某些 testValue 是数组） ——
    const expandArrayItems = (items: any[]): any[] =>
      items.map((item) => {
        if (item.children) {
          return { ...item, children: expandArrayItems(item.children) };
        } else if (Array.isArray(item.testValue)) {
          const children = item.testValue.map((value: any, index: number) => {
            const arrResult = Array.isArray(item.resultarray)
              ? item.resultarray[index]
              : "";

            return {
              id: `${item.id}_${index}`,
              varname: index,
              testValue: value,
              isArrayItem: true,
              range: Array.isArray(item.range)
                ? item.range[index]
                : item.range || "",
              // 展示规则：PASS → 空，FAIL → FAIL
              result: arrResult === "FAIL" ? "FAIL" : "",
            };
          });
          return { ...item, children };
        }
        return item;
      });

    const getAllKeys = (data: any[]): React.Key[] => {
      const keys: React.Key[] = [];
      const dfs = (items: any[]) =>
        items.forEach((item) => {
          keys.push(item.id);
          if (item.children) dfs(item.children);
        });
      dfs(data);
      return keys;
    };

    const updateDataSource = () => {
      const processed = isExpandAll
        ? expandArrayItems(originalDataSource)
        : originalDataSource;

      const filtered = filterTreeByChildrenResult(processed);

      setState({
        dataSource: filtered,
        expandedRowKeys: getAllKeys(filtered),
      });
    };

    return (
      <div className="TestResult-page" ref={rootRef}>
        <div style={{ marginBottom: 10 }}>
          <Checkbox
            style={{ marginRight: 15 }}
            checked={isExpandAll}
            onChange={(e) => setState({ isExpandAll: e.target.checked })}
          >
            展开所有数组变量
          </Checkbox>
          <Checkbox
            style={{ marginRight: 15 }}
            checked={isShowPass}
            onChange={(e) => setState({ isShowPass: e.target.checked })}
          >
            显示PASS数据
          </Checkbox>
          <Checkbox
            checked={isShowFail}
            onChange={(e) => setState({ isShowFail: e.target.checked })}
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
  }
);

export default TestResult;
