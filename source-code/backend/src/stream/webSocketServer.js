import { WebSocketServer } from "ws";

export function createWebSocketServer({
  server,
  getSnapshot,
  getSeq
}) {
  const wss = new WebSocketServer({
    server,
    path: "/stream"
  });

  function broadcast(data) {
    const message = JSON.stringify(data);

    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    });
  }

  wss.on("connection", (socket) => {
    console.log("WebSocket client connected");

    socket.send(
      JSON.stringify({
        type: "SNAPSHOT",
        seq: getSeq(),
        timestamp: Date.now(),
        data: getSnapshot()
      })
    );

    socket.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });

  return {
    broadcast,
    wss
  };
}
