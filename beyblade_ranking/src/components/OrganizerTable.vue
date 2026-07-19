<template>
  <div class="dashboard p-4">
    <div class="mb-4">
      <h1 class="text-2xl font-bold m-0">Tournament Administrator</h1>
      <p class="text-color-secondary mt-1 mb-0">
        Define point rules, load a Challonge bracket, and tag each player's results
      </p>
    </div>

    <!-- Step 1: Point rules + multiplier -->
    <Card class="mb-4">
      <template #title>1. Point Rules</template>
      <template #content>
        <div v-for="(rule, idx) in pointRules" :key="rule.id" class="flex align-items-center gap-2 mb-3">
          <InputText v-model="rule.label" placeholder="e.g. Match win in Swiss" class="flex-1" />
          <InputNumber v-model="rule.points" placeholder="Points" suffix=" pts" :min="0" class="w-8rem" />
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            :disabled="pointRules.length <= 1"
            @click="removeRule(idx)"
            aria-label="Remove rule"
          />
        </div>

        <Button label="Add Rule" icon="pi pi-plus" text @click="addRule" class="mb-4" />

        <Divider />

        <div class="flex flex-column gap-2" style="max-width: 16rem;">
          <label for="multiplier" class="font-semibold">Event Multiplier</label>
          <InputNumber
            id="multiplier"
            v-model="multiplier"
            :min="0"
            :minFractionDigits="0"
            :maxFractionDigits="2"
            prefix="×"
          />
          <small class="text-color-secondary">Use 2 for "double points" events, 1 for normal events.</small>
        </div>
      </template>
    </Card>

    <!-- Step 2: Load tournament -->
    <Card class="mb-4">
      <template #title>2. Load Tournament</template>
      <template #content>
        <label for="challongeUrl" class="font-semibold block mb-2">Challonge tournament link or slug</label>
        <div class="flex gap-2">
          <InputText
            id="challongeUrl"
            v-model="challongeInput"
            placeholder="e.g. https://challonge.com/my_tournament or my_tournament"
            class="flex-1"
            :disabled="loading"
            @keyup.enter="loadTournament"
          />
          <Button
            label="Load Participants"
            icon="pi pi-download"
            :loading="loading"
            :disabled="!challongeInput.trim() || !pointRules.length"
            @click="loadTournament"
          />
        </div>
        <Message v-if="loadError" severity="error" :closable="false" class="mt-3">{{ loadError }}</Message>
        <div v-if="tournament" class="mt-3 flex align-items-center gap-2">
          <Tag :value="tournament.name" severity="info" />
          <span class="text-color-secondary text-sm">{{ participants.length }} participants loaded</span>
        </div>
      </template>
    </Card>

    <!-- Feedback banner -->
    <Message v-if="banner.message" :severity="banner.type === 'error' ? 'error' : 'success'" :closable="false" class="mb-4">
      {{ banner.message }}
    </Message>

    <!-- Step 3: Tag achievements per participant -->
    <Card v-if="participants.length">
      <template #title>
        <Toolbar>
          <template #start>3. Tag Results &amp; Review Points</template>
          <template #end>
            <Button
              label="Discard Changes"
              severity="secondary"
              text
              :disabled="submitting"
              @click="resetChanges"
              class="mr-2"
            />
            <Button
              label="Update All Scores"
              icon="pi pi-check"
              :loading="submitting"
              :disabled="!hasChanges"
              @click="submitAllPoints"
            />
          </template>
        </Toolbar>
      </template>
      <template #content>
        <DataTable :value="participants" dataKey="id" :rowClass="rowClass" responsiveLayout="scroll">
          <Column field="seed" header="Seed" style="width: 4rem" />
          <Column field="name" header="Participant" style="width: 14rem" />
          <Column :header="`Achievements (${multiplier}× multiplier applied)`">
            <template #body="{ data }">
              <div class="flex flex-wrap gap-2">
                <ToggleButton
                  v-for="rule in pointRules"
                  :key="rule.id"
                  :modelValue="data.selectedRuleIds.includes(rule.id)"
                  :onLabel="`${rule.label || 'Untitled rule'} (${rule.points})`"
                  :offLabel="`${rule.label || 'Untitled rule'} (${rule.points})`"
                  :disabled="submitting"
                  @update:modelValue="() => toggleRule(data, rule.id)"
                  class="p-button-sm"
                />
              </div>
            </template>
          </Column>
          <Column header="Total Points" style="width: 7rem">
            <template #body="{ data }">
              <span class="font-semibold">{{ computeTotal(data) }}</span>
            </template>
          </Column>
          <Column header="Status" style="width: 16rem">
            <template #body="{ data }">
              <div v-if="data.saveState === 'needs-match'" class="flex align-items-center gap-2">
                <Select
                  v-model="data.matchUsername"
                  :options="playersList"
                  optionLabel="username"
                  optionValue="username"
                  filter
                  placeholder="Select player…"
                  class="w-12rem"
                />
                <Button
                  icon="pi pi-check"
                  size="small"
                  :disabled="!data.matchUsername"
                  @click="confirmMatch(data)"
                  aria-label="Confirm match"
                />
              </div>
              <Tag v-else-if="data.saveState === 'success'" value="Saved" severity="success" />
              <Tag v-else-if="data.saveState === 'error'" value="Failed" severity="danger" />
              <Tag v-else-if="data.dirty" value="Unsaved" severity="warning" />
              <Tag v-else value="—" severity="secondary" />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <div v-else-if="!loading && attemptedLoad" class="text-center text-color-secondary py-6">
      No participants found for that tournament.
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'

