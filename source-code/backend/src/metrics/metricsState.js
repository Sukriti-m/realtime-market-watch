function createInstrumentMetrics() {
  return {
    previousPrice: null,
    prices: [],
    maxHistory: 10
  };
}

export function createMetricsState() {
  const state = new Map();

  function getOrCreate(symbol) {
    if (!state.has(symbol)) {
      state.set(
        symbol,
        createInstrumentMetrics()
      );
    }

    return state.get(symbol);
  }

  function update(symbol, price) {
    const metrics = getOrCreate(symbol);

    metrics.previousPrice =
      metrics.prices.length > 0
        ? metrics.prices[metrics.prices.length - 1]
        : null;

    metrics.prices.push(price);

    if (
      metrics.prices.length >
      metrics.maxHistory
    ) {
      metrics.prices.shift();
    }

    return metrics;
  }

  return {
    getOrCreate,
    update
  };
}