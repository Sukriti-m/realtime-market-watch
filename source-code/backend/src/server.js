import express from "express";
import cors from "cors";
import http from "http";
import { instruments } from "./config/instruments.js";
import { createMarketGenerator } from "./generator/marketGenerator.js";
import { createMarketState } from "./state/marketState.js";
import { createIngestionService } from "./ingestion/ingestionService.js";
import { createTickLoop } from "./stream/tickLoop.js";
import { createMetricsService } from "./metrics/metricsService.js";
import { createWebSocketServer } from "./stream/webSocketServer.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const webSocketServer =
  createWebSocketServer({
    server,
    getSnapshot: () =>
      marketState.getAll()
  });
  
const PORT = process.env.PORT || 4000;
const SEED = Number(process.env.SEED || 12345);
const TICK_RATE = Number(
  process.env.TICK_RATE || 10
);

const tickIntervalMs = 1000 / TICK_RATE;

const generator = createMarketGenerator(
  instruments,
  SEED
);

const marketState = createMarketState();

const knownSymbols = new Set(
  instruments.map(
    (instrument) => instrument.symbol
  )
);

const metricsService = createMetricsService();

const ingestionService =
  createIngestionService({
    marketState,
    knownSymbols,
    metricsService
  });

const tickLoop =
  createTickLoop({
    generator,
    ingestionService,
    tickIntervalMs,
    broadcast:
      webSocketServer.broadcast
  });

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Market watch backend is running"
  });
});

app.get("/instruments", (req, res) => {
  res.json({
    instruments: generator.getConfigs()
  });
});

app.get("/snapshot", (req, res) => {
  res.json({
    timestamp: Date.now(),
    data: marketState.getAll()
  });
});

// app.listen(PORT, () => {
//   console.log(
//     `Backend running on http://localhost:${PORT}`
//   );

//   tickLoop.start();
// });

server.listen(PORT, () => {
  console.log(
    `Backend running on http://localhost:${PORT}`
  );

  console.log(
    `WebSocket running on ws://localhost:${PORT}/stream`
  );

  tickLoop.start();
});