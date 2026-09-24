function round(value, decimals = 2) {
  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
}

function calculateChange(currentPrice, previousPrice) {
  if (previousPrice === null) {
    return 0;
  }

  return round(currentPrice - previousPrice);
}

function calculateChangePercent(currentPrice, previousPrice) {
  if (
    previousPrice === null ||
    previousPrice === 0
  ) {
    return 0;
  }

  return round(
    ((currentPrice - previousPrice) / previousPrice) * 100,
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
  if (changePercent > 1) {
    return "STRONG_POSITIVE";
  }

  if (changePercent >= 0.25) {
    return "POSITIVE";
  }

  if (changePercent >= -0.25) {
    return "NEUTRAL";
  }

  if (changePercent >= -1) {
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