<template>
  <OrganizerGate>
  <div class="reset-scores p-4">
    <div class="mb-4">
      <h1 class="text-2xl font-bold m-0">Reset Scores</h1>
      <p class="text-color-secondary mt-1 mb-0">
        Zero out point totals — for example, at the start of a new season.
      </p>
    </div>

    <div class="flex flex-column gap-4">
      <Card style="max-width: 32rem;">
        <template #title>Players</template>
        <template #content>
          <Message severity="warn" :closable="false" class="mb-4">
            Sets every player's points back to 0 AND deletes their tournament point history.
            This can't be undone.
          </Message>
          <Message v-if="playerResult.message" :severity="playerResult.severity" :closable="false" class="mb-4">
            {{ playerResult.message }}
          </Message>
          <Button
            label="Reset All Player Scores"
            icon="pi pi-exclamation-triangle"
            severity="danger"
            :loading="playerResetting"
            @click="playerConfirmVisible = true"
          />
        </template>
      </Card>

      <Card style="max-width: 32rem;">
        <template #title>Clans</template>
        <template #content>
          <Message severity="warn" :closable="false" class="mb-4">
            Sets every clan's points back to 0 AND deletes their tournament point history.
            This can't be undone.
          </Message>
          <Message v-if="clanResult.message" :severity="clanResult.severity" :closable="false" class="mb-4">
            {{ clanResult.message }}
          </Message>
          <Button
            label="Reset All Clan Scores"
            icon="pi pi-exclamation-triangle"
            severity="danger"
            :loading="clanResetting"
            @click="clanConfirmVisible = true"
          />
        </template>
      </Card>
    </div>

    <Dialog v-model:visible="playerConfirmVisible" modal header="Confirm player score reset" :style="{ width: '28rem' }">
      <p class="m-0 mb-3">
        Are you sure? This will set every player's points to 0 and delete their tournament point
        history. This can't be undone.
      </p>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="playerConfirmVisible = false" />
        <Button label="Yes, reset everything" severity="danger" :loading="playerResetting" @click="resetPlayerScores" />
      </template>
    </Dialog>

    <Dialog v-model:visible="clanConfirmVisible" modal header="Confirm clan score reset" :style="{ width: '28rem' }">
      <p class="m-0 mb-3">
        Are you sure? This will set every clan's points to 0 and delete their tournament point
        history. This can't be undone.
      </p>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="clanConfirmVisible = false" />
        <Button label="Yes, reset everything" severity="danger" :loading="clanResetting" @click="resetClanScores" />
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
import { PLAYER_RANKINGS_API_BASE, CLAN_RANKINGS_API_BASE } from './apiConfig'

const playerConfirmVisible = ref(false)
const playerResetting = ref(false)
const playerResult = ref({ message: '', severity: 'success' })

const clanConfirmVisible = ref(false)
const clanResetting = ref(false)
const clanResult = ref({ message: '', severity: 'success' })

async function resetPlayerScores() {
  playerResetting.value = true
  playerResult.value = { message: '', severity: 'success' }
  try {
    const res = await axios.post(`${PLAYER_RANKINGS_API_BASE}/reset-scores`)
    playerResult.value = {
      message: `Reset ${res.data.entitiesReset} player(s) to 0 points and removed ${res.data.logEntriesRemoved} history entr${res.data.logEntriesRemoved === 1 ? 'y' : 'ies'}.`,
      severity: 'success',
    }
    playerConfirmVisible.value = false
  } catch (err) {
    playerResult.value = { message: 'Could not reset player scores. Try again.', severity: 'error' }
  } finally {
    playerResetting.value = false
  }
}

async function resetClanScores() {
  clanResetting.value = true
  clanResult.value = { message: '', severity: 'success' }
  try {
    const res = await axios.post(`${CLAN_RANKINGS_API_BASE}/reset-scores`)
    clanResult.value = {
      message: `Reset ${res.data.entitiesReset} clan(s) to 0 points and removed ${res.data.logEntriesRemoved} history entr${res.data.logEntriesRemoved === 1 ? 'y' : 'ies'}.`,
      severity: 'success',
    }
    clanConfirmVisible.value = false
  } catch (err) {
    clanResult.value = { message: 'Could not reset clan scores. Try again.', severity: 'error' }
  } finally {
    clanResetting.value = false
  }
}
</script>