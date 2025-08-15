import { useSetState } from "ahooks";
import React, { useEffect, useState } from "react";
const testCondition: React.FC = () => {
  const [state, setState] = useSetState<any>({
    title: "",
  });
  const { title } = state;
  const [data, setData] = useState<any>(null);

  useEffect(() => {}, []);

  return <div className="testCondition-page"></div>;
};

export default testCondition;
