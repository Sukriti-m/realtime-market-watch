import { create } from "zustand";

export const useMarketStore = create((set) => ({
  instruments: {},
  instrumentList: [],
  connectionStatus: "DISCONNECTED",
  lastMessageAt: null,

  setInstrumentList: (instruments) => {
    set({
      instrumentList: instruments
    });
  },

  updateMarketData: (data) => {
    const symbol = data.tick.symbol;

    set((state) => ({
      instruments: {
        ...state.instruments,
        [symbol]: data
      },
      lastMessageAt: Date.now()
    }));
  },

  setConnectionStatus: (status) => {
    set({
      connectionStatus: status
    });
  }
}));