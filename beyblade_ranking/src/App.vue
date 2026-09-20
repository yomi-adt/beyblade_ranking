<script setup>
import { RouterView } from "vue-router";
import { Button, Menubar } from "primevue";
import { ref, watch } from 'vue'
import Toast from 'primevue/toast';
import {useToast} from 'primevue/usetoast'
import { toastQueue } from './ToastBus.js'; // Import the reactive queue array
import { ROUTE_TRANSITION_NAME } from './RouteTransition'
import './route-transitions.css'

const primevueToast = useToast();

watch(toastQueue, () => {
  // Loop through and clear out any backed up triggers
  while (toastQueue.value.length > 0) {
    const notification = toastQueue.value.shift();
    primevueToast.add(notification);
  }
}, { deep: true });

const items = ref([
    {
        label: 'Home',
        icon: 'pi pi-home',
        route: '/'
    },
    {
        label: 'Player Rankings',
        icon: 'pi pi-trophy',
        route: '/players'
    },
    {
        label: 'Clan Rankings',
        icon: 'pi pi-shield',
        route: '/clans'
    },
    {
        label: 'Admin Panel',
        icon: 'pi pi-id-card',
        route: '/organizer-dash'
    },
]);
</script>

<template>
  <Toast :baseZIndex="9999" class="app-toast"/>
  <Menubar :model="items" class="mb-2">

    <template #start>
      <img
        src="/LG-Logo-Edited-Edited.png"
        alt="Logo"
        style="max-height: 32px; width: auto;"
      />
      <p>
        x yomi_adt
      </p>
    </template>

    <template #item="{ item, props, hasSubmenu }">
      <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
        <a v-ripple :href="href" v-bind="props.action" @click="navigate">
          <span :class="item.icon" />
          <span>{{ item.label }}</span>
        </a>
      </router-link>

      <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
        <span :class="item.icon" />
        <span>{{ item.label }}</span>
        <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down" />
      </a>
    </template>

  </Menubar>

  <div class="pt-1 app-content">
    <RouterView v-slot="{ Component, route }">
      <transition :name="route.meta.transition || ROUTE_TRANSITION_NAME" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </RouterView>
  </div>

</template>

<style scoped>
.app-content {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow-x: clip;
}

:global(.app-toast) {
    min-width: 30vw;
    max-width: 90vw;
}

/* The animation code */
@keyframes bounce {
  0% {
    top: 0px;
  }
  50% {
    top: 10px;
  }
  100% {
    top: 0px;
  }
}
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* The element to apply the animation to */
div .bounce {
  position: relative;
  animation-name: bounce;
  animation-duration: 1s;
  animation-iteration-count: infinite;
}
.fadeIn {
  animation-name: fadeIn;
  animation-duration: 1s;
}
.fadeOut {
  animation-name: fadeOut;
  animation-duration: 1s;
}
.fadeInDelay1Sec {
  animation-name: fadeIn;
  animation-duration: 1s;
  animation-fill-mode: both;
  animation-delay: 1s;
}
.fadeInDelay2Sec {
  animation-name: fadeIn;
  animation-duration: 1s;
  animation-fill-mode: both;
  animation-delay: 2s;
}
</style>