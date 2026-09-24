import {
  HEARTBEAT_MS
} from "../../../shared/thresholds.js";

export function createStreamMiddleware({
  broadcast,
  heartbeatMs = HEARTBEAT_MS
}) {
  let seq = 0;
  let heartbeatId = null;

  function nextSeq() {
    seq += 1;
    return seq;
  }

  function getSeq() {
    return seq;
  }

  function publishBatch(updates) {
    if (!updates.length) {
      return;
    }

    broadcast({
      type: "MARKET_BATCH",
      seq: nextSeq(),
      timestamp: Date.now(),
      data: updates
    });
  }

  function publishSnapshot(snapshot) {
    broadcast({
      type: "SNAPSHOT",
      seq,
      timestamp: Date.now(),
      data: snapshot
    });
  }

  function start() {
    if (heartbeatId) {
      return;
    }

    heartbeatId = setInterval(() => {
      broadcast({
        type: "HEARTBEAT",
        seq,
        timestamp: Date.now()
      });
    }, heartbeatMs);
  }

  function stop() {
    if (!heartbeatId) {
      return;
    }

    clearInterval(heartbeatId);
    heartbeatId = null;
  }

  return {
    getSeq,
    publishBatch,
    publishSnapshot,
    start,
    stop
  };
}
