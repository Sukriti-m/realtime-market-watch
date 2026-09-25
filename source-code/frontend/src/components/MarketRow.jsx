import { memo, useEffect, useState } from "react";
import { useMarketStore } from "../store/marketStore.js";
import { getMomentumClass } from "../utils/momentum.js";
import { STALE_THRESHOLD_MS } from "../config/env.js";

function formatSigned(value, digits) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;
}

function formatPrice(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  return value.toFixed(2);
}

function MarketRow({ symbol }) {
  const marketData = useMarketStore(
    (state) => state.instruments[symbol]
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 500);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  if (!marketData) {
    return (
      <tr>
        <td className="instrument-cell">
          {symbol}
        </td>
        <td colSpan="7" className="waiting-cell">
          Waiting for data...
        </td>
      </tr>
    );
  }

  const { tick, metrics, receivedAt } = marketData;
  const payload = tick?.payload ?? {};
  const changePercent = metrics?.changePercent ?? 0;
  const isStale =
    !receivedAt || now - receivedAt > STALE_THRESHOLD_MS;
  const freshness = isStale ? "STALE" : "LIVE";
  const momentumClass = getMomentumClass(changePercent);
  const changeClass = getMomentumClass(changePercent);

  return (
    <tr className={isStale ? "row-stale" : "row-live"}>
      <td className="instrument-cell">
        <div className="instrument-label">
          <span>{symbol}</span>
          <span className={`freshness-badge freshness-${freshness.toLowerCase()}`}>
            {freshness}
          </span>
        </div>
      </td>

      <td
        className="price-cell"
        title={
          metrics
            ? `Session open ${formatPrice(metrics.sessionOpen)} | 10-tick avg ${formatPrice(metrics.rollingAveragePrice)} | 10-tick return ${formatSigned(metrics.rolling10TickReturn, 4)}%`
            : undefined
        }
      >
        {formatPrice(payload.ltp)}
      </td>

      <td className={changeClass}>
        {formatSigned(metrics?.change, 2)}
      </td>

      <td className={changeClass}>
        {metrics && typeof metrics.changePercent === "number"
          ? `${formatSigned(metrics.changePercent, 4)}%`
          : "-"}
      </td>

      <td>{formatPrice(payload.bid)}</td>
      <td>{formatPrice(payload.ask)}</td>
      <td>
        {typeof payload.tradedQuantity === "number"
          ? payload.tradedQuantity.toLocaleString()
          : "-"}
      </td>
      <td>
        <span className={`momentum-badge ${momentumClass}`}>
          {metrics?.momentum ?? "-"}
        </span>
      </td>
    </tr>
  );
}

export default memo(MarketRow);
