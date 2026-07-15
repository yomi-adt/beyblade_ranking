import { endpoints } from "./BaseService";

export const Bladers = {
  async getBladers() {
    try {
      const response = await fetch(endpoints.clans);

      if (!response.ok) {
        throw new Error(`Failed to fetch bladers: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching bladers:', error);
      throw error;
    }
  }
}