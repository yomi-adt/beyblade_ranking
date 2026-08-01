import { ref, onMounted } from 'vue'
import axios from 'axios'

/**
 * Shared logic for "list every entity, edit or delete one." Used by both
 * PlayerRoster and ClanRoster — the only difference between them is which
 * API base to hit and which field is the key (username vs tag), both
 * supplied by the caller.
 */
export function useEntityRoster(apiBase) {
  const entities = ref([])
  const loading = ref(false)
  const error = ref('')

  async function fetchEntities() {
    loading.value = true
    error.value = ''
    try {
      const res = await axios.get(apiBase)
      entities.value = res.data || []
    } catch (err) {
      error.value = 'Could not load the list.'
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchEntities)

  async function deleteEntity(keyField, keyValue) {
    await axios.delete(`${apiBase}/${encodeURIComponent(keyValue)}`)
    entities.value = entities.value.filter((e) => e[keyField] !== keyValue)
  }

  /** Adds a newly-created entity, or replaces an edited one in place — avoids a full refetch after either. */
  function upsertLocal(keyField, entity) {
    const idx = entities.value.findIndex((e) => e[keyField] === entity[keyField])
    if (idx === -1) entities.value.push(entity)
    else entities.value.splice(idx, 1, entity)
  }

  return { entities, loading, error, fetchEntities, deleteEntity, upsertLocal }
}