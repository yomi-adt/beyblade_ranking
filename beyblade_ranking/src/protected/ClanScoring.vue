<template>
  <OrganizerGate>
  <div class="dashboard p-4">
    <div class="mb-4">
      <h1 class="text-2xl font-bold m-0">Clan Scoring</h1>
      <p class="text-color-secondary mt-1 mb-0">
        Define point rules, load a Challonge bracket, and tag each clan's results.
        Participant names are expected in the form <code>[TAG] Player/Team</code>.
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
            :placeholder="rule.type === 'COUNT' ? 'e.g. Points per member win' : 'e.g. Clan swept the bracket?'"
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
          <Column header="Participant" style="width: 16rem">
            <template #body="{ data }">
              <div>{{ data.name }}</div>
              <Tag v-if="extractedTag(data.name)" :value="extractedTag(data.name)" severity="secondary" class="mt-1" />
            </template>
          </Column>
          <Column :header="`Achievements (${multiplier}× multiplier applied)`">
            <template #body="{ data }">
              <div class="flex flex-wrap align-items-center gap-3">
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
                    inputStyle="width: 2.5rem; text-align: center;"
                  >
                    <template #incrementbuttonicon>
                        <span class="pi pi-plus" />
                    </template>
                    <template #decrementbuttonicon>
                        <span class="pi pi-minus" />
                    </template>
                  </InputNumber>
                </div>
              </div>
            </template>
          </Column>
          <Column header="Total Points" style="width: 7rem" bodyStyle="text-align: center; justify-content: center;" headerStyle="text-align: center; justify-content: center;">
            <template #body="{ data }">
              <span class="font-semibold">{{ computeTotal(data) }}</span>
            </template>
          </Column>
          <Column header="Status" style="width: 18rem">
            <template #body="{ data }">
              <div v-if="data.saveState === 'needs-match'" class="flex align-items-center gap-2">
                <Select
                  v-model="data.matchKey"
                  :options="entityList"
                  optionLabel="tag"
                  optionValue="tag"
                  filter
                  placeholder="Select clan…"
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
                  icon="pi pi-plus-circle"
                  size="small"
                  severity="secondary"
                  outlined
                  @click="openAddClanDialog(data)"
                  aria-label="Add new clan"
                  title="No matching clan? Add one."
                />
              </div>
              <div v-else-if="data.saveState === 'malformed'" class="flex align-items-center gap-2">
                <Tag value="Bad format" severity="danger" />
                <span class="text-color-secondary text-sm">Expected "[TAG] Player/Team"</span>
              </div>
              <Tag v-else-if="data.saveState === 'success'" value="Saved" severity="success" />
              <Tag v-else-if="data.saveState === 'error'" value="Failed" severity="danger" />
              <Tag v-else-if="data.dirty" value="Unsaved" severity="warn" />
              <Tag v-else value="—" severity="secondary" />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <div v-else-if="!loading && attemptedLoad" class="text-center text-color-secondary py-6">
      No participants found for that tournament.
    </div>

    <Dialog v-model:visible="addClanDialogVisible" modal header="Add New Clan" :style="{ width: '26rem' }">
      <div class="flex flex-column gap-3">
        <div>
          <label for="newClanTag" class="font-semibold block mb-1">Tag</label>
          <InputText id="newClanTag" v-model="newClanTag" class="w-full" placeholder="Unique clan tag" />
        </div>
        <div>
          <label for="newClanName" class="font-semibold block mb-1">Clan Name</label>
          <InputText id="newClanName" v-model="newClanName" class="w-full" placeholder="Optional" />
        </div>
        <Message v-if="addClanError" severity="error" :closable="false">{{ addClanError }}</Message>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="addClanDialogVisible = false" />
        <Button
          label="Create &amp; Match"
          icon="pi pi-plus-circle"
          :loading="addingClan"
          :disabled="!newClanTag.trim()"
          @click="createAndMatchClan"
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
import { CLAN_RANKINGS_API_BASE, CHALLONGE_API_BASE, CLANS_API_BASE, POINT_RULES_API_BASE } from './apiConfig'
import { useTournamentScoring } from './useTournamentScoring'

const {
  ruleTypeOptions, pointRules, rulesLoading, rulesError, multiplier, booleanRules, countRules,
  fetchPointRules, markRuleDirty, addRule, saveRule, removeRule,
  challongeInput, tournament, participants, loading, submitting, loadError, attemptedLoad, banner,
  entityList, hasChanges, rowClass, loadTournament,
  toggleBooleanRule, setCountRule, computeTotal, resetChanges,
  submitOne, submitAllPoints, confirmMatch,
} = useTournamentScoring({
  rulesAppliesTo: 'CLAN',
  rankingsApiBase: CLAN_RANKINGS_API_BASE,
  entityListApiBase: CLANS_API_BASE,
  pointRulesApiBase: POINT_RULES_API_BASE,
  challongeApiBase: CHALLONGE_API_BASE,
})

// Mirrors the backend's [TAG] extraction, purely for display — the actual
// resolution/validation always happens server-side in ClanRankingServiceImpl.
const TAG_PATTERN = /^\[([^[\]]+)]\s*.*$/
function extractedTag(participantName) {
  const match = TAG_PATTERN.exec((participantName || '').trim())
  return match ? match[1].trim() : null
}

// "Add Clan" dialog — for when a Challonge participant's tag genuinely has no
// existing Clan yet. Creates the Clan, then immediately resubmits the
// pending point award against it.
const addClanDialogVisible = ref(false)
const addClanTarget = ref(null)
const newClanTag = ref('')
const newClanName = ref('')
const addingClan = ref(false)
const addClanError = ref('')

function openAddClanDialog(participant) {
  addClanTarget.value = participant
  newClanTag.value = extractedTag(participant.name) || ''
  newClanName.value = ''
  addClanError.value = ''
  addClanDialogVisible.value = true
}

async function createAndMatchClan() {
  const tag = newClanTag.value.trim()
  if (!tag) return

  addingClan.value = true
  addClanError.value = ''
  try {
    const res = await axios.post(CLANS_API_BASE, {
      tag,
      name: newClanName.value.trim() || null,
      points: 0,
    })
    entityList.value.push(res.data)

    const target = addClanTarget.value
    addClanDialogVisible.value = false
    if (target) {
      target.matchKey = res.data.tag
      submitting.value = true
      await submitOne(target)
      submitting.value = false
    }
  } catch (err) {
    addClanError.value =
      err.response?.status === 409 || err.response?.status === 400
        ? 'A clan with that tag already exists.'
        : 'Could not create the clan. Try again.'
  } finally {
    addingClan.value = false
  }
}
</script>

<style scoped>
.dashboard :deep(.dirty-row) {
  background-color: rgba(245, 158, 11, 0.12);
  box-shadow: inset 3px 0 0 0 var(--p-yellow-500, #f59e0b);
}
</style>