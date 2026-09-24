export function createTickLoop({
  generator,
  ingestionService,
  tickIntervalMs = 100,
  broadcast
}) {
  let intervalId = null;

  function start() {
    if (intervalId) {
      return;
    }

    intervalId = setInterval(() => {
      const symbols =
        generator.getSymbols();

      for (const symbol of symbols) {
        const tick =
          generator.nextTick(symbol);

        const result =
          ingestionService.ingest(tick);

        if (result.accepted) {
          broadcast({
            type: "MARKET_UPDATE",
            timestamp: Date.now(),
            data: {
              tick: result.tick,
              metrics: result.metrics
            }
          });
        }
      }
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

    console.log(
      "Tick loop stopped"
    );
  }

  return {
    start,
    stop
  };
}