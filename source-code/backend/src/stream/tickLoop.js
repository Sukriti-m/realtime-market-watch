export function createTickLoop({
  generator,
  ingestionService,
  tickIntervalMs = 50,
  publishBatch
}) {
  let intervalId = null;

  function start() {
    if (intervalId) {
      return;
    }

    intervalId = setInterval(() => {
      const symbols = generator.getSymbols();
      const updates = [];

      for (const symbol of symbols) {
        const tick = generator.nextTick(symbol);
        const result = ingestionService.ingest(tick);

        if (result.accepted) {
          updates.push({
            tick: result.tick,
            metrics: result.metrics
          });
        } else if (result.reason) {
          console.warn(
            `Dropped tick for ${symbol}: ${result.reason}`
          );
        }
      }

      publishBatch(updates);
    }, tickIntervalMs);

    console.log(
      `Tick loop started: ${tickIntervalMs}ms interval`
    );
  }

  function stop() {
    if (!intervalId) {
      return;
    }

    clearInterval(intervalId);
    intervalId = null;

    console.log("Tick loop stopped");
  }

  return {
    start,
    stop
  };
}
