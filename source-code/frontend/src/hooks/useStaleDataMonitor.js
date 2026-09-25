import { useEffect } from "react";
import { useMarketStore } from "../store/marketStore.js";
import { STALE_THRESHOLD_MS } from "../config/env.js";

export function useStaleDataMonitor() {
  const setConnectionStatus = useMarketStore(
    (state) => state.setConnectionStatus
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      const { lastMessageAt, connectionStatus } =
        useMarketStore.getState();

      if (
        lastMessageAt &&
        connectionStatus === "CONNECTED" &&
        Date.now() - lastMessageAt > STALE_THRESHOLD_MS
      ) {
        setConnectionStatus("STALE_DATA");
      }
    }, 500);

    return () => {
      clearInterval(intervalId);
    };
  }, [setConnectionStatus]);
}
