import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { instruments } from "./config/instruments.js";
import { createMarketGenerator } from "./generator/marketGenerator.js";
import { createMarketState } from "./state/marketState.js";
import { createIngestionService } from "./ingestion/ingestionService.js";
import { createTickLoop } from "./stream/tickLoop.js";
import { createMetricsService } from "./metrics/metricsService.js";
import { createWebSocketServer } from "./stream/webSocketServer.js";
import { createStreamMiddleware } from "./middleware/streamMiddleware.js";
import {
  DEFAULT_TICK_RATE,
  MIN_TICK_RATE,
  MAX_TICK_RATE
} from "../../shared/thresholds.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.resolve(__dirname, "../../../.env")
});
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const PORT = Number(
  process.env.PORT || process.env.BACKEND_PORT || 4000
);
const SEED = Number(process.env.SEED || 12345);

function clampTickRate(value) {
  const rate = Number(value);

  if (!Number.isFinite(rate)) {
    return DEFAULT_TICK_RATE;
  }

  return Math.min(MAX_TICK_RATE, Math.max(MIN_TICK_RATE, rate));
}

const TICK_RATE = clampTickRate(
  process.env.TICK_RATE || DEFAULT_TICK_RATE
);
const tickIntervalMs = 1000 / TICK_RATE;

const generator = createMarketGenerator(
  instruments.map((instrument) => ({
    ...instrument,
    tickIntervalMs
  })),
  SEED
);
const marketState = createMarketState();

const knownSymbols = new Set(
  instruments.map((instrument) => instrument.symbol)
);

const seedPrices = new Map(
  instruments.map((instrument) => [
    instrument.symbol,
    instrument.seedPrice
  ])
);

const metricsService = createMetricsService(seedPrices);

const ingestionService = createIngestionService({
  marketState,
  knownSymbols,
  metricsService
});

const getEnrichedSnapshot = () => {
  return marketState.getAll().map((tick) => ({
    tick,
    metrics: metricsService.get(tick.symbol)
  }));
};

const webSocketServer = createWebSocketServer({
  server,
  getSnapshot: getEnrichedSnapshot,
  getSeq: () => streamMiddleware.getSeq()
});

const streamMiddleware = createStreamMiddleware({
  broadcast: webSocketServer.broadcast
});

const tickLoop = createTickLoop({
  generator,
  ingestionService,
  tickIntervalMs,
  publishBatch: streamMiddleware.publishBatch
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Market watch backend is running",
    tickRate: TICK_RATE,
    seq: streamMiddleware.getSeq()
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
    seq: streamMiddleware.getSeq(),
    data: getEnrichedSnapshot()
  });
});

server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`WebSocket running on ws://localhost:${PORT}/stream`);
  console.log(`Tick rate: ${TICK_RATE}/s (batch interval ${tickIntervalMs}ms)`);

  streamMiddleware.start();
  tickLoop.start();
});
