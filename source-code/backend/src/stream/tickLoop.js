export function createTickLoop({
  generator,
  ingestionService,
  tickIntervalMs = 100
}) {
  let intervalId = null;

  function start() {
    if (intervalId) {
      return;
    }

    intervalId = setInterval(() => {
      const symbols = generator.getSymbols();

      for (const symbol of symbols) {
        const tick = generator.nextTick(symbol);

        ingestionService.ingest(tick);
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

    console.log("Tick loop stopped");
  }

  return {
    start,
    stop
  };
}