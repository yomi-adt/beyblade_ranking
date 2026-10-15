import { endpoints } from "./BaseService";
import { fetchJsonWithFallback } from "./FetchWithFallback";
import playersFallback from "../data/players-fallback.json";

export const Bladers = {
  /**
   * @param {('ADULT'|'KID')} [ageGroup] - omit for everyone, unfiltered.
   *
   * The filter is applied client-side AFTER fetching, regardless of source.
   * On live data that's a harmless no-op (the backend already filtered via
   * the query param). On the static fallback snapshot — which contains
   * everyone — it's what actually makes the league split work when the
   * backend is cold-starting. Relies on the snapshot including each
   * player's ageGroup, which it will once regenerated via "Push to GitHub"
   * (the backend serializes whatever fields Player has).
   */
  async getBladers(ageGroup) {
    const url = ageGroup ? `${endpoints.players}?ageGroup=${ageGroup}` : endpoints.players;
    const players = await fetchJsonWithFallback(url, playersFallback, { label: "players" });
    return ageGroup ? players.filter((p) => p.ageGroup === ageGroup) : players;
  },

  /** Best-effort: returns null on failure rather than throwing, since this is supplementary info. */
  async getLastUpdated() {
    try {
      const response = await fetch(endpoints.playersLastUpdated);
      if (!response.ok) return null;
      const data = await response.json();
      return data.lastUpdated || null;
    } catch (error) {
      console.warn('Could not fetch players last-updated timestamp:', error);
      return null;
    }
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