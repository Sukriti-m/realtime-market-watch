import { useMarketStore } from "../store/marketStore.js";
import MarketRow from "./MarketRow.jsx";

function MarketTable() {
  const symbols = useMarketStore(
    (state) => state.instrumentList
  );

  if (symbols.length === 0) {
    return (
      <div className="empty-state">
        Loading instruments...
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="market-table">
        <thead>
          <tr>
            <th>Instrument</th>
            <th>LTP</th>
            <th>Change</th>
            <th>Change %</th>
            <th>Bid</th>
            <th>Ask</th>
            <th>Volume</th>
            <th>Momentum</th>
          </tr>
        </thead>

        <tbody>
          {symbols.map((symbol) => (
            <MarketRow
              key={symbol}
              symbol={symbol}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MarketTable;