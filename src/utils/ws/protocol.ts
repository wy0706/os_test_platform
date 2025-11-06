/** 上行（客户端 -> 服务端） */
export type UpMsg =
  | { type: "SelfTest" }
  | { type: "RUN" }
  | { type: "STOP" }
  | { type: "STEP"; method: 0 | 1; StartItem: number; StartCmd: number } // 0-项目单步 1-命令单步
  | { type: "PAUSE" }
  | { type: "GO" }
  | { type: "BKPOINT"; method: 0 | 1; StartItem: number; StartCmd: number }
  | { type: "ping" };

/** 下行（服务端 -> 客户端） */
// 自检
export type DownSelfTest =
  | {
      type: "SelfTest";
      data: { code: 0 | 1; SelfTestResult: string; seq: number };
    }
  | { type: "SelfTest"; SelfTestResult: string; seq: number };
export type DownSelfTestAll = {
  type: "SelfTestAll";
  SelfTestResult: string;
  seq: number;
};

// 控制回包
export type DownRun = { type: "RUN"; code: 0 | 1; message: string };
export type DownStop = {
  type: "STOP";
  code: 0 | 1;
  message: string;
  CurrentItem: number;
  CurrentCmd: number;
};
export type DownStep = {
  type: "STEP";
  code: 0 | 1;
  message: string;
  CurrentItem: number;
  CurrentCmd: number;
};
export type DownPause = {
  type: "PAUSE";
  code: 0 | 1;
  message: string;
  CurrentItem: number;
  CurrentCmd: number;
};
export type DownGo = { type: "GO"; code: 0 | 1; message: string };
export type DownBk = { type: "BKPOINT"; code: 0 | 1; message: string };

// 测试过程
export type DownTestProcessCmd = {
  type: "TestProcess";
  code: 1;
  itemindex: number;
  itemname: string;
  cmdindex: number;
  cmdname: string;
  Message: string;
  Progress: number;
};
export type ResultInfo = {
  resultid: number;
  name: string;
  value: string;
  result: "PASS" | "FAIL" | "SKIP" | "RUNNING" | "PENDING";
};
export type DownTestProcessItem = {
  type: "TestProcess";
  code: 2;
  data: {
    itemindex: number;
    itemname: string;
    testtime: string | number;
    resultInfo: ResultInfo[];
  };
};
export type DownTestProcessTotal = {
  type: "TestProcess";
  code: 3;
  data: { Result: "PASS" | "FAIL"; TestEndTime: string; TotalTesttime: number };
};

export type DownMsg =
  | DownSelfTest
  | DownSelfTestAll
  | DownRun
  | DownStop
  | DownStep
  | DownPause
  | DownGo
  | DownBk
  | DownTestProcessCmd
  | DownTestProcessItem
  | DownTestProcessTotal
  | { type: "pong" }
  | { type: string; [k: string]: any }; // 兜底
