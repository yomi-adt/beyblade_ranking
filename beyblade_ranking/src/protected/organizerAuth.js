import { ref } from 'vue'
import axios from 'axios'

const STORAGE_KEY = 'organizerApiKey'
const HEADER_NAME = 'X-Organizer-Key'

/** Reactive — components can watch this to show/hide the unlock prompt. */
export const isUnlocked = ref(!!sessionStorage.getItem(STORAGE_KEY))

export function getOrganizerKey() {
  return sessionStorage.getItem(STORAGE_KEY) || ''
}

/** Stores the key so requests can use it, without marking the app as unlocked yet. */
export function setOrganizerKey(key) {
  sessionStorage.setItem(STORAGE_KEY, key)
}

/** Call only after a request with this key has actually succeeded. */
export function markUnlocked() {
  isUnlocked.value = true
}

export function clearOrganizerKey() {
  sessionStorage.removeItem(STORAGE_KEY)
  isUnlocked.value = false
}

// Attaches the header to every outgoing request, and re-locks automatically
// if the backend ever rejects the stored key (e.g. it was rotated).
// Runs once, the first time this module is imported anywhere in the app.
axios.interceptors.request.use((config) => {
  const key = getOrganizerKey()
  if (key) config.headers[HEADER_NAME] = key
  return config
})

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearOrganizerKey()
    }
    return Promise.reject(error)
  }
)