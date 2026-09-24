import { useMemo } from "react";

import { useMarketStore } from "../store/marketStore.js";

import {
  getTopGainers,
  getTopLosers,
  getTopMomentum
} from "../utils/topMovers.js";

function TopMovers() {
  const instruments = useMarketStore(
    (state) => state.instruments
  );

  const topGainers = useMemo(
    () => getTopGainers(instruments),
    [instruments]
  );

  const topLosers = useMemo(
    () => getTopLosers(instruments),
    [instruments]
  );

  const topMomentum = useMemo(
    () => getTopMomentum(instruments),
    [instruments]
  );

  return (
    <section className="top-movers">
      <div className="section-header">
        <h2>Top Movers</h2>
        <span>
          Live from streaming data
        </span>
      </div>

      <div className="movers-grid">
        <MoverCard
          title="Top 3 Gainers"
          items={topGainers}
          type="gainer"
        />

        <MoverCard
          title="Top 3 Losers"
          items={topLosers}
          type="loser"
        />

        <MoverCard
          title="Top 3 Momentum"
          items={topMomentum}
          type="momentum"
        />
      </div>
    </section>
  );
}

function MoverCard({
  title,
  items,
  type
}) {
  return (
    <div className="mover-card">
      <div className="mover-card-header">
        <h3>{title}</h3>
      </div>

      <div className="mover-list">
        {items.length === 0 ? (
          <div className="empty-movers">
            Waiting for data...
          </div>
        ) : (
          items.map((item, index) => {
            const {
              tick,
              metrics
            } = item;

            const value =
              type === "momentum"
                ? metrics.rolling10TickReturn
                : metrics.changePercent;

            return (
              <div
                className="mover-item"
                key={tick.symbol}
              >
                <div className="mover-rank">
                  #{index + 1}
                </div>

                <div className="mover-symbol">
                  <strong>
                    {tick.symbol}
                  </strong>

                  <span>
                    ₹{metrics.ltp.toFixed(2)}
                  </span>
                </div>

                <div
                  className={`mover-value ${
                    value >= 0
                      ? "positive"
                      : "negative"
                  }`}
                >
                  {value >= 0
                    ? "+"
                    : ""}
                  {value.toFixed(4)}%
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default TopMovers;