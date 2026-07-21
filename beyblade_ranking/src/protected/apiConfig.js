// In dev, this is '' so calls stay relative ('/api/...') and get caught by
// the Vite dev server proxy (see vite.config.js). In production there's no
// proxy — GitHub Pages is a static host — so VITE_API_BASE_URL must point
// directly at the deployed Render backend, set via .env.production:
//   VITE_API_BASE_URL=https://<your-render-service>.onrender.com
export const API_ROOT = import.meta.env.VITE_API_BASE_URL || ''

export const CHALLONGE_API_BASE = `${API_ROOT}/api/challonge`
export const PLAYER_RANKINGS_API_BASE = `${API_ROOT}/api/rankings/players`
export const CLAN_RANKINGS_API_BASE = `${API_ROOT}/api/rankings/clans`
export const PLAYERS_API_BASE = `${API_ROOT}/api/players`
export const CLANS_API_BASE = `${API_ROOT}/api/clans`
export const POINT_RULES_API_BASE = `${API_ROOT}/api/point-rules`