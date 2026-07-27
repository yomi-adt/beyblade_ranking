<template>
  <OrganizerGate>
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
        <div v-if="rulesError" class="flex align-items-center gap-2 mb-3">
          <Message severity="error" :closable="false" class="flex-1">{{ rulesError }}</Message>
          <Button label="Retry" icon="pi pi-refresh" severity="secondary" outlined @click="fetchPointRules" />
        </div>

        <div v-if="rulesLoading" class="text-color-secondary mb-3">
          <i class="pi pi-spin pi-spinner mr-2"></i>Loading point rules…
        </div>

        <div v-else-if="!pointRules.length && !rulesError" class="text-color-secondary mb-3">
          No point rules yet — add your first one below.
        </div>

        <div v-for="rule in pointRules" :key="rule.id" class="flex align-items-center gap-2 mb-3">
          <InputText
            v-model="rule.label"
            :placeholder="rule.type === 'COUNT' ? 'e.g. Points per Swiss win' : 'e.g. Made top cut?'"
            class="flex-1"
            @update:modelValue="markRuleDirty(rule)"
          />
          <InputNumber
            v-model="rule.points"
            :placeholder="rule.type === 'COUNT' ? 'Points each' : 'Points'"
            suffix=" pts"
            :min="0"
            class="w-9rem"
            @update:modelValue="markRuleDirty(rule)"
          />
          <SelectButton
            v-model="rule.type"
            :options="ruleTypeOptions"
            optionLabel="label"
            optionValue="value"
            :allowEmpty="false"
            @update:modelValue="markRuleDirty(rule)"
          />
          <Button
            icon="pi pi-check"
            severity="success"
            text
            :disabled="!rule.dirty || rule.saving"
            :loading="rule.saving"
            @click="saveRule(rule)"
            aria-label="Save rule"
          />
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            :disabled="pointRules.length <= 1 || rule.saving"
            @click="removeRule(rule)"
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
        <small v-if="!pointRules.length" class="text-color-secondary d-block mt-2">
          Add at least one point rule above before loading a tournament.
        </small>
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
              <div class="flex flex-wrap align-items-center gap-2">
                <ToggleButton
                  v-for="rule in booleanRules"
                  :key="rule.id"
                  :modelValue="!!data.ruleValues[rule.id]"
                  :onLabel="`${rule.label || 'Untitled rule'} (${rule.points})`"
                  :offLabel="`${rule.label || 'Untitled rule'} (${rule.points})`"
                  :disabled="submitting"
                  @update:modelValue="() => toggleBooleanRule(data, rule.id)"
                  class="p-button-sm"
                />
                <div v-for="rule in countRules" :key="rule.id" class="flex align-items-center gap-1">
                  <span class="text-sm white-space-nowrap">{{ rule.label || 'Untitled rule' }} ({{ rule.points }} ea):</span>
                  <InputNumber
                    :modelValue="data.ruleValues[rule.id] || 0"
                    @update:modelValue="(v) => setCountRule(data, rule.id, v)"
                    :min="0"
                    :disabled="submitting"
                    showButtons
                    buttonLayout="horizontal"
                    class="w-6rem"
                    inputStyle="width: 2.5rem; text-align: center;"
                  />
                </div>
              </div>
            </template>
          </Column>
          <Column header="Total Points" style="width: 7rem" bodyStyle="text-align: center; justify-content: center;" headerStyle="text-align: center; justify-content: center;">
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
                <Button
                  icon="pi pi-user-plus"
                  size="small"
                  severity="secondary"
                  outlined
                  @click="openAddPlayerDialog(data)"
                  aria-label="Add new player"
                  title="No matching player? Add one."
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

    <Dialog v-model:visible="addPlayerDialogVisible" modal header="Add New Player" :style="{ width: '26rem' }">
      <div class="flex flex-column gap-3">
        <div>
          <label for="newPlayerUsername" class="font-semibold block mb-1">Username</label>
          <InputText id="newPlayerUsername" v-model="newPlayerUsername" class="w-full" placeholder="Unique login/id" />
        </div>
        <div>
          <label for="newPlayerBladerName" class="font-semibold block mb-1">Blader Name</label>
          <InputText id="newPlayerBladerName" v-model="newPlayerBladerName" class="w-full" placeholder="Optional" />
        </div>
        <Message v-if="addPlayerError" severity="error" :closable="false">{{ addPlayerError }}</Message>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="addPlayerDialogVisible = false" />
        <Button
          label="Create &amp; Match"
          icon="pi pi-user-plus"
          :loading="addingPlayer"
          :disabled="!newPlayerUsername.trim()"
          @click="createAndMatchPlayer"
        />
      </template>
    </Dialog>
  </div>
  </OrganizerGate>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
