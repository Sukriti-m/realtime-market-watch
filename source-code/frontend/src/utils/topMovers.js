export function getTopGainers(instruments, limit = 3) {
  return Object.values(instruments)
    .filter((item) => item?.metrics)
    .sort(
      (a, b) =>
        b.metrics.changePercent -
        a.metrics.changePercent
    )
    .slice(0, limit);
}

export function getTopLosers(instruments, limit = 3) {
  return Object.values(instruments)
    .filter((item) => item?.metrics)
    .sort(
      (a, b) =>
        a.metrics.changePercent -
        b.metrics.changePercent
    )
    .slice(0, limit);
}

export function getTopMomentum(
  instruments,
  limit = 3
) {
  return Object.values(instruments)
    .filter(
      (item) =>
        item?.metrics &&
        typeof item.metrics.rolling10TickReturn ===
          "number"
    )
    .sort(
      (a, b) =>
        Math.abs(
          b.metrics.rolling10TickReturn
        ) -
        Math.abs(
          a.metrics.rolling10TickReturn
        )
    )
    .slice(0, limit);
}