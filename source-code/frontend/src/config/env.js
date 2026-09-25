import { STALE_THRESHOLD_MS as DEFAULT_STALE_MS } from "../../../shared/thresholds.js";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

export const WS_URL =
  import.meta.env.VITE_WS_URL || "ws://localhost:4000/stream";

export const STALE_THRESHOLD_MS = Number(
  import.meta.env.VITE_STALE_THRESHOLD_MS || DEFAULT_STALE_MS
);
