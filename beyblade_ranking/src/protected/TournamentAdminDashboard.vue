<template>
  <OrganizerGate>
  <div class="dashboard p-4">
    <div class="mb-4">
      <h1 class="text-2xl font-bold m-0">Player Scoring</h1>
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
          <Column header="Total Points" style="width: 7rem">
            <template #body="{ data }">
              <span class="font-semibold">{{ computeTotal(data) }}</span>
            </template>
          </Column>
          <Column header="Status" style="width: 16rem">
            <template #body="{ data }">
              <div v-if="data.saveState === 'needs-match'" class="flex align-items-center gap-2">
                <Select
                  v-model="data.matchKey"
                  :options="entityList"
                  optionLabel="username"
                  optionValue="username"
                  filter
                  placeholder="Select player…"
                  class="w-12rem"
                />
                <Button
                  icon="pi pi-check"
                  size="small"
                  :disabled="!data.matchKey"
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
import { ref } from 'vue'
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
import { PLAYER_RANKINGS_API_BASE, CHALLONGE_API_BASE, PLAYERS_API_BASE, POINT_RULES_API_BASE } from './apiConfig.js'
import { useTournamentScoring } from './useTournamentScoring.js'

// Assumes PrimeVue is already installed and registered with a theme preset
// (e.g. Aura) in main.js:
//   import PrimeVue from 'primevue/config'
//   import Aura from '@primevue/themes/aura'
//   app.use(PrimeVue, { theme: { preset: Aura } })

const {
  ruleTypeOptions, pointRules, rulesLoading, rulesError, multiplier, booleanRules, countRules,
  fetchPointRules, markRuleDirty, addRule, saveRule, removeRule,
  challongeInput, tournament, participants, loading, submitting, loadError, attemptedLoad, banner,
  entityList, hasChanges, rowClass, loadTournament,
  toggleBooleanRule, setCountRule, computeTotal, resetChanges,
  submitOne, submitAllPoints, confirmMatch,
} = useTournamentScoring({
  rulesAppliesTo: 'PLAYER',
  rankingsApiBase: PLAYER_RANKINGS_API_BASE,
  entityListApiBase: PLAYERS_API_BASE,
  pointRulesApiBase: POINT_RULES_API_BASE,
  challongeApiBase: CHALLONGE_API_BASE,
})

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
    entityList.value.push(res.data)

    const target = addPlayerTarget.value
    addPlayerDialogVisible.value = false
    if (target) {
      target.matchKey = res.data.username
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
</script>

<style scoped>
.dashboard :deep(.dirty-row) {
  background-color: rgba(245, 158, 11, 0.12);
  box-shadow: inset 3px 0 0 0 var(--p-yellow-500, #f59e0b);
}
</style>