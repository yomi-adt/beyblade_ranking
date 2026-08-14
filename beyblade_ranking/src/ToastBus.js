import { ref } from 'vue';

// 1. Maintains the processing queue for App.vue
export const toastQueue = ref([]);

// 2. Tracks which error codes are actively visible on the user's screen
const activeToastCodes = new Set();

export function triggerToast(severity, summary, detail, code = null) {
  // Check if this error code is currently active on-screen
  if (code && checkForCode(code)) {
    console.warn(`[ToastBus] Notification with code "${code}" is currently active on screen. Skipping duplicate.`);
    return;
  }

  // Register the code as active so immediate parallel API calls are blocked
  if (code) {
    activeToastCodes.add(code);
  }

  const toastLife = 4000; // 4 seconds display time

  toastQueue.value.push({ 
    code,
    severity, 
    summary, 
    detail, 
    life: toastLife 
  });

  // Automatically remove the code from our blocklist only AFTER the toast disappears
  if (code) {
    setTimeout(() => {
      activeToastCodes.delete(code);
    }, toastLife + 500); // 4000ms display life + 500ms fadeout animation window
  }
}

/**
 * Checks if a specific error code is currently blocked from showing again.
 * @param {string|number} code - The unique error code to search for
 * @returns {boolean} True if the code is currently displayed
 */
export function checkForCode(code) {
  // Check the active registry first, then fallback to checking the backlogged queue
  return activeToastCodes.has(code) || toastQueue.value.some(item => item.code === code);
}