import SelectButton from 'primevue/selectbutton'
import Dialog from 'primevue/dialog'
import OrganizerGate from './OrganizerGate.vue'
import { RANKINGS_API_BASE, CHALLONGE_API_BASE, PLAYERS_API_BASE, POINT_RULES_API_BASE } from './apiConfig'

// Assumes PrimeVue is already installed and registered with a theme preset
// (e.g. Aura) in main.js:
//   import PrimeVue from 'primevue/config'
//   import Aura from '@primevue/themes/aura'
//   app.use(PrimeVue, { theme: { preset: Aura } })

// Points are your app's own community ranking data (stored in your backend/DB),
// separate from Challonge itself — Challonge only supplies the participant list
// and bracket results, it has no concept of your community's point system.

const ruleTypeOptions = [
  { label: 'Yes/No', value: 'BOOLEAN' },
  { label: 'Count ×', value: 'COUNT' },
]

// Point rules are persisted server-side (Mongo) so they survive page
// reloads and are shared across admins — fetched on mount, edited inline,
// and saved individually per row.
const pointRules = ref([])
const rulesLoading = ref(false)
const rulesError = ref('')
const multiplier = ref(1)

const booleanRules = computed(() => pointRules.value.filter((r) => r.type !== 'COUNT'))
const countRules = computed(() => pointRules.value.filter((r) => r.type === 'COUNT'))

async function fetchPointRules() {
  rulesLoading.value = true
  rulesError.value = ''
  try {
    const res = await axios.get(POINT_RULES_API_BASE)
    pointRules.value = (res.data || []).map((r) => ({
      ...r,
      type: r.type || 'BOOLEAN',
      dirty: false,
      saving: false,
    }))
  } catch (err) {
    rulesError.value = 'Could not load point rules.'
  } finally {
    rulesLoading.value = false
  }
}

onMounted(fetchPointRules)

function markRuleDirty(rule) {
  rule.dirty = true
}

let tempIdCounter = 0

function addRule() {
  // Add a local-only row immediately so there's always an input to type into,
  // even if the backend is unreachable or would reject a blank label/points.
  // It's only persisted (POST) when the admin saves it with real content.
  pointRules.value.push({
    id: `temp-${tempIdCounter++}`,
    label: '',
    points: 0,
    type: 'BOOLEAN',
    dirty: true,
    saving: false,
    isNew: true,
  })
}

async function saveRule(rule) {
  if (!rule.label.trim()) {
    rulesError.value = 'Give the rule a label before saving.'
    return
  }

  rule.saving = true
  rulesError.value = ''
  try {
    const payload = { label: rule.label, points: rule.points, type: rule.type }
    if (rule.isNew) {
      const res = await axios.post(POINT_RULES_API_BASE, payload)
      rule.id = res.data.id
      rule.isNew = false
    } else {
      const res = await axios.put(`${POINT_RULES_API_BASE}/${rule.id}`, payload)
      rule.label = res.data.label
      rule.points = res.data.points
      rule.type = res.data.type
    }
    rule.dirty = false
  } catch (err) {
    rulesError.value = `Could not save "${rule.label || 'Untitled rule'}".`
  } finally {
    rule.saving = false
  }
}

