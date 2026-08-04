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

        <div class="flex align-items-start gap-6 flex-wrap">
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

          <div
            class="flex flex-column align-items-center text-center gap-2"
            style="max-width: 20rem;"
          >
            <label class="font-semibold flex align-items-center gap-2 cursor-pointer">
              <Checkbox v-model="multiClanMode" binary inputId="multiClanMode" />
              <span>Split across clans</span>
            </label>

            <small class="text-color-secondary">
              For splitting across clans (such as a duo tournament with partners from different clans). 
              <a
                href="https://youtu.be/OiQnc6Ic4KA"
                target="_blank"
                rel="noopener noreferrer"
              >
                Tutorial here.
              </a>
            </small>
          </div>
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
              @click="resetChangesClanAware"
              class="mr-2"
            />
            <Button
              label="Update All Scores"
              icon="pi pi-check"
              :loading="submitting"
              :disabled="!hasChanges"
              @click="submitAllPointsClanAware"
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

          <Column v-if="multiClanMode" header="Split Between Clans" style="width: 18rem">
            <template #body="{ data }">
              <MultiSelect
                v-model="data.manualEntities"
                :options="entityList"
                optionLabel="tag"
                optionValue="tag"
                filter
                placeholder="Auto (from tag)"
                display="chip"
                class="w-full"
                :disabled="submitting"
                @update:modelValue="() => onManualEntitiesChange(data)"
              />
              <div v-if="data.manualEntities?.length >= 2" class="flex flex-column gap-1 mt-2">
                <div v-for="tag in data.manualEntities" :key="tag" class="flex align-items-center gap-2">
                  <span class="text-sm w-4rem">{{ tag }}</span>
                  <InputNumber
                    :modelValue="data.manualQuantities?.[tag] || 1"
                    @update:modelValue="(v) => setManualQuantity(data, tag, v)"
                    :min="1"
                    showButtons
                    buttonLayout="horizontal"
                    class="w-7rem"
                    inputStyle="width: 2.5rem; text-align: center;"
                    :disabled="submitting"
                  />
                </div>
                <small class="text-color-secondary">Quantity = members from that clan on this team</small>
              </div>
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
          <Column header="Total Points" style="width: 9rem" bodyStyle="text-align: center; justify-content: center;" headerStyle="text-align: center; justify-content: center;">
            <template #body="{ data }">
              <span class="font-semibold">{{ computeTotal(data) }}</span>
              <div v-if="data.manualEntities?.length >= 2" class="text-xs text-color-secondary">
                <div v-for="share in computeSplitShares(data)" :key="share.tag">
                  {{ share.tag }}: {{ share.share }} ({{ share.quantity }}/{{ share.totalQuantity }})
                </div>
              </div>
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

    <ClanFormDialog 
      v-model:visible="addClanDialogVisible"
      mode="create"
      :suggested-tag="extractedTag(addClanTarget?.name)"
      @saved="onClanCreated"
    />
  </div>
  </OrganizerGate>
</template>

<script setup>
import { ref, watch } from 'vue'
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
import Checkbox from 'primevue/checkbox'
import MultiSelect from 'primevue/multiselect'
import OrganizerGate from './OrganizerGate.vue'
import { CLAN_RANKINGS_API_BASE, CHALLONGE_API_BASE, CLANS_API_BASE, POINT_RULES_API_BASE } from './apiConfig'
import { useTournamentScoring } from './useTournamentScoring'
import ClanFormDialog from './ClanFormDialog.vue'

