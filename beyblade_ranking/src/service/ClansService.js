import { endpoints } from "./BaseService";
import { fetchJsonWithFallback } from "./fetchWithFallback";
import clansFallback from "../data/clans-fallback.json";

export const Bladers = {
  async getBladers() {
    return fetchJsonWithFallback(endpoints.clans, clansFallback, { label: "clans" });
  },

  /** Best-effort: returns null on failure rather than throwing, since this is supplementary info. */
  async getLastUpdated() {
    try {
      const response = await fetch(endpoints.clansLastUpdated);
      if (!response.ok) return null;
      const data = await response.json();
      return data.lastUpdated || null;
    } catch (error) {
      console.warn('Could not fetch clans last-updated timestamp:', error);
      return null;
    }
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