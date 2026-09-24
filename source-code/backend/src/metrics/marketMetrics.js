import { MOMENTUM_THRESHOLDS } from "../../../shared/thresholds.js";

function round(value, decimals = 2) {
  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
}

function calculateChange(currentPrice, baselinePrice) {
  if (baselinePrice === null || baselinePrice === undefined) {
    return 0;
  }

  return round(currentPrice - baselinePrice);
}

function calculateChangePercent(currentPrice, baselinePrice) {
  if (
    baselinePrice === null ||
    baselinePrice === undefined ||
    baselinePrice === 0
  ) {
    return 0;
  }

  return round(
    ((currentPrice - baselinePrice) / baselinePrice) * 100,
    4
  );
}

function calculateRollingAverage(prices) {
  if (prices.length === 0) {
    return 0;
  }

  const total = prices.reduce(
    (sum, price) => sum + price,
    0
  );

  return round(total / prices.length);
}

function calculateRollingReturn(prices) {
  if (prices.length < 2) {
    return 0;
  }

  const oldestPrice = prices[0];
  const latestPrice = prices[prices.length - 1];

  if (oldestPrice === 0) {
    return 0;
  }

  return round(
    ((latestPrice - oldestPrice) / oldestPrice) * 100,
    4
  );
}

function calculateMomentum(changePercent) {
  if (changePercent > MOMENTUM_THRESHOLDS.STRONG_POSITIVE) {
    return "STRONG_POSITIVE";
  }

  if (changePercent >= MOMENTUM_THRESHOLDS.POSITIVE) {
    return "POSITIVE";
  }

  if (changePercent >= MOMENTUM_THRESHOLDS.NEGATIVE) {
    return "NEUTRAL";
  }

  if (changePercent >= MOMENTUM_THRESHOLDS.STRONG_NEGATIVE) {
    return "NEGATIVE";
  }

  return "STRONG_NEGATIVE";
}

export {
  calculateChange,
  calculateChangePercent,
  calculateRollingAverage,
  calculateRollingReturn,
  calculateMomentum
};
