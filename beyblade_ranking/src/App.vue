<script setup>
import { RouterView } from "vue-router";
import { Button, Menubar } from "primevue";
import { ref } from 'vue'

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

  <div class="pt-1">
    <RouterView />
  </div>

</template>

<style scoped>
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
