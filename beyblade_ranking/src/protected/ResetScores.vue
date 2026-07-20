<template>
  <OrganizerGate>
  <div class="reset-scores p-4">
    <div class="mb-4">
      <h1 class="text-2xl font-bold m-0">Reset Scores</h1>
      <p class="text-color-secondary mt-1 mb-0">
        Zero out every player's point total — for example, at the start of a new season.
      </p>
    </div>

    <Card style="max-width: 32rem;">
      <template #content>
        <Message severity="warn" :closable="false" class="mb-4">
          This sets every player's points back to 0. It does not delete past tournament point
          history — the record of who earned what stays intact — but the running totals cannot
          be recovered once reset.
        </Message>

        <Message v-if="resultMessage" :severity="resultSeverity" :closable="false" class="mb-4">
          {{ resultMessage }}
        </Message>

        <Button
          label="Reset All Scores"
          icon="pi pi-exclamation-triangle"
          severity="danger"
          :loading="resetting"
          @click="confirmVisible = true"
        />
      </template>
    </Card>

    <Dialog
      v-model:visible="confirmVisible"
      modal
      header="Confirm score reset"
      :style="{ width: '28rem' }"
    >
      <p class="m-0 mb-3">
        Are you sure? This will set every player's points to 0. This can't be undone.
      </p>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="confirmVisible = false" />
        <Button label="Yes, reset everything" severity="danger" :loading="resetting" @click="resetScores" />
      </template>
    </Dialog>
  </div>
  </OrganizerGate>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

import Card from 'primevue/card'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Dialog from 'primevue/dialog'
import OrganizerGate from './OrganizerGate.vue'
import { RANKINGS_API_BASE } from './apiConfig'

// Assumes PrimeVue is already installed and registered with a theme preset
// (e.g. Aura) in main.js — see TournamentAdminDashboard.vue for the setup snippet.

const confirmVisible = ref(false)
const resetting = ref(false)
const resultMessage = ref('')
const resultSeverity = ref('success')

async function resetScores() {
  resetting.value = true
  resultMessage.value = ''
  try {
    const res = await axios.post(`${RANKINGS_API_BASE}/reset-scores`)
    resultMessage.value = `Reset ${res.data.playersReset} player(s) to 0 points.`
    resultSeverity.value = 'success'
    confirmVisible.value = false
  } catch (err) {
    resultMessage.value = 'Could not reset scores. Try again.'
    resultSeverity.value = 'error'
  } finally {
    resetting.value = false
  }
}
</script>