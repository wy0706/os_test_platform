import type {
  DownBk,
  DownGo,
  DownMsg,
  DownPause,
  DownSelfTest,
  DownSelfTestAll,
  DownStep,
  DownStop,
  DownTestProcessCmd,
  DownTestProcessItem,
  DownTestProcessTotal,
} from "./protocol";

export type DispatchCtx = {
  appendLog: (line: string) => void;
  setRunning: (b: boolean) => void;
  setProgress: (p: number) => void;
  highlight: (p: {
    itemindex: number;
    cmdindex: number;
    itemname: string;
    cmdname: string;
  }) => void;
  pushItemResult: (d: DownTestProcessItem["data"]) => void;
  setTotalResult: (d: DownTestProcessTotal["data"]) => void;
};

function isSelfTestWithData(
  m: DownSelfTest
): m is Extract<DownSelfTest, { data: any }> {
  return (m as any).data?.SelfTestResult != null;
}

export function dispatchDown(raw: string, ctx: DispatchCtx) {
  let msg: DownMsg;
  try {
    msg = raw;
  } catch {
    ctx.appendLog(raw);
    return;
  }

  switch (msg.type) {
    /** 自检 */
    case "SelfTest":
      if (isSelfTestWithData(msg)) {
        const { code, SelfTestResult, seq } = msg.data;
        ctx.appendLog(`[自检 #${seq}] ${SelfTestResult} (code=${code})`);
      } else {
        ctx.appendLog(`[自检 #${msg.seq}] ${msg.SelfTestResult}`);
      }
      break;
    case "SelfTestAll":
      ctx.appendLog(
        `[自检汇总 #${(msg as DownSelfTestAll).seq}] ${
          (msg as DownSelfTestAll).SelfTestResult
        }`
      );
      break;

    /** 控制回包 */
    case "RUN": {
      const m = msg?.data;

      console.log("mmm", m);

      ctx.appendLog(
        `▶️ RUN → ${m.code === 0 ? "Succeed" : "Fail"}: ${m.message}`
      );
      if (m.code === 0) ctx.setRunning(true);
      break;
    }
    case "STOP": {
      const m = msg as DownStop;
      ctx.appendLog(
        `🛑 STOP → ${m.code === 0 ? "Succeed" : "Fail"}: ${m.message} (Item=${
          m.CurrentItem
        }, Cmd=${m.CurrentCmd})`
      );
      ctx.setRunning(false);
      break;
    }
    case "STEP": {
      const m = msg as DownStep;
      ctx.appendLog(
        `👣 STEP → ${m.code === 1 ? "Succeed" : "Fail"}: ${m.message} (Item=${
          m.CurrentItem
        }, Cmd=${m.CurrentCmd})`
      );
      break;
    }
    case "PAUSE": {
      const m = msg as DownPause;
      ctx.appendLog(
        `⏸ PAUSE → ${m.code === 0 ? "Succeed" : "Fail"}: ${m.message} (Item=${
          m.CurrentItem
        }, Cmd=${m.CurrentCmd})`
      );
      ctx.setRunning(false);
      break;
    }
    case "GO": {
      const m = msg as DownGo;
      ctx.appendLog(
        `⏯ GO → ${m.code === 0 ? "Succeed" : "Fail"}: ${m.message}`
      );
      if (m.code === 0) ctx.setRunning(true);
      break;
    }
    case "BKPOINT": {
      const m = msg as DownBk;
      ctx.appendLog(
        `🎯 BKPOINT → ${m.code === 0 ? "Succeed" : "Fail"}: ${m.message}`
      );
      break;
    }

    /** 过程 */
    case "TestProcess": {
      if ((msg as any).code === 1) {
        const m = msg as DownTestProcessCmd;
        ctx.highlight({
          itemindex: m.itemindex,
          cmdindex: m.cmdindex,
          itemname: m.itemname,
          cmdname: m.cmdname,
        });
        if (typeof m.Progress === "number") ctx.setProgress(m.Progress);
        if (m.Message) ctx.appendLog(m.Message);
      } else if ((msg as any).code === 2) {
        const m = msg as DownTestProcessItem;
        ctx.pushItemResult(m.data);
      } else if ((msg as any).code === 3) {
        const m = msg as DownTestProcessTotal;
        ctx.setTotalResult(m.data);
        ctx.setRunning(false);
      }
      break;
    }
    case "pong":
      break;
    default:
      ctx.appendLog(`[${msg.type}] ${JSON.stringify(msg)}`);
  }
}
