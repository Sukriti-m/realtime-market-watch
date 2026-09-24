import express from "express";
import cors from "cors";
import { instruments } from "./config/instruments.js";
import { createMarketGenerator } from "./generator/marketGenerator.js";
import { createMarketState } from "./state/marketState.js";
import { createIngestionService } from "./ingestion/ingestionService.js";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const SEED = Number(process.env.SEED || 12345);

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

const ingestionService =
  createIngestionService({
    marketState,
    knownSymbols
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

app.listen(PORT, () => {
  console.log(
    `Backend running on http://localhost:${PORT}`
  );
});