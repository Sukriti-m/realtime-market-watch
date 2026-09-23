import { standardNormal } from "./normalDistribution.js";

export function simulateNextPrice(currentPrice, config, random) {
  const dt = config.tickIntervalMs / 1000;

  const z = standardNormal(random);

  const drift = 0;

  const diffusion =
    config.volatility * Math.sqrt(dt) * z;

  let nextPrice =
    currentPrice * Math.exp(drift + diffusion);

  const maxMove =
    currentPrice * config.maxStdDev;

  const minPrice =
    currentPrice - maxMove;

  const maxPrice =
    currentPrice + maxMove;

  nextPrice = Math.max(
    minPrice,
    Math.min(maxPrice, nextPrice)
  );

  nextPrice =
    Math.round(nextPrice * 100) / 100;

  return nextPrice;
}