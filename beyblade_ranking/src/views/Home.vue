<script setup>
import BladerTable from "../components/BladerTable.vue";
import ClansTable from "../components/ClansTable.vue";
import Top3Bladers from "../components/Top3Bladers.vue";
import Top3Clans from "../components/Top3Clans.vue";

import { Button } from "primevue";
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <h1 class="pt-5">Winnipeg's Competitive Beyblade X Rankings</h1>
  <div div style="display: block; width: 100%; padding: 0 0.75rem">
    <Top3Bladers></Top3Bladers>
    <Button
      label="View Full Rankings"
      class="mt-3"
      @click="() => {router.push('/players');}"
    />
  </div>
  <div div style="display: block; width: 100%; padding: 0 0.75rem">
    <Top3Clans></Top3Clans>
    <Button
      label="View Full Rankings"
      class="mt-3"
      @click="() => {router.push('/clans');}"
    />
  </div>
</template>
