import {createRouter, createWebHashHistory} from 'vue-router'

// Import your views
import Home from '../views/Home.vue'
import Organizer from '../views/Organizer.vue'
import Organizer3 from '../views/Organizer3.vue'
import Players from '../views/Players.vue'
import Clans from '../views/Clans.vue'

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
      path: '/organizer', // Todo: Set path to some random UUID string so that it's harder to access
      name: 'Organizer',
      component: Organizer,
    },
    {
      path: '/organizer3', // Todo: Set path to some random UUID string so that it's harder to access
      name: 'Organizer3',
      component: Organizer3,
    },
  ]
})

export default router