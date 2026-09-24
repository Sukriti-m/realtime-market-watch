import { useEffect, useRef } from "react";
import { useMarketStore } from "../store/marketStore.js";

const WS_URL = "ws://localhost:4000/stream";

export function useMarketWebSocket() {
  const socketRef = useRef(null);

  const setConnectionStatus = useMarketStore(
    (state) => state.setConnectionStatus
  );

  const updateMarketData = useMarketStore(
    (state) => state.updateMarketData
  );

  useEffect(() => {
    let reconnectTimer = null;
    let shouldReconnect = true;

    function connect() {
      setConnectionStatus("RECONNECTING");

      const socket = new WebSocket(WS_URL);

      socketRef.current = socket;

      socket.onopen = () => {
        setConnectionStatus("CONNECTED");
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === "MARKET_UPDATE") {
            updateMarketData(message.data);
            setConnectionStatus("CONNECTED");
          }

          if (message.type === "SNAPSHOT") {
            message.data.forEach((data) => {
              updateMarketData(data);
            });

            setConnectionStatus("CONNECTED");
          }
        } catch (error) {
          console.error(
            "Invalid WebSocket message",
            error
          );
        }
      };

      socket.onclose = () => {
        setConnectionStatus("DISCONNECTED");

        if (shouldReconnect) {
          reconnectTimer = setTimeout(
            connect,
            2000
          );
        }
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

      socketRef.current?.close();
    };
  }, [
    setConnectionStatus,
    updateMarketData
  ]);

  return socketRef;
}