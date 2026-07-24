import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

/**
 * Shared logic for "define point rules, load a Challonge bracket, tag each
 * participant's achievements, submit points." Used by both the Player and
 * Clan scoring pages — the only differences between them are which endpoints
 * to hit and how a participant name resolves to an entity key, both handled
 * entirely on the backend (PlayerRankingService vs ClanRankingService).
 *
 * @param {object} opts
 * @param {string} opts.rulesAppliesTo    'PLAYER' | 'CLAN' — filters GET /api/point-rules
 * @param {string} opts.rankingsApiBase   e.g. PLAYER_RANKINGS_API_BASE or CLAN_RANKINGS_API_BASE
 * @param {string} opts.entityListApiBase e.g. PLAYERS_API_BASE or CLANS_API_BASE — for the match picker
 * @param {string} opts.pointRulesApiBase POINT_RULES_API_BASE
 * @param {string} opts.challongeApiBase  CHALLONGE_API_BASE
 */
export function useTournamentScoring(opts) {
  const { rulesAppliesTo, rankingsApiBase, entityListApiBase, pointRulesApiBase, challongeApiBase } = opts

  const ruleTypeOptions = [
    { label: 'Yes/No', value: 'BOOLEAN' },
    { label: 'Count ×', value: 'COUNT' },
  ]

  // ---------- Point rules ----------

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
      const res = await axios.get(pointRulesApiBase, { params: { appliesTo: rulesAppliesTo } })
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
    // Local-only row so there's always an input to type into, even if the
    // backend is unreachable or would reject a blank label. Only persisted
    // (POST) when the admin saves it with real content.
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
      const payload = { label: rule.label, points: rule.points, type: rule.type, appliesTo: rulesAppliesTo }
      if (rule.isNew) {
        const res = await axios.post(pointRulesApiBase, payload)
        rule.id = res.data.id
        rule.isNew = false
      } else {
        const res = await axios.put(`${pointRulesApiBase}/${rule.id}`, payload)
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
      pointRules.value = pointRules.value.filter((r) => r.id !== rule.id)
      return
    }
    try {
      await axios.delete(`${pointRulesApiBase}/${rule.id}`)
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

  // ---------- Challonge tournament + participants ----------

  const challongeInput = ref('')
  const tournament = ref(null)
  const participants = ref([])
  const loading = ref(false)
  const submitting = ref(false)
  const loadError = ref('')
  const attemptedLoad = ref(false)
  const banner = ref({ message: '', type: 'success' })

  // Entity list (players or clans) for the match picker — fetched lazily,
  // once, the first time a participant name fails to resolve.
  const entityList = ref([])
  let entityListLoadPromise = null
  async function ensureEntityListLoaded() {
    if (entityList.value.length) return
    if (!entityListLoadPromise) {
      entityListLoadPromise = axios
        .get(entityListApiBase)
        .then((res) => { entityList.value = res.data || [] })
        .catch(() => { entityList.value = [] })
    }
    await entityListLoadPromise
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
      const res = await axios.get(`${challongeApiBase}/tournaments/${encodeURIComponent(slug)}`)
      tournament.value = res.data.tournament
      participants.value = (res.data.participants || []).map((p) => ({
        id: p.id,
        seed: p.seed,
        name: p.name,
        // Keyed by rule id. BOOLEAN rules store true/false; COUNT rules store a number.
        ruleValues: {},
        originalRuleValues: {},
        dirty: false,
        saveState: null, // null | 'success' | 'error' | 'needs-match' | 'malformed'
        matchKey: null, // set once the admin resolves a name mismatch
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

  // ---------- Tagging achievements ----------

  function toggleBooleanRule(participant, ruleId) {
    participant.ruleValues = { ...participant.ruleValues, [ruleId]: !participant.ruleValues[ruleId] }
    markDirty(participant)
  }

  function setCountRule(participant, ruleId, value) {
    participant.ruleValues = { ...participant.ruleValues, [ruleId]: Number(value) || 0 }
    markDirty(participant)
  }

  function markDirty(p) {
    const same = JSON.stringify(p.ruleValues) === JSON.stringify(p.originalRuleValues)
    p.dirty = !same
    if (p.saveState !== 'needs-match' && p.saveState !== 'malformed') p.saveState = null
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
      p.matchKey = null
    })
    banner.value = { message: '', type: 'success' }
  }

  // ---------- Submitting ----------

  function buildPayload(p, explicitKey) {
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
      entityKey: explicitKey || null,
      appliedRules,
      multiplier: multiplier.value,
      totalPoints: computeTotal(p),
    }
  }

  async function submitOne(p) {
    try {
      await axios.post(`${rankingsApiBase}/points`, buildPayload(p, p.matchKey))
      p.originalRuleValues = { ...p.ruleValues }
      p.dirty = false
      p.saveState = 'success'
      return 'success'
    } catch (err) {
      const code = err.response?.data?.code
      if (err.response?.status === 409 || code === 'ENTITY_NOT_FOUND') {
        p.saveState = 'needs-match'
        await ensureEntityListLoaded()
        return 'needs-match'
      }
      if (err.response?.status === 422 || code === 'MALFORMED_NAME') {
        // Distinct from needs-match: the participant name didn't even parse
        // (e.g. missing the "[TAG] " prefix for clans) — no point showing a
        // picker, since there's nothing to search for.
        p.saveState = 'malformed'
        return 'malformed'
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
    let malformed = 0

    for (const p of changed) {
      const result = await submitOne(p)
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
        message: `${needsMatch} participant name(s) didn't match an existing entry — pick or add one in the Status column, then confirm.`,
        type: 'error',
      }
    } else if (failures) {
      banner.value = { message: `${failures} point update(s) failed. Adjust and try again.`, type: 'error' }
    } else {
      banner.value = { message: 'All points submitted.', type: 'success' }
    }
  }

  /** Resubmits a single participant once the admin has picked/created a matching entity. */
  async function confirmMatch(p) {
    if (!p.matchKey) return
    submitting.value = true
    await submitOne(p)
    submitting.value = false
  }

  return {
    ruleTypeOptions,
    pointRules, rulesLoading, rulesError, multiplier, booleanRules, countRules,
    fetchPointRules, markRuleDirty, addRule, saveRule, removeRule,
    challongeInput, tournament, participants, loading, submitting, loadError, attemptedLoad, banner,
    entityList, ensureEntityListLoaded,
    hasChanges, rowClass, loadTournament,
    toggleBooleanRule, setCountRule, computeTotal, resetChanges,
    submitOne, submitAllPoints, confirmMatch,
  }
}