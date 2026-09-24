import { mulberry32 } from "./seededRandom.js";
import { simulateNextPrice } from "./priceSimulator.js";
import {
  MIN_SPREAD,
  SPREAD_BPS
} from "../../../shared/thresholds.js";

function roundToLot(quantity, lotSize) {
  return Math.round(quantity / lotSize) * lotSize;
}

function createInstrumentState(config, seed) {
  return {
    config,
    random: mulberry32(seed),
    currentPrice: config.seedPrice,
    tradedQuantity: 0
  };
}

function generateTick(state) {
  const {
    config,
    random
  } = state;

  const nextPrice = simulateNextPrice(
    state.currentPrice,
    config,
    random
  );

  state.currentPrice = nextPrice;

  const minSpread = config.minSpread ?? MIN_SPREAD;
  const spreadBps = config.spreadBps ?? SPREAD_BPS;
  const spread = Math.max(
    minSpread,
    (nextPrice * spreadBps) / 10000
  );

  const bid = nextPrice - spread / 2;
  const ask = nextPrice + spread / 2;

  const bidQuantity = roundToLot(
    config.baseQuantity * (0.5 + random()),
    config.lotSize
  );

  const askQuantity = roundToLot(
    config.baseQuantity * (0.5 + random()),
    config.lotSize
  );

  const tradedQuantity = roundToLot(
    config.baseQuantity * random(),
    config.lotSize
  );

  state.tradedQuantity += tradedQuantity;

  return {
    type: "MARKET_TICK",
    symbol: config.symbol,
    timestamp: Date.now(),
    payload: {
      ltp: nextPrice,
      bid: Number(bid.toFixed(2)),
      ask: Number(ask.toFixed(2)),
      bidQuantity,
      askQuantity,
      tradedQuantity: state.tradedQuantity
    }
  };
}

export function createMarketGenerator(instruments, seed = 12345) {
  const states = instruments.map((config, index) =>
    createInstrumentState(
      config,
      seed + index * 1000
    )
  );

  return {
    nextTick(symbol) {
      const state = states.find(
        (item) => item.config.symbol === symbol
      );

      if (!state) {
        throw new Error(
          `Unknown instrument: ${symbol}`
        );
      }

      return generateTick(state);
    },

    getSymbols() {
      return states.map(
        (state) => state.config.symbol
      );
    },

    getConfigs() {
      return states.map(
        (state) => state.config
      );
    }
  };
}