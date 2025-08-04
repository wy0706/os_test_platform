import { Button, Card, Spin, message } from "antd";
import React, { useEffect, useState } from "react";

const addTestCaseModal: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // TODO: 替换为实际接口
      const res = await fakeRequest();
      setData(res);
    } catch (error) {
      message.error("数据加载失败");
    } finally {
      setLoading(false);
    }
  };

  const fakeRequest = async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ msg: "Hello World" }), 1000);
    });
  };

  return (
    <div className="addTestCaseModal-page">
      <Card title="addTestCaseModal" bordered={false}>
        <Spin spinning={loading}>
          <pre>{JSON.stringify(data, null, 2)}</pre>
          <Button onClick={fetchData}>刷新</Button>
        </Spin>
      </Card>
    </div>
  );
};

export default addTestCaseModal;
