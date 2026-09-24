import {
  calculateChange,
  calculateChangePercent,
  calculateRollingAverage,
  calculateRollingReturn,
  calculateMomentum
} from "./marketMetrics.js";

export function createMetricsService() {
  const state = new Map();

  function processTick(tick) {
    const symbol = tick.symbol;
    const currentPrice = tick.payload.ltp;

    if (!state.has(symbol)) {
      state.set(symbol, {
        previousPrice: null,
        prices: []
      });
    }

    const metricsState = state.get(symbol);

    const previousPrice =
      metricsState.previousPrice;

    metricsState.prices.push(currentPrice);

    if (metricsState.prices.length > 10) {
      metricsState.prices.shift();
    }

    const change = calculateChange(
      currentPrice,
      previousPrice
    );

    const changePercent =
      calculateChangePercent(
        currentPrice,
        previousPrice
      );

    const rollingAverage =
      calculateRollingAverage(
        metricsState.prices
      );

    const rollingReturn =
      calculateRollingReturn(
        metricsState.prices
      );

    const momentum =
      calculateMomentum(changePercent);

    metricsState.previousPrice =
      currentPrice;

    return {
      symbol,
      ltp: currentPrice,
      change,
      changePercent,
      rolling10TickReturn: rollingReturn,
      rollingAveragePrice: rollingAverage,
      momentum
    };
  }

  function get(symbol) {
    return state.get(symbol);
  }

  function getAll() {
    return Array.from(state.values());
  }

  return {
    processTick,
    get,
    getAll
  };
}