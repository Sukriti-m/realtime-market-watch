export function createMarketState() {
  const state = new Map();

  function update(tick) {
    state.set(tick.symbol, tick);
  }

  function get(symbol) {
    return state.get(symbol);
  }

  function getAll() {
    return Array.from(state.values());
  }

  function has(symbol) {
    return state.has(symbol);
  }

  function size() {
    return state.size;
  }

  return {
    update,
    get,
    getAll,
    has,
    size
  };
}