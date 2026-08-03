<template>
  <OrganizerGate>
  <div class="audit-log p-4">
    <div class="mb-4">
      <h1 class="text-2xl font-bold m-0">Player Point History</h1>
      <p class="text-color-secondary mt-1 mb-0">
        View a player's recorded point awards and undo one if it was a mistake.
      </p>
    </div>

    <Card>
      <template #title>{{ players.length }} Players</template>
      <template #content>
        <div v-if="playersError" class="flex align-items-center gap-2 mb-3">
          <Message severity="error" :closable="false" class="flex-1">{{ playersError }}</Message>
          <Button label="Retry" icon="pi pi-refresh" severity="secondary" outlined @click="fetchPlayers" />
        </div>

        <div class="flex justify-content-end mb-3">
          <span class="p-input-icon-left">
            <i class="pi pi-search mx-2" />
            <InputText v-model="filters.username.value" placeholder="Search username..." />
          </span>
        </div>

        <DataTable
          :value="players"
          :loading="playersLoading"
          dataKey="username"
          paginator
          :rows="15"
          sortField="points"
          :sortOrder="-1"
          v-model:filters="filters"
          filterDisplay="row"
        >
          <Column field="username" header="Username" sortable :showFilterMenu="false" />
          <Column field="bladerName" header="Blader Name" sortable />
          <Column field="points" header="Points" sortable style="width: 8rem" />
          <Column header="" style="width: 10rem">
            <template #body="{ data }">
              <Button label="View History" icon="pi pi-history" text @click="openHistory(data)" />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <Dialog
      v-model:visible="historyVisible"
      modal
      :header="selectedPlayer ? `Point History — ${selectedPlayer.username}` : 'Point History'"
      :style="{ width: '48rem' }"
    >
      <div v-if="entriesError" class="flex align-items-center gap-2 mb-3">
        <Message severity="error" :closable="false" class="flex-1">{{ entriesError }}</Message>
        <Button label="Retry" icon="pi pi-refresh" severity="secondary" outlined @click="fetchEntries" />
      </div>

      <div v-if="entriesLoading" class="text-color-secondary mb-3">
        <i class="pi pi-spin pi-spinner mr-2"></i>Loading history…
      </div>

      <div v-else-if="!entries.length && !entriesError" class="text-color-secondary py-4 text-center">
        No recorded point history for this player.
      </div>

      <div v-else class="flex flex-column gap-3">
        <div
          v-for="(entry, idx) in entries"
          :key="idx"
          class="border-1 surface-border border-round p-3"
          :class="{ 'opacity-50': undoneIndexes.has(idx) }"
        >
          <div class="flex justify-content-between align-items-start mb-2">
            <div>
              <div class="font-semibold">{{ entry.tournamentName || 'Untitled tournament' }}</div>
              <div class="text-sm text-color-secondary">
                {{ entry.totalPoints >= 0 ? 'Awarded' : 'Reversal' }}
              </div>
            </div>
            <Tag :value="`${entry.totalPoints >= 0 ? '+' : ''}${entry.totalPoints} pts`"
                 :severity="entry.totalPoints >= 0 ? 'success' : 'danger'" />
          </div>

          <div v-if="entry.appliedRules?.length" class="flex flex-wrap gap-2 mb-2">
            <Tag
              v-for="(rule, ruleIdx) in entry.appliedRules"
              :key="ruleIdx"
              :value="`${rule.label} × ${rule.count} (${rule.points} ea)`"
              severity="secondary"
            />
          </div>

          <Message v-if="undoneIndexes.has(idx)" severity="secondary" :closable="false" class="mb-2">
            Undone this session — a reversal entry has been added below.
          </Message>

          <Button
            v-else
            label="Undo"
            icon="pi pi-undo"
            severity="danger"
            text
            size="small"
            :loading="undoingIndex === idx"
            @click="confirmUndo(entry, idx)"
          />
        </div>
      </div>
    </Dialog>

    <Dialog v-model:visible="undoConfirmVisible" modal header="Confirm undo" :style="{ width: '26rem' }">
      <p class="m-0 mb-3" v-if="undoTarget.entry">
        This will subtract <strong>{{ undoTarget.entry.totalPoints }}</strong> point(s) from
        <strong>{{ selectedPlayer?.username }}</strong> and add a new "Reversal" entry to their history.
        This doesn't delete the original entry.
      </p>
      <Message v-if="undoError" severity="error" :closable="false" class="mb-3">{{ undoError }}</Message>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="undoConfirmVisible = false" />
        <Button label="Undo Points" severity="danger" :loading="undoingIndex !== null" @click="doUndo" />
      </template>
    </Dialog>
  </div>
  </OrganizerGate>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { FilterMatchMode } from '@primevue/core/api'

