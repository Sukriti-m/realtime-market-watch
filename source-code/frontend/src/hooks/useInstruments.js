import { useEffect } from "react";
import { useMarketStore } from "../store/marketStore.js";
import { API_URL } from "../config/env.js";

export function useInstruments() {
  const setInstrumentList = useMarketStore(
    (state) => state.setInstrumentList
  );

  useEffect(() => {
    async function fetchInstruments() {
      try {
        const response = await fetch(`${API_URL}/instruments`);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch instruments: ${response.status}`
          );
        }

        const result = await response.json();

        const symbols = result.instruments.map(
          (instrument) => instrument.symbol
        );

        setInstrumentList(symbols);
      } catch (error) {
        console.error("Failed to fetch instruments:", error);
      }
    }

    fetchInstruments();
  }, [setInstrumentList]);
}
