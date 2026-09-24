export function validateTick(tick, knownSymbols) {
  if (!tick || typeof tick !== "object") {
    return {
      valid: false,
      reason: "Tick must be an object"
    };
  }

  if (tick.type !== "MARKET_TICK") {
    return {
      valid: false,
      reason: "Invalid tick type"
    };
  }

  if (!tick.symbol || typeof tick.symbol !== "string") {
    return {
      valid: false,
      reason: "Invalid symbol"
    };
  }

  if (!knownSymbols.has(tick.symbol)) {
    return {
      valid: false,
      reason: `Unknown symbol: ${tick.symbol}`
    };
  }

  if (
    typeof tick.timestamp !== "number" ||
    !Number.isFinite(tick.timestamp)
  ) {
    return {
      valid: false,
      reason: "Invalid timestamp"
    };
  }

  if (!tick.payload || typeof tick.payload !== "object") {
    return {
      valid: false,
      reason: "Invalid payload"
    };
  }

  const {
    ltp,
    bid,
    ask,
    bidQuantity,
    askQuantity,
    tradedQuantity
  } = tick.payload;

  const numericFields = [
    ltp,
    bid,
    ask,
    bidQuantity,
    askQuantity,
    tradedQuantity
  ];

  if (
    numericFields.some(
      (value) =>
        typeof value !== "number" ||
        !Number.isFinite(value)
    )
  ) {
    return {
      valid: false,
      reason: "Invalid numeric value"
    };
  }

  if (bid > ask) {
    return {
      valid: false,
      reason: "Bid cannot be greater than ask"
    };
  }

  return {
    valid: true
  };
}