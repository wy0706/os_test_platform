import React, { useEffect, useState } from "react";

const TemporaryVariables: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {}, []);

  return <div className="temporaryVariables-page">临时变量</div>;
};

export default TemporaryVariables;
