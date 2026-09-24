import { validateTick } from "./tickValidator.js";

export function createIngestionService({
  marketState,
  knownSymbols
}) {
  function ingest(tick) {
    const validation = validateTick(
      tick,
      knownSymbols
    );

    if (!validation.valid) {
      return {
        accepted: false,
        reason: validation.reason
      };
    }

    const existingTick =
      marketState.get(tick.symbol);

    if (
      existingTick &&
      tick.timestamp < existingTick.timestamp
    ) {
      return {
        accepted: false,
        reason: "Out-of-order tick"
      };
    }

    if (
      existingTick &&
      tick.timestamp === existingTick.timestamp
    ) {
      return {
        accepted: false,
        reason: "Duplicate tick"
      };
    }

    marketState.update(tick);

    return {
      accepted: true,
      tick
    };
  }

  return {
    ingest
  };
}