import { MOMENTUM_THRESHOLDS } from "../config/marketThresholds.js";

export function getMomentumClass(changePercent) {
  if (
    changePercent >
    MOMENTUM_THRESHOLDS.STRONG_POSITIVE
  ) {
    return "strong-positive";
  }

  if (
    changePercent >=
    MOMENTUM_THRESHOLDS.POSITIVE
  ) {
    return "positive";
  }

  if (
    changePercent >=
    MOMENTUM_THRESHOLDS.NEGATIVE
  ) {
    return "neutral";
  }

  if (
    changePercent >=
    MOMENTUM_THRESHOLDS.STRONG_NEGATIVE
  ) {
    return "negative";
  }

  return "strong-negative";
}