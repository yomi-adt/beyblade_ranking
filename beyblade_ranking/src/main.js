import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'
import 'primeflex/primeflex.css';

import 'primeicons/primeicons.css'
import AnimateOnScroll from 'primevue/animateonscroll';

import router from './router'

import ToastService from 'primevue/toastservice';

const app = createApp(App)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.directive('animateonscroll', AnimateOnScroll)
app.use(router)
app.use(ToastService);
app.mount('#app')
