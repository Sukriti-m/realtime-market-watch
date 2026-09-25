# Real-Time Market Watch

**Real-Time Market Watch + Momentum Scanner**. Simulated ticks stream from a seeded generator through a Node backend and middleware, then a React UI.

```bash
npm install && npm run dev
```

- UI: http://localhost:5173
- API / WebSocket: http://localhost:4000 (`/health`, `/instruments`, `/snapshot`, `ws://localhost:4000/stream`)

Copy `.env.example` to `.env` to change tick rate (20–100), seed, ports, and stale threshold.

## Architecture

```
Market Simulator (seeded GBM ticks)
        │
        ▼
Backend ingestion + validation
        │
        ▼
Middleware (per-interval batch, seq, heartbeat, snapshot)
        │  WebSocket /stream
        ▼
React + Zustand (per-instrument state, derived movers, LIVE/STALE)
```

| Layer | Location | Role |
|---|---|---|
| Generator | `source-code/backend/src/generator` | Deterministic `mulberry32` + Box-Muller GBM, bid/ask, lot-rounded quantities |
| Backend | `ingestion`, `state`, `metrics` | Validate ticks, keep latest `InstrumentState`, compute session change, rolling 10-tick return/average, momentum |
| Middleware | `source-code/backend/src/middleware` | One `MARKET_BATCH` per generator cycle, monotonically increasing `seq`, `HEARTBEAT`, snapshot on connect |
| Transport | `stream/webSocketServer.js` | `WS /stream`; REST for health, instrument list, and catch-up snapshot |
| Frontend | `source-code/frontend` | Partitioned Zustand store, memoized rows, rAF coalescing, reconnect with backoff |

Event shapes:

```json
{ "type": "MARKET_TICK", "symbol": "NIFTY", "timestamp": 1710000000000,
  "payload": { "ltp": 25180.5, "bid": 25180.2, "ask": 25180.8, "bidQuantity": 50, "askQuantity": 50, "tradedQuantity": 100 } }

{ "type": "MARKET_BATCH", "seq": 42, "timestamp": 1710000000100,
  "data": [{ "tick": { "...": "MARKET_TICK" }, "metrics": { "change": 1.2, "changePercent": 0.0048, "rolling10TickReturn": 0.01, "rollingAveragePrice": 25181.1, "momentum": "NEUTRAL" } }] }
```

Rejected ticks (unknown symbol, malformed payload, duplicate timestamp, out-of-order timestamp) are dropped in ingestion and never broadcast.

## State management

**Backend.** `marketState` is a `Map<symbol, lastTick>`. `metricsService` keeps a 10-tick price window and **session open = seed price**. Change / Change % are versus that open, not the previous tick, so Top Movers and color bands are meaningful under high-frequency updates.

**Wire.** Middleware assigns `seq` and fans out JSON to all open sockets. New clients get `SNAPSHOT` with the current seq.

**Frontend `InstrumentState`.** Zustand holds `{ tick, metrics, receivedAt }` per symbol, plus `instrumentList`, `topMovers`, `connectionStatus`, and `lastSeq`. Each row polls `receivedAt` locally so a stale flag does not re-render the whole table.

**Derived state.** Top 3 gainers/losers sort on session `changePercent`. Top 3 momentum sort on absolute `rolling10TickReturn`. Momentum labels and Change % colors use shared thresholds in `source-code/shared/thresholds.js`.

**Connection lifecycle.** `RECONNECTING` → `CONNECTED` (open or first good message) → `DISCONNECTED` on close → exponential backoff reconnect. `STALE_DATA` if no batch/heartbeat arrives within `VITE_STALE_THRESHOLD_MS`. Each row shows **LIVE** vs **STALE** from its own `receivedAt`.

## Performance strategy

- **Batching:** the tick loop emits one WebSocket frame per cycle for all instruments, not one frame per symbol.
- **Coalescing:** the client merges pending batches with `requestAnimationFrame` so React commits at display refresh, not at packet arrival.
- **Selective renders:** `MarketRow` subscribes only to `instruments[symbol]`. `TopMovers` subscribes to precomputed mover lists, not the full map.
- **Memoization:** rows are `memo`’d; unchanged symbols keep the same object reference.
- **Rates:** `TICK_RATE` is generator cycles/sec, clamped to **20–100**. Default `20` × 12 instruments ≈ 240 ticks/s into one batch of 12.

## Scalability (10,000 instruments, 50,000 ticks/s)

This process would not hold that load as-is. The next design would:

1. Shard instruments across generator workers (by symbol hash).
2. Replace in-memory `Map` + full-table broadcast with a log (Redis Streams / Kafka) and **delta** topics.
3. Push only dirty symbols, or let the UI subscribe to a watchlist.
4. Snapshot store (Redis HASH) for reconnect catch-up instead of scanning Node memory.
5. Coalesce at the edge (gateway) to 10–20 UI frames/s regardless of tick rate.
6. Virtualize the table; never bind 10k live rows into the React tree.

## Distributed architecture

Five stateless HTTP nodes cannot each run their own seeded loop: clients would see five diverging books.

Required for consistency:

- **Single writer** for each symbol (partitioned generator). Seed + partition key makes ticks reproducible per shard.
- **Shared seq** per partition (Redis `INCR` or Kafka offset) so gaps mean “resync this shard,” not “global chaos.”
- **Sticky or partitioned WebSockets** (or a fan-in gateway) so a client is not interleaved with two writers for the same symbol.
- **Shared snapshot** (Redis) so any instance can answer `GET /snapshot` and WS hello.
- **Idempotent ingest** already keyed by `(symbol, timestamp)`; keep that as the drop rule across nodes.

## Failure handling

| Failure | Behavior |
|---|---|
| Malformed WS JSON | Logged, ignored |
| Unknown / invalid tick | Ingestion reject, not broadcast |
| Duplicate / older timestamp | Dropped as duplicate / out-of-order |
| Seq gap | Client `GET /snapshot` resync |
| UI process stall | Rows flip to STALE; header `STALE_DATA` if heartbeats stop |
| Backend crash / WS close | `DISCONNECTED`, reconnect with 1s → 8s backoff, snapshot on hello |
| Middleware restart | Seq may reset; snapshot replaces local state |

## Configuration

| Variable | Default | Meaning |
|---|---|---|
| `TICK_RATE` | 20 | Generator cycles/sec (20–100) |
| `SEED` | 12345 | Simulation seed |
| `PORT` / `BACKEND_PORT` | 4000 | API + WS port |
| `VITE_API_URL` | http://localhost:4000 | Frontend REST base |
| `VITE_WS_URL` | ws://localhost:4000/stream | Frontend stream |
| `VITE_STALE_THRESHOLD_MS` | 2000 | LIVE vs STALE |

Momentum bands (Change %): `> 1` strong positive, `0.25–1` positive, `-0.25–0.25` neutral, `-1–-0.25` negative, `< -1` strong negative.

## Layout

```
/README.md
/.env.example
/source-code
  /shared          thresholds used by backend + UI
  /backend         generator, ingestion, metrics, middleware, WS
  /frontend        React dashboard
```