import Card from 'primevue/card'
import Button from 'primevue/button'
import Message from 'primevue/message'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import OrganizerGate from './OrganizerGate.vue'
import { useEntityRoster } from './useEntityRoster.js'
import { PLAYERS_API_BASE, PLAYER_RANKINGS_API_BASE } from './apiConfig.js'

// ---------- Player list (reuses the same roster-loading composable as PlayerRoster) ----------

const {
  entities: players,
  loading: playersLoading,
  error: playersError,
  fetchEntities: fetchPlayers,
} = useEntityRoster(PLAYERS_API_BASE)

const filters = ref({
  username: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

// ---------- History dialog ----------

const historyVisible = ref(false)
const selectedPlayer = ref(null)
const entries = ref([])
const entriesLoading = ref(false)
const entriesError = ref('')

// Session-only: the DTO has no stable id/timestamp, so this can't survive a
// reload or reliably distinguish two visually-identical entries. Good enough
// to grey out "already undone this session," not a durable record.
const undoneIndexes = ref(new Set())

function openHistory(player) {
  selectedPlayer.value = player
  undoneIndexes.value = new Set()
  historyVisible.value = true
  fetchEntries()
}

async function fetchEntries() {
  if (!selectedPlayer.value) return
  entriesLoading.value = true
  entriesError.value = ''
  try {
    const res = await axios.get(`${PLAYER_RANKINGS_API_BASE}/${encodeURIComponent(selectedPlayer.value.username)}/entries`)
    entries.value = res.data || []
  } catch (err) {
    entriesError.value = 'Could not load point history.'
  } finally {
    entriesLoading.value = false
  }
}

// ---------- Undo ----------

const undoConfirmVisible = ref(false)
const undoTarget = ref({ entry: null, index: null })
const undoingIndex = ref(null)
const undoError = ref('')

function confirmUndo(entry, index) {
  undoTarget.value = { entry, index }
  undoError.value = ''
  undoConfirmVisible.value = true
}

async function doUndo() {
  const { entry, index } = undoTarget.value
  if (!entry || !selectedPlayer.value) return

  undoingIndex.value = index
  undoError.value = ''
  try {
    const res = await axios.post(`${PLAYER_RANKINGS_API_BASE}/points`, {
      tournamentId: null,
      tournamentName: `Reversal: ${entry.tournamentName || 'Untitled tournament'}`,
      participantName: selectedPlayer.value.username,
      entityKey: selectedPlayer.value.username, // resolves directly, skips name-matching entirely
      appliedRules: [
        {
          label: `Reversal of "${entry.tournamentName || 'Untitled tournament'}"`,
          points: -entry.totalPoints,
          count: 1,
        },
      ],
      multiplier: 1,
      totalPoints: -entry.totalPoints,
    })

    // The response gives the entity's new running total directly — no need
    // to refetch the whole player list just to reflect the change.
    selectedPlayer.value.points = res.data.updatedTotalPoints
    const playerRow = players.value.find((p) => p.username === selectedPlayer.value.username)
    if (playerRow) playerRow.points = res.data.updatedTotalPoints

    undoneIndexes.value = new Set([...undoneIndexes.value, index])
    undoConfirmVisible.value = false
    await fetchEntries() // pick up the new reversal entry that was just logged
  } catch (err) {
    undoError.value = 'Could not undo this entry. Try again.'
  } finally {
    undoingIndex.value = null
  }
}
</script>