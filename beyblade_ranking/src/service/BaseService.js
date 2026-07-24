export const BASE_URL = "https://wpgbbx-backend.onrender.com";
export const API_URL = `${BASE_URL}/api`;

export const endpoints = {
  players: `${API_URL}/players`,
  clans: `${API_URL}/clans`,
  playerAudits: (username) => `${API_URL}/rankings/players/${username}/entries`,
  clanAudits: (tag) => `${API_URL}/rankings/clans/${tag}/entries`
};
