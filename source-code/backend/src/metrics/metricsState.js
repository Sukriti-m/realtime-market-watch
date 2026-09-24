function createInstrumentMetrics(sessionOpen) {
  return {
    previousPrice: null,
    sessionOpen,
    prices: [],
    maxHistory: 10
  };
}

export function createMetricsState() {
  const state = new Map();

  function getOrCreate(symbol, sessionOpen) {
    if (!state.has(symbol)) {
      state.set(
        symbol,
        createInstrumentMetrics(sessionOpen)
      );
    }

    return state.get(symbol);
  }

  function update(symbol, price, sessionOpen) {
    const metrics = getOrCreate(symbol, sessionOpen);

    metrics.previousPrice =
      metrics.prices.length > 0
        ? metrics.prices[metrics.prices.length - 1]
        : null;

    metrics.prices.push(price);

    if (metrics.prices.length > metrics.maxHistory) {
      metrics.prices.shift();
    }

    return metrics;
  }

  return {
    getOrCreate,
    update
  };
}
