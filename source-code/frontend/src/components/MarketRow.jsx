import { memo } from "react";
import { useMarketStore } from "../store/marketStore.js";
import { getMomentumClass } from "../utils/momentum.js";

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

  if (!marketData) {
    return (
      <tr>
        <td className="instrument-cell">
          {symbol}
        </td>

        <td
          colSpan="7"
          className="waiting-cell"
        >
          Waiting for data...
        </td>
      </tr>
    );
  }

  const { tick, metrics } = marketData;
  const payload = tick?.payload ?? {};

  const changePercent =
    metrics?.changePercent ?? 0;

  const momentumClass =
    getMomentumClass(changePercent);

  const changeClass =
    changePercent > 0
      ? "positive"
      : changePercent < 0
      ? "negative"
      : "neutral";

  return (
    <tr>
      <td className="instrument-cell">
        {symbol}
      </td>

      <td className="price-cell">
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

      <td>
        {formatPrice(payload.bid)}
      </td>

      <td>
        {formatPrice(payload.ask)}
      </td>

      <td>
        {typeof payload.tradedQuantity === "number"
          ? payload.tradedQuantity.toLocaleString()
          : "-"}
      </td>

      <td>
        <span
          className={`momentum-badge ${momentumClass}`}
        >
          {metrics?.momentum ?? "-"}
        </span>
      </td>
    </tr>
  );
}

export default memo(MarketRow);