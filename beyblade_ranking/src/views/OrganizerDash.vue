<script setup>
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import OrganizerGate from '../components/OrganizerGate.vue';

const router = useRouter()
</script>

<template>
  <OrganizerGate>
  <div class="card-container">
    <Card>
      <template #title>
        Update Player Scores
      </template>

      <template #footer>
        <Button
          label="Update Player Scores"
          icon="pi pi-users"
          @click="router.push('/update-player-scores')"
        />
      </template>
    </Card>

    <Card>
      <template #title>
        Reset Scores
      </template>

      <template #footer>
        <Button
          label="Reset Scores"
          icon="pi pi-user"
          @click="router.push('/reset-scores')"
        />
      </template>
    </Card>
  </div>
  </OrganizerGate>
</template>

<style scoped>
.card-container {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.p-card {
  width: 22rem;
}
</style>