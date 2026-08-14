<script setup>

import { Button} from "primevue";
import { useRouter } from 'vue-router';
import Top3Bladers from "../components/Top3Bladers.vue";
import Top3Clans from "../components/Top3Clans.vue";

const router = useRouter();
</script>

<template>
  <h1 class="pt-5">Winnipeg's Competitive Beyblade X Rankings</h1>
  <small class="pt-5 text-color-secondary">(Development is still ongoing!)</small>

<div class="rankings-container">
  <div class="ranking-section">
    <Top3Bladers />
    <Button
      label="View Full Rankings"
      class="mt-3"
      @click="router.push('/players')"
    />
  </div>

  <div class="ranking-section">
    <Top3Clans />
    <Button
      label="View Full Rankings"
      class="mt-3"
      @click="router.push('/clans')"
    />
  </div>
</div>
</template>

<style scoped>
.rankings-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  padding: 0 0.75rem;
}

@media (max-width: 768px) {
  .rankings-container {
    grid-template-columns: 1fr;
  }

  .ranking-section + .ranking-section {
    border-top: 1px solid;
    border-bottom: 1px solid;
  }
}
</style>