import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import Toolbar from 'primevue/toolbar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ToggleButton from 'primevue/togglebutton'
import Select from 'primevue/select'

// Assumes PrimeVue is already installed and registered with a theme preset
// (e.g. Aura) in main.js:
//   import PrimeVue from 'primevue/config'
//   import Aura from '@primevue/themes/aura'
//   app.use(PrimeVue, { theme: { preset: Aura } })

// Points are your app's own community ranking data (stored in your backend/DB),
// separate from Challonge itself — Challonge only supplies the participant list
// and bracket results, it has no concept of your community's point system.
const RANKINGS_API_BASE = '/api/rankings'
const CHALLONGE_API_BASE = '/api/challonge'
const PLAYERS_API_BASE = '/api/players'

let ruleIdCounter = 0
function newRule(label = '', points = 0) {
  return { id: `rule-${ruleIdCounter++}`, label, points }
}

const pointRules = ref([
  newRule('Match win in Swiss', 10),
  newRule('Made top cut', 20),
  newRule('Winners bracket win', 20),
])
const multiplier = ref(1)

function addRule() {
  pointRules.value.push(newRule())
}

function removeRule(idx) {
  const removedId = pointRules.value[idx].id
  pointRules.value.splice(idx, 1)
  participants.value.forEach((p) => {
    const before = p.selectedRuleIds.length
    p.selectedRuleIds = p.selectedRuleIds.filter((id) => id !== removedId)
    if (p.selectedRuleIds.length !== before) markDirty(p)
  })
}

const challongeInput = ref('')
const tournament = ref(null)
const participants = ref([])
const loading = ref(false)
const submitting = ref(false)
const loadError = ref('')
const attemptedLoad = ref(false)
const banner = ref({ message: '', type: 'success' })

// Player list for the match picker — fetched lazily, once, the first time
// a participant name fails to resolve to a username.
const playersList = ref([])
let playersLoadPromise = null
async function ensurePlayersLoaded() {
  if (playersList.value.length) return
  if (!playersLoadPromise) {
    playersLoadPromise = axios
      .get(PLAYERS_API_BASE)
      .then((res) => { playersList.value = res.data || [] })
      .catch(() => { playersList.value = [] })
  }
  await playersLoadPromise
}

const hasChanges = computed(() => participants.value.some((p) => p.dirty))

function rowClass(data) {
  return data.dirty ? 'dirty-row' : ''
}