async function removeRule(rule) {
  if (rule.isNew) {
    // Never persisted — just drop the local row, no DELETE needed.
    pointRules.value = pointRules.value.filter((r) => r.id !== rule.id)
    return
  }
  try {
    await axios.delete(`${POINT_RULES_API_BASE}/${rule.id}`)
    pointRules.value = pointRules.value.filter((r) => r.id !== rule.id)
    participants.value.forEach((p) => {
      if (rule.id in p.ruleValues) {
        const { [rule.id]: _removed, ...rest } = p.ruleValues
        p.ruleValues = rest
        markDirty(p)
      }
    })
  } catch (err) {
    rulesError.value = `Could not remove "${rule.label || 'Untitled rule'}".`
  }
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

// "Add Player" dialog — for when a Challonge participant genuinely has no
// existing Player yet (new community member). Creates the Player, then
// immediately resubmits the pending point award against it.
const addPlayerDialogVisible = ref(false)
const addPlayerTarget = ref(null)
const newPlayerUsername = ref('')
const newPlayerBladerName = ref('')
const addingPlayer = ref(false)
const addPlayerError = ref('')

function openAddPlayerDialog(participant) {
  addPlayerTarget.value = participant
  newPlayerUsername.value = participant.name
  newPlayerBladerName.value = ''
  addPlayerError.value = ''
  addPlayerDialogVisible.value = true
}

async function createAndMatchPlayer() {
  const username = newPlayerUsername.value.trim()
  if (!username) return

  addingPlayer.value = true
  addPlayerError.value = ''
  try {
    const res = await axios.post(PLAYERS_API_BASE, {
      username,
      bladerName: newPlayerBladerName.value.trim() || null,
      lore: null,
      signatureCombo: null,
      points: 0,
    })
    playersList.value.push(res.data)

    const target = addPlayerTarget.value
    addPlayerDialogVisible.value = false
    if (target) {
      target.matchUsername = res.data.username
      submitting.value = true
      await submitOne(target)
      submitting.value = false
    }
  } catch (err) {
    addPlayerError.value =
      err.response?.status === 409 || err.response?.status === 400
        ? 'A player with that username already exists.'
        : 'Could not create the player. Try again.'
  } finally {
    addingPlayer.value = false
  }
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
      // Keyed by rule id. BOOLEAN rules store true/false; COUNT rules store a number.
      ruleValues: {},
      originalRuleValues: {},
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

function toggleBooleanRule(participant, ruleId) {
  participant.ruleValues = {
    ...participant.ruleValues,
    [ruleId]: !participant.ruleValues[ruleId],
  }
  markDirty(participant)
}

function setCountRule(participant, ruleId, value) {
  participant.ruleValues = {
    ...participant.ruleValues,
    [ruleId]: Number(value) || 0,
  }
  markDirty(participant)
}

function markDirty(p) {
  const same = JSON.stringify(p.ruleValues) === JSON.stringify(p.originalRuleValues)
  p.dirty = !same
  if (p.saveState !== 'needs-match') p.saveState = null
}

function computeTotal(p) {
  const base = pointRules.value.reduce((sum, rule) => {
    const raw = p.ruleValues[rule.id]
    if (rule.type === 'COUNT') {
      return sum + (Number(raw) || 0) * (Number(rule.points) || 0)
    }
    return sum + (raw ? Number(rule.points) || 0 : 0)
  }, 0)
  return base * (Number(multiplier.value) || 0)
}

function resetChanges() {
  participants.value.forEach((p) => {
    p.ruleValues = { ...p.originalRuleValues }
    p.dirty = false
    p.saveState = null
    p.matchUsername = null
  })
  banner.value = { message: '', type: 'success' }
}

function buildPayload(p, explicitUsername) {
  const appliedRules = pointRules.value
    .map((rule) => {
      const raw = p.ruleValues[rule.id]
      const count = rule.type === 'COUNT' ? Number(raw) || 0 : raw ? 1 : 0
      return { label: rule.label, points: rule.points, count }
    })
    .filter((r) => r.count > 0)

  return {
    tournamentId: tournament.value?.id,
    tournamentName: tournament.value?.name,
    participantName: p.name,
    playerUsername: explicitUsername || null,
    appliedRules,
    multiplier: multiplier.value,
    totalPoints: computeTotal(p),
  }
}

async function submitOne(p) {
  try {
    await axios.post(`${RANKINGS_API_BASE}/points`, buildPayload(p, p.matchUsername))
    p.originalRuleValues = { ...p.ruleValues }
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
  background-color: rgba(245, 158, 11, 0.12);
  box-shadow: inset 3px 0 0 0 var(--p-yellow-500, #f59e0b);
}
</style>