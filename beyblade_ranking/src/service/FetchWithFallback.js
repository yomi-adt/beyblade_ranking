import { triggerToast } from "../ToastBus"; // Removed checkForCode import as it is handled internally

// Render's free tier doesn't error on a cold start — it just makes the
// request hang for ~20-30s while the instance spins back up. A plain
// try/catch around fetch() won't trigger a fallback in that case, since the
// request eventually succeeds, just slowly. This treats "too slow" the same
// as "errored" by aborting after timeoutMs and falling back either way.
const DEFAULT_TIMEOUT_MS = 2000

const TOAST_CODE = "Fallback Warning"

export async function fetchJsonWithFallback(url, fallbackData, { timeoutMs = DEFAULT_TIMEOUT_MS, label = url } = {}) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.warn(`[${label}] Live backend unreachable or too slow — using hardcoded fallback data.`, error)
    
    // The fourth argument passes the unique code tracking key string.
    // The internal toastBus architecture automatically blocks duplicate insertions.
    triggerToast('info', 'Server is waking up', 'You\'re looking at the latest snapshot. Try again in a few minutes!', TOAST_CODE)
    
    return fallbackData
  } finally {
    clearTimeout(timeoutId)
  }
}