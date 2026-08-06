import { endpoints } from "./BaseService";
import { fetchJsonWithFallback } from "./FetchWithFallback";
import playersFallback from "../data/players-fallback.json";

export const Bladers = {
  async getBladers() {
    return fetchJsonWithFallback(endpoints.players, playersFallback, { label: "players" });
  },

  async getAudits(playerUsername) {
    try {
      const response = await fetch(endpoints.playerAudits(playerUsername));

      if (!response.ok) {
        throw new Error(`Failed to fetch blader audits: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching blader audits:', error);
      throw error;
    }
  }
};