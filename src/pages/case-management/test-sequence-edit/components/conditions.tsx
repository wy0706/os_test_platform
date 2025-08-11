import { useSetState } from "ahooks";
import React, { useEffect, useState } from "react";

const Conditions: React.FC = () => {
  const [state, setState] = useSetState<any>({
    title: "",
  });
  const { title } = state;
  const [data, setData] = useState<any>(null);

  useEffect(() => {}, []);

  return <div className="conditions-page">测试条件</div>;
};

export default Conditions;
