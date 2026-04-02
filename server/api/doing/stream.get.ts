import { subscribeDoing } from "../../utils/doing-channel";
import { readDoing } from "../../utils/doing-store";

export default defineEventHandler(async (event) => {
  setHeader(event, "Content-Type", "text/event-stream");
  setHeader(event, "Cache-Control", "no-cache, no-transform");
  setHeader(event, "Connection", "keep-alive");

  const res = event.node.res;

  const sendEvent = (type: string, payload: unknown) => {
    res.write(`event: ${type}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  const current = await readDoing();
  sendEvent("snapshot", {
    data: current,
    ts: Date.now(),
  });

  const unsubscribe = subscribeDoing((data) => {
    sendEvent("update", {
      data,
      ts: Date.now(),
    });
  });

  const heartbeatTimer = setInterval(() => {
    sendEvent("ping", {
      ts: Date.now(),
    });
  }, 25000);

  event.node.req.on("close", () => {
    clearInterval(heartbeatTimer);
    unsubscribe();
    res.end();
  });

  return new Promise(() => {});
});
