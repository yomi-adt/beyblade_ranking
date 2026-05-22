<script setup>
import BladerTable from "../components/BladerTable.vue";
import ClansTable from "../components/ClansTable.vue";
</script>

<template>
  <div
    style="display: flex; gap: 1rem; align-items: flex-start; flex-wrap: wrap"
  >
    <div style="flex: 1 1 45%; min-width: 300px; padding: 0 0.75rem">
      <BladerTable />
    </div>
    <div style="flex: 1 1 45%; min-width: 300px; padding: 0 0.75rem">
      <ClansTable />
    </div>
  </div>
</template>