const {
  ruleTypeOptions, pointRules, rulesLoading, rulesError, multiplier, booleanRules, countRules,
  fetchPointRules, markRuleDirty, addRule, saveRule, removeRule,
  challongeInput, tournament, participants, loading, submitting, loadError, attemptedLoad, banner,
  entityList, ensureEntityListLoaded, hasChanges, rowClass, loadTournament,
  toggleBooleanRule, setCountRule, computeTotal, resetChanges,
  buildPayload, submitOne, confirmMatch,
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

// ---------- Duo/trio split mode ----------
// Off by default: normal solo tournaments keep using the standard single-clan
// auto-match/needs-match flow untouched. Turning this on adds a per-row
// manual clan picker (data.manualEntities) for rows where the participant is
// actually a team spanning multiple clans — the single [TAG] extraction can
// only ever find one tag, so those rows need an explicit override.
const multiClanMode = ref(false)

watch(multiClanMode, (enabled) => {
  if (enabled) ensureEntityListLoaded() // populate the clan list up front for the picker, instead of waiting for a needs-match
})

function markDirtyFromSplitChange(p) {
  p.dirty = true
  if (p.saveState !== 'needs-match' && p.saveState !== 'malformed') p.saveState = null
}

/** Keeps manualQuantities in sync with the MultiSelect: newly-picked clans default to 1, deselected ones are dropped. */
function onManualEntitiesChange(p) {
  if (!p.manualQuantities) p.manualQuantities = {}
  const selected = new Set(p.manualEntities || [])
  Object.keys(p.manualQuantities).forEach((tag) => {
    if (!selected.has(tag)) delete p.manualQuantities[tag]
  })
  selected.forEach((tag) => {
    if (!(tag in p.manualQuantities)) p.manualQuantities[tag] = 1
  })
  markDirtyFromSplitChange(p)
}

function setManualQuantity(p, tag, value) {
  if (!p.manualQuantities) p.manualQuantities = {}
  p.manualQuantities[tag] = Math.max(1, Number(value) || 1)
  markDirtyFromSplitChange(p)
}

function resetChangesClanAware() {
  participants.value.forEach((p) => {
    p.manualEntities = []
    p.manualQuantities = {}
  })
  resetChanges()
}

/**
 * Proportional split by clan headcount (not just an even split per clan) —
 * e.g. 2 members from C1 + 1 from C2 gives C1 two-thirds of the row's points.
 * Used by BOTH the on-screen preview and the actual submission below, so
 * they can never show one number and submit a different one.
 */
function computeSplitShares(p) {
  const tags = p.manualEntities || []
  if (tags.length < 2) return []

  const quantities = tags.map((tag) => p.manualQuantities?.[tag] || 1)
  const totalQuantity = quantities.reduce((sum, q) => sum + q, 0)
  const fullTotal = computeTotal(p)

  return tags.map((tag, i) => {
    const quantity = quantities[i]
    // Proportional share, floored per clan. Any leftover from flooring is
    // dropped, not reallocated to anyone. CHANGE HERE for a different
    // rounding/remainder policy (e.g. Math.round, or give the remainder to
    // the clan with the largest quantity).
    const share = totalQuantity > 0 ? Math.floor((fullTotal * quantity) / totalQuantity) : 0
    return { tag, quantity, totalQuantity, share }
  })
}

/**
 * Submits one row split proportionally across its manually-selected clans.
 * Only called for rows with 2+ entries in manualEntities — a single manual
 * selection is treated as a normal one-target submission (see below).
 */
async function submitSplitAcrossClans(p) {
  const shares = computeSplitShares(p)

  let anyFailure = false
  for (const { tag, quantity, totalQuantity, share } of shares) {
    try {
      const payload = buildPayload(p, tag)
      payload.totalPoints = share
      payload.tournamentName = `${payload.tournamentName} (${quantity}/${totalQuantity} share)`
      await axios.post(`${CLAN_RANKINGS_API_BASE}/points`, payload)
    } catch (err) {
      anyFailure = true
    }
  }

  if (anyFailure) {
    p.saveState = 'error'
    return 'error'
  }
  p.originalRuleValues = { ...p.ruleValues }
  p.dirty = false
  p.saveState = 'success'
  return 'success'
}

async function submitAllPointsClanAware() {
  const changed = participants.value.filter((p) => p.dirty)
  if (!changed.length) return

  submitting.value = true
  banner.value = { message: '', type: 'success' }
  let failures = 0
  let needsMatch = 0
  let malformed = 0

  for (const p of changed) {
    const manualCount = multiClanMode.value ? (p.manualEntities?.length || 0) : 0

    let result
    if (manualCount >= 2) {
      result = await submitSplitAcrossClans(p)
    } else if (manualCount === 1) {
      // Exactly one manual clan picked — same as any normal single-target
      // submission, just bypassing [TAG] auto-match with an explicit choice.
      p.matchKey = p.manualEntities[0]
      result = await submitOne(p)
    } else {
      result = await submitOne(p)
    }

    if (result === 'error') failures += 1
    if (result === 'needs-match') needsMatch += 1
    if (result === 'malformed') malformed += 1
  }

  submitting.value = false

  if (malformed) {
    banner.value = {
      message: `${malformed} participant name(s) didn't match the expected format — see the Status column.`,
      type: 'error',
    }
  } else if (needsMatch) {
    banner.value = {
      message: `${needsMatch} participant name(s) didn't match an existing clan — pick or add one in the Status column, then confirm.`,
      type: 'error',
    }
  } else if (failures) {
    banner.value = { message: `${failures} point update(s) failed. Adjust and try again.`, type: 'error' }
  } else {
    banner.value = { message: 'All points submitted.', type: 'success' }
  }
}

// "Add Clan" dialog — for when a Challonge participant's tag genuinely has no
// existing Clan yet. Creates the Clan, then immediately resubmits the
// pending point award against it.
const addClanDialogVisible = ref(false)
const addClanTarget = ref(null)

function openAddClanDialog(participant) {
  addClanTarget.value = participant
  addClanDialogVisible.value = true
}

async function onClanCreated(newClan) {
  entityList.value.push(newClan)
  const target = addClanTarget.value
  if (target) {
    target.matchKey = newClan.tag
    submitting.value = true
    await submitOne(target)
    submitting.value = false
  }
}
</script>

<style scoped>
.dashboard :deep(.dirty-row) {
  background-color: rgba(245, 158, 11, 0.12);
  box-shadow: inset 3px 0 0 0 var(--p-yellow-500, #f59e0b);
}
</style>