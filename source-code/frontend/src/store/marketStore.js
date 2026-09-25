import { create } from "zustand";
import {
  getTopGainers,
  getTopLosers,
  getTopMomentum
} from "../utils/topMovers.js";

function toInstrumentMap(updates, receivedAt, base = {}) {
  const instruments = { ...base };

  for (const data of updates) {
    const symbol = data?.tick?.symbol;

    if (!symbol) {
      continue;
    }

    instruments[symbol] = {
      ...data,
      receivedAt
    };
  }

  return instruments;
}

function deriveTopMovers(instruments) {
  return {
    gainers: getTopGainers(instruments),
    losers: getTopLosers(instruments),
    momentum: getTopMomentum(instruments)
  };
}

export const useMarketStore = create((set) => ({
  instruments: {},
  instrumentList: [],
  topMovers: {
    gainers: [],
    losers: [],
    momentum: []
  },
  connectionStatus: "DISCONNECTED",
  lastMessageAt: null,
  lastSeq: 0,

  setInstrumentList: (instruments) => {
    set({
      instrumentList: instruments
    });
  },

  applyUpdates: (updates, seq) => {
    const receivedAt = Date.now();

    set((state) => {
      const instruments = toInstrumentMap(
        updates,
        receivedAt,
        state.instruments
      );

      return {
        instruments,
        lastMessageAt: receivedAt,
        lastSeq:
          typeof seq === "number" ? seq : state.lastSeq,
        topMovers: deriveTopMovers(instruments)
      };
    });
  },

  applySnapshot: (updates, seq) => {
    const receivedAt = Date.now();
    const instruments = toInstrumentMap(updates, receivedAt);

    set({
      instruments,
      lastMessageAt: receivedAt,
      lastSeq: typeof seq === "number" ? seq : 0,
      topMovers: deriveTopMovers(instruments)
    });
  },

  touchLastMessage: () => {
    set({
      lastMessageAt: Date.now()
    });
  },

  setConnectionStatus: (status) => {
    set({
      connectionStatus: status
    });
  }
}));
