import { endpoints } from "./BaseService";
import { fetchJsonWithFallback } from "./FetchWithFallback";
import clansFallback from "../data/clans-fallback.json";

export const Bladers = {
  async getBladers() {
    return fetchJsonWithFallback(endpoints.clans, clansFallback, { label: "clans" });
  },

  async getAudits(tag) {
    try {
      const response = await fetch(endpoints.clanAudits(tag));

      if (!response.ok) {
        throw new Error(`Failed to fetch clan audits: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching clan audits:', error);
      throw error;
    }
  }
}