function extractSlug(input) {
  const trimmed = input.trim()
  const match = trimmed.match(/challonge\.com\/(?:.*\/)?([^/?#]+)/i)
  return match ? match[1] : trimmed
}

async function loadTournament() {
  loadError.value = ''
  banner.value = { message: '', type: 'success' }
  loading.value = true
  attemptedLoad.value = true
  const slug = extractSlug(challongeInput.value)

  try {
    const res = await axios.get(`${CHALLONGE_API_BASE}/tournaments/${encodeURIComponent(slug)}`)
    tournament.value = res.data.tournament
    participants.value = (res.data.participants || []).map((p) => ({
      id: p.id,
      seed: p.seed,
      name: p.name,
      selectedRuleIds: [],
      originalRuleIds: [],
      dirty: false,
      saveState: null,
      matchUsername: null, // set once the admin resolves a name mismatch
    }))
  } catch (err) {
    tournament.value = null
    participants.value = []
    loadError.value =
      err.response?.data?.message || 'Could not load that tournament. Check the link and try again.'
  } finally {
    loading.value = false
  }
}

function toggleRule(participant, ruleId) {
  const idx = participant.selectedRuleIds.indexOf(ruleId)
  if (idx === -1) {
    participant.selectedRuleIds.push(ruleId)
  } else {
    participant.selectedRuleIds.splice(idx, 1)
  }
  markDirty(participant)
}

function markDirty(p) {
  const same =
    p.selectedRuleIds.length === p.originalRuleIds.length &&
    p.selectedRuleIds.every((id) => p.originalRuleIds.includes(id))
  p.dirty = !same
  if (p.saveState !== 'needs-match') p.saveState = null
}

function computeTotal(p) {
  const base = p.selectedRuleIds.reduce((sum, ruleId) => {
    const rule = pointRules.value.find((r) => r.id === ruleId)
    return sum + (rule ? Number(rule.points) || 0 : 0)
  }, 0)
  return base * (Number(multiplier.value) || 0)
}

function resetChanges() {
  participants.value.forEach((p) => {
    p.selectedRuleIds = [...p.originalRuleIds]
    p.dirty = false
    p.saveState = null
    p.matchUsername = null
  })
  banner.value = { message: '', type: 'success' }
}

function buildPayload(p, explicitUsername) {
  return {
    tournamentId: tournament.value?.id,
    tournamentName: tournament.value?.name,
    participantName: p.name,
    playerUsername: explicitUsername || null,
    appliedRules: p.selectedRuleIds.map((id) => {
      const rule = pointRules.value.find((r) => r.id === id)
      return { label: rule?.label, points: rule?.points }
    }),
    multiplier: multiplier.value,
    totalPoints: computeTotal(p),
  }
}

async function submitOne(p) {
  try {
    await axios.post(`${RANKINGS_API_BASE}/points`, buildPayload(p, p.matchUsername))
    p.originalRuleIds = [...p.selectedRuleIds]
    p.dirty = false
    p.saveState = 'success'
    return 'success'
  } catch (err) {
    if (err.response?.status === 409) {
      p.saveState = 'needs-match'
      await ensurePlayersLoaded()
      return 'needs-match'
    }
    p.saveState = 'error'
    return 'error'
  }
}

async function submitAllPoints() {
  const changed = participants.value.filter((p) => p.dirty)
  if (!changed.length) return

  submitting.value = true
  banner.value = { message: '', type: 'success' }
  let failures = 0
  let needsMatch = 0

  for (const p of changed) {
    const result = await submitOne(p)
    if (result === 'error') failures += 1
    if (result === 'needs-match') needsMatch += 1
  }

  submitting.value = false

  if (needsMatch) {
    banner.value = {
      message: `${needsMatch} participant name(s) didn't match a player — pick the right one in the Status column, then confirm.`,
      type: 'error',
    }
  } else if (failures) {
    banner.value = { message: `${failures} point update(s) failed. Adjust and try again.`, type: 'error' }
  } else {
    banner.value = { message: 'All points submitted to the community ranking.', type: 'success' }
  }
}

/** Resubmits a single participant once the admin has picked their matching username. */
async function confirmMatch(p) {
  if (!p.matchUsername) return
  submitting.value = true
  await submitOne(p)
  submitting.value = false
}
</script>

<style scoped>
.dashboard :deep(.dirty-row) {
  background-color: var(--p-yellow-50, #fffbeb);
}
</style>