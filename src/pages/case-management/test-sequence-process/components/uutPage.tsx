import { useSetState } from "ahooks";
import React, { useEffect, useState } from "react";
const UutPage: React.FC = () => {
  const [state, setState] = useSetState<any>({
    title: "",
  });
  const { title } = state;
  const [data, setData] = useState<any>(null);

  useEffect(() => {}, []);

  return <div className="uutPage-page"></div>;
};

export default UutPage;
