import {createRouter, createWebHashHistory} from 'vue-router'

// Import your views
import Home from '../views/Home.vue'
import Organizer from '../views/Organizer.vue'
import Players from '../views/Players.vue'
import Clans from '../views/Clans.vue'
import ResetScores from '../protected/ResetScores.vue'
import OrganizerDash from '../views/OrganizerDash.vue'
import PlayerRoster from '../protected/PlayerRoster.vue'
import ClanRoster from '../protected/ClanRoster.vue'
import PlayerAuditLog from '../protected/PlayerAuditLog.vue'
import ClanAuditLog from '../protected/ClanAuditLog.vue'

// Create and export router
const router = createRouter({
  history: createWebHashHistory(import.meta.env.MODE === 'production' ? '/beyblade_ranking/' : '/'),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    { path: '/players', component: Players 

    },
    { path: '/clans', component: Clans 

    },
    {
      path: '/update-player-scores',
      name: 'Update-Player-Scores',
      component: Organizer,
    },
    {
      path: '/reset-scores',
      name: 'Reset-Scores',
      component: ResetScores,
    },
    {
      path: '/organizer-dash',
      name: 'Organizer-Dash',
      component: OrganizerDash,
    },
    {
      path: '/manage-players',
      name: 'Manage-Players',
      component: PlayerRoster,
    },
    {
      path: '/manage-clans',
      name: 'Manage-Clans',
      component: ClanRoster,
    },
    {
      path: '/player-history',
      name: 'Player-History',
      component: PlayerAuditLog,
    },
    {
      path: '/clan-history',
      name: 'Clan-History',
      component: ClanAuditLog,
    },
  ]
})

export default router