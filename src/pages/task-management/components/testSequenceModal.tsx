import { FolderOutlined, SearchOutlined } from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import { Badge, Button, Input, List, Modal, message } from "antd";
import React, { useEffect, useState } from "react";

interface ModalProps {
  open: boolean;
  onCancel: () => void;
  onOk?: (selectedSequences?: any[]) => void;
}

interface SequenceType {
  id: string;
  name: string;
}

interface TestSequence {
  id: string;
  projectName: string;
  isPublished: boolean;
}

const TestSequenceModal: React.FC<ModalProps> = ({ open, onCancel, onOk }) => {
  const [loading, setLoading] = useState(false);
  const [sequenceTypes, setSequenceTypes] = useState<SequenceType[]>([]);
  const [testSequences, setTestSequences] = useState<TestSequence[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<"ascend" | "descend" | null>(null);
  const [selectedSequences, setSelectedSequences] = useState<TestSequence[]>(
    []
  );
  const [hoveredItem, setHoveredItem] = useState<string>("");
  const [sequenceTypeSearchText, setSequenceTypeSearchText] =
    useState<string>("");

  useEffect(() => {
    if (open) {
      fetchSequenceTypes();
    }
  }, [open]);

  useEffect(() => {
    if (selectedType) {
      fetchTestSequences(selectedType);
    }
  }, [selectedType]);

  const fetchSequenceTypes = async () => {
    setLoading(true);
    try {
      // 模拟数据，实际项目中替换为真实API调用
      const mockData = [
        { id: "1", name: "MGL EV69调试" },
        { id: "2", name: "TJBD" },
        { id: "3", name: "GCCar" },
        { id: "4", name: "GC_CommComand" },
        { id: "5", name: "GCCar_GW" },
        { id: "6", name: "GC_东土" },
        { id: "7", name: "GC-YSW" },
        { id: "8", name: "奕斯伟测试用例" },
        { id: "9", name: "tempTest2" },
        { id: "10", name: "zhy" },
        { id: "11", name: "ESWIN_ABU" },
        { id: "12", name: "奇瑞test" },
        { id: "13", name: "111" },
        { id: "14", name: "test-1" },
        { id: "15", name: "功能安全用例" },
        { id: "16", name: "test113" },
      ];
      setSequenceTypes(mockData);
      if (mockData.length > 0) {
        setSelectedType(mockData[0].id);
      }
    } catch (error) {
      message.error("序列类型加载失败");
    } finally {
      setLoading(false);
    }
  };

  const fetchTestSequences = async (typeId: string) => {
    setLoading(true);
    // 清空之前选中的测试序列，因为数据已经改变
    setSelectedSequences([]);
    try {
      // 模拟数据，根据不同的序列类型ID返回不同的测试序列数据
      const mockDataMap: { [key: string]: TestSequence[] } = {
        "1": [
          { id: "1", projectName: "MGL_EV69_调试_001", isPublished: true },
          { id: "2", projectName: "MGL_EV69_调试_002", isPublished: false },
          { id: "3", projectName: "MGL_EV69_调试_003", isPublished: true },
        ],
        "2": [
          { id: "4", projectName: "TJBD_测试_001", isPublished: true },
          { id: "5", projectName: "TJBD_测试_002", isPublished: false },
          { id: "6", projectName: "TJBD_测试_003", isPublished: true },
        ],
        "3": [
          { id: "7", projectName: "GCCar_通信_001", isPublished: true },
          { id: "8", projectName: "GCCar_通信_002", isPublished: false },
          { id: "9", projectName: "GCCar_通信_003", isPublished: true },
        ],
        "4": [
          { id: "10", projectName: "GC_CommComand_001", isPublished: false },
          { id: "11", projectName: "GC_CommComand_002", isPublished: true },
        ],
        "5": [
          { id: "12", projectName: "GCCar_GW_001", isPublished: true },
          { id: "13", projectName: "GCCar_GW_002", isPublished: false },
        ],
        "6": [
          { id: "14", projectName: "GC_东土_测试_001", isPublished: true },
          { id: "15", projectName: "GC_东土_测试_002", isPublished: false },
        ],
        "7": [
          { id: "16", projectName: "GC-YSW_001", isPublished: true },
          { id: "17", projectName: "GC-YSW_002", isPublished: false },
        ],
        "8": [
          { id: "18", projectName: "奕斯伟_测试用例_001", isPublished: true },
          { id: "19", projectName: "奕斯伟_测试用例_002", isPublished: false },
        ],
        "9": [
          { id: "20", projectName: "tempTest2_001", isPublished: false },
          { id: "21", projectName: "tempTest2_002", isPublished: true },
        ],
        "10": [
          { id: "22", projectName: "zhy_测试_001", isPublished: true },
          { id: "23", projectName: "zhy_测试_002", isPublished: false },
        ],
        "11": [
          { id: "24", projectName: "ESWIN_ABU_001", isPublished: true },
          { id: "25", projectName: "ESWIN_ABU_002", isPublished: false },
        ],
        "12": [
          { id: "26", projectName: "奇瑞test_001", isPublished: true },
          { id: "27", projectName: "奇瑞test_002", isPublished: false },
        ],
        "13": [
          { id: "28", projectName: "111_测试_001", isPublished: false },
          { id: "29", projectName: "111_测试_002", isPublished: true },
        ],
        "14": [
          { id: "30", projectName: "test-1_001", isPublished: true },
          { id: "31", projectName: "test-1_002", isPublished: false },
        ],
        "15": [
          { id: "32", projectName: "功能安全用例_001", isPublished: true },
          { id: "33", projectName: "功能安全用例_002", isPublished: false },
        ],
        "16": [
          { id: "34", projectName: "test113_001", isPublished: true },
          { id: "35", projectName: "test113_002", isPublished: false },
        ],
      };

      const mockData = mockDataMap[typeId] || [];
      setTestSequences(mockData);
    } catch (error) {
      message.error("测试序列加载失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleSequenceTypeSearch = (value: string) => {
    setSequenceTypeSearchText(value);
  };

  const handleSort = () => {
    setSortOrder(sortOrder === "ascend" ? "descend" : "ascend");
  };

  const filteredSequenceTypes = sequenceTypes.filter((type) =>
    type.name.toLowerCase().includes(sequenceTypeSearchText.toLowerCase())
  );

  const filteredSequences = testSequences.filter((sequence) =>
    sequence.projectName.toLowerCase().includes(searchText.toLowerCase())
  );

  const sortedSequences = [...filteredSequences].sort((a, b) => {
    if (sortOrder === "ascend") {
      return a.projectName.localeCompare(b.projectName);
    } else if (sortOrder === "descend") {
      return b.projectName.localeCompare(a.projectName);
    }
    return 0;
  });

  const columns = [
    {
      title: "项目名称",
      dataIndex: "projectName",
      key: "projectName",
      ellipsis: true,
    },
    {
      title: "是否发布",
      dataIndex: "isPublished",
      key: "isPublished",
      width: 100,
      render: (dom: React.ReactNode, entity: TestSequence) => (
        <Badge
          status={entity.isPublished ? "success" : "error"}
          text={entity.isPublished ? "✓" : "✗"}
        />
      ),
      sorter: true,
      search: false,
    },
  ];

  const handleOk = () => {
    if (selectedSequences.length > 0) {
      // message.success(`已选择 ${selectedSequences.length} 个测试序列`);
      console.log("选中的测试序列:", selectedSequences);
    }
    onOk && onOk(selectedSequences);
  };

  const handleCancel = () => {
    setSelectedSequences([]);
    setSearchText("");
    setSortOrder(null);
    onCancel && onCancel();
  };

  return (
    <div style={{ backgroundColor: "#1890ff" }}>
      <Modal
        zIndex={1100}
        title="关联测试序列"
        width={1000}
        open={open}
        onCancel={handleCancel}
        maskClosable={false}
        onOk={handleOk}
        styles={{
          body: {
            maxHeight: 800,
          },
        }}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          <Button key="ok" type="primary" onClick={handleOk}>
            确定
          </Button>,
        ]}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "16px",
            height: 500,
            minHeight: 500,
          }}
        >
          {/* 左侧序列类型列表 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
              width: "250px",
              minWidth: "250px",
              maxHeight: "500px",
              background: "#fff",
              border: "1px solid #d9d9d9",
              borderRadius: "6px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flexShrink: 0,
                background: "#fafafa",
                borderBottom: "1px solid #d9d9d9",
                borderRadius: "6px 6px 0 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  padding: "12px 16px",
                  fontWeight: 600,
                }}
              >
                <FolderOutlined
                  style={{ color: "#1890ff", fontSize: "16px" }}
                />
                序列类型 ({filteredSequenceTypes.length})
              </div>
              <div style={{ padding: "0 16px 12px 16px" }}>
                <Input
                  placeholder="搜索序列类型..."
                  prefix={<SearchOutlined style={{ color: "#999" }} />}
                  value={sequenceTypeSearchText}
                  onChange={(e) => handleSequenceTypeSearch(e.target.value)}
                  // size="small"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            <div
              style={{
                flex: 1,
                maxHeight: "400px",
                padding: 0,
                overflowY: "auto",
              }}
            >
              <List
                dataSource={filteredSequenceTypes}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      margin: 0,
                      padding: "12px 16px",
                      borderBottom: "1px solid #f0f0f0",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      fontWeight: selectedType === item.id ? 500 : "normal",
                      backgroundColor:
                        selectedType === item.id
                          ? "#e6f7ff"
                          : hoveredItem === item.id
                          ? "#f5f5f5"
                          : "transparent",
                      borderLeft:
                        selectedType === item.id ? "3px solid #1890ff" : "none",
                    }}
                    onClick={() => setSelectedType(item.id)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem("")}
                  >
                    {item.name}
                  </List.Item>
                )}
              />
            </div>
          </div>
          {/* 右侧测试序列表格 */}
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              minWidth: 0,
              background: "#fff",
              border: "1px solid #d9d9d9",
              borderRadius: "6px",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                flex: 1,
                padding: 0,
                overflow: "hidden",
              }}
            >
              <ProTable
                columns={columns}
                dataSource={sortedSequences}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  onChange: (page) => {
                    console.log("page", page);
                  },
                }}
                headerTitle="测试序列"
                size="small"
                loading={loading}
                scroll={{ y: 400 }}
                rowSelection={{
                  type: "radio",
                  onChange: (selectedRowKeys, selectedRows) => {
                    setSelectedSequences(selectedRows);
                  },
                }}
                options={false}
                toolBarRender={false}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TestSequenceModal;
