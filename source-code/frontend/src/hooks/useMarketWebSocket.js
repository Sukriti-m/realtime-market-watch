import { useEffect, useRef } from "react";
import { useMarketStore } from "../store/marketStore.js";
import { API_URL, WS_URL } from "../config/env.js";
import {
  RECONNECT_BASE_MS,
  RECONNECT_MAX_MS
} from "../../../shared/thresholds.js";

export function useMarketWebSocket() {
  const socketRef = useRef(null);
  const frameRef = useRef(null);
  const pendingRef = useRef([]);
  const attemptRef = useRef(0);
  const lastSeqRef = useRef(0);

  const setConnectionStatus = useMarketStore(
    (state) => state.setConnectionStatus
  );

  useEffect(() => {
    let reconnectTimer = null;
    let shouldReconnect = true;

    function flushPending() {
      frameRef.current = null;
      const pending = pendingRef.current;

      if (!pending.length) {
        return;
      }

      pendingRef.current = [];
      const lastSeq = pending[pending.length - 1].seq;
      const merged = pending.flatMap((item) => item.updates);
      useMarketStore.getState().applyUpdates(merged, lastSeq);
    }

    function queueUpdates(updates, seq) {
      pendingRef.current.push({ updates, seq });

      if (frameRef.current == null) {
        frameRef.current = requestAnimationFrame(flushPending);
      }
    }

    async function resync() {
      try {
        const response = await fetch(`${API_URL}/snapshot`);

        if (!response.ok) {
          return;
        }

        const result = await response.json();

        if (Array.isArray(result.data)) {
          useMarketStore.getState().applySnapshot(
            result.data,
            result.seq
          );

          if (typeof result.seq === "number") {
            lastSeqRef.current = result.seq;
          }
        }
      } catch (error) {
        console.error("Snapshot resync failed", error);
      }
    }

    function handlePayload(message) {
      const { type, seq, data } = message;
      const store = useMarketStore.getState();

      if (type === "HEARTBEAT") {
        store.touchLastMessage();

        if (store.connectionStatus !== "CONNECTED") {
          store.setConnectionStatus("CONNECTED");
        }

        return;
      }

      if (type === "SNAPSHOT") {
        if (Array.isArray(data)) {
          store.applySnapshot(data, seq);
        }

        if (typeof seq === "number") {
          lastSeqRef.current = seq;
        }

        store.setConnectionStatus("CONNECTED");
        return;
      }

      if (type === "MARKET_BATCH" || type === "MARKET_UPDATE") {
        const updates =
          type === "MARKET_BATCH" ? data : [data];

        if (!Array.isArray(updates)) {
          return;
        }

        if (typeof seq === "number" && lastSeqRef.current > 0) {
          if (seq <= lastSeqRef.current) {
            return;
          }

          if (seq > lastSeqRef.current + 1) {
            console.warn(
              `Sequence gap ${lastSeqRef.current} -> ${seq}, resyncing`
            );
            resync();
            return;
          }
        }

        if (typeof seq === "number") {
          lastSeqRef.current = seq;
        }

        queueUpdates(updates, seq);
        store.setConnectionStatus("CONNECTED");
      }
    }

    function connect() {
      setConnectionStatus("RECONNECTING");

      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      socket.onopen = () => {
        attemptRef.current = 0;
        setConnectionStatus("CONNECTED");
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handlePayload(message);
        } catch (error) {
          console.error("Invalid WebSocket message", error);
        }
      };

      socket.onclose = () => {
        setConnectionStatus("DISCONNECTED");

        if (!shouldReconnect) {
          return;
        }

        const delay = Math.min(
          RECONNECT_MAX_MS,
          RECONNECT_BASE_MS * 2 ** attemptRef.current
        );
        attemptRef.current += 1;
        reconnectTimer = setTimeout(connect, delay);
      };

      socket.onerror = () => {
        setConnectionStatus("DISCONNECTED");
      };
    }

    connect();

    return () => {
      shouldReconnect = false;

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
      }

      socketRef.current?.close();
    };
  }, [setConnectionStatus]);

  return socketRef;
}
