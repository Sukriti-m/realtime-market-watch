import { useMarketWebSocket } from "./hooks/useMarketWebSocket.js";
import { useStaleDataMonitor } from "./hooks/useStaleDataMonitor.js";
import { useInstruments } from "./hooks/useInstruments.js";
import { useMarketStore } from "./store/marketStore.js";
import MarketTable from "./components/MarketTable.jsx";
import TopMovers from "./components/TopMovers.jsx";

function App() {
  useMarketWebSocket();
  useStaleDataMonitor();
  useInstruments();

  const connectionStatus = useMarketStore(
    (state) => state.connectionStatus
  );

  const connectionClass = connectionStatus
    .toLowerCase()
    .replaceAll("_", "-");

  return (
    <div className="app">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Real-Time Market Watch</h1>
          <p className="dashboard-subtitle">
            Live market data and momentum scanner
          </p>
        </div>

        <div
          className={`connection-status connection-${connectionClass}`}
        >
          <span className="connection-dot" />
          {connectionStatus.replaceAll("_", " ")}
        </div>
      </header>

      <TopMovers />
      <MarketTable />
    </div>
  );
}

export default App;
