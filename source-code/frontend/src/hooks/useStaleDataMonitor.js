import { useEffect } from "react";

import {
  useMarketStore
} from "../store/marketStore.js";

const STALE_THRESHOLD_MS = 2000;

export function useStaleDataMonitor() {
  const lastMessageAt =
    useMarketStore(
      (state) => state.lastMessageAt
    );

  const connectionStatus =
    useMarketStore(
      (state) => state.connectionStatus
    );

  const setConnectionStatus =
    useMarketStore(
      (state) => state.setConnectionStatus
    );

  useEffect(() => {
    if (
      !lastMessageAt ||
      connectionStatus !== "CONNECTED"
    ) {
      return;
    }

    const intervalId =
      setInterval(() => {
        const elapsed =
          Date.now() - lastMessageAt;

        if (
          elapsed > STALE_THRESHOLD_MS
        ) {
          setConnectionStatus(
            "STALE_DATA"
          );
        }
      }, 500);

    return () => {
      clearInterval(intervalId);
    };
  }, [
    lastMessageAt,
    connectionStatus,
    setConnectionStatus
  ]);
}