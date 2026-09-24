import {
  calculateChange,
  calculateChangePercent,
  calculateRollingAverage,
  calculateRollingReturn,
  calculateMomentum
} from "./marketMetrics.js";
import { createMetricsState } from "./metricsState.js";

export function createMetricsService(seedPrices = new Map()) {
  const history = createMetricsState();
  const lastMetrics = new Map();

  function processTick(tick) {
    const symbol = tick.symbol;
    const currentPrice = tick.payload.ltp;
    const sessionOpen =
      seedPrices.get(symbol) ?? currentPrice;

    const metricsState = history.update(
      symbol,
      currentPrice,
      sessionOpen
    );

    const change = calculateChange(
      currentPrice,
      metricsState.sessionOpen
    );

    const changePercent = calculateChangePercent(
      currentPrice,
      metricsState.sessionOpen
    );

    const rollingAverage = calculateRollingAverage(
      metricsState.prices
    );

    const rollingReturn = calculateRollingReturn(
      metricsState.prices
    );

    const momentum = calculateMomentum(changePercent);

    const metrics = {
      symbol,
      ltp: currentPrice,
      sessionOpen: metricsState.sessionOpen,
      change,
      changePercent,
      rolling10TickReturn: rollingReturn,
      rollingAveragePrice: rollingAverage,
      momentum
    };

    lastMetrics.set(symbol, metrics);

    return metrics;
  }

  function get(symbol) {
    return lastMetrics.get(symbol);
  }

  function getAll() {
    return Array.from(lastMetrics.values());
  }

  return {
    processTick,
    get,
    getAll
  };
}
