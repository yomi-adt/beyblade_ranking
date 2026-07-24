<script setup>

import { Button } from "primevue";
import { useRouter } from 'vue-router';
import Top3Bladers from "../components/Top3Bladers.vue";
import Top3Clans from "../components/Top3Clans.vue";

const router = useRouter();
</script>

<template>
  <h1 class="pt-5">Winnipeg's Competitive Beyblade X Rankings</h1>
  <h2 class="pt-5">(Under construction. Expect some weirdness!)</h2>
  <div div style="display: block; width: 100%; padding: 0 0.75rem">
    <Top3Bladers />
    <Button
      label="View Full Rankings"
      class="mt-3"
      @click="() => {router.push('/players');}"
    />
  </div>
  <div div style="display: block; width: 100%; padding: 0 0.75rem">
    <Top3Clans />
    <Button
      label="View Full Rankings"
      class="mt-3"
      @click="() => {router.push('/clans');}"
    />
  </div>
</template>
