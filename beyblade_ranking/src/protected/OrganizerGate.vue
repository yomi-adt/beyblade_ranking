<template>
  <div v-if="!isUnlocked" class="organizer-gate flex align-items-center justify-content-center" style="min-height: 60vh;">
    <Card style="width: 24rem;">
      <template #title>Organizer Access</template>
      <template #content>
        <p class="text-color-secondary mt-0">Enter the organizer key to continue.</p>
        <Password
          v-model="keyInput"
          :feedback="false"
          toggleMask
          class="w-full mb-3"
          inputClass="w-full"
          @keyup.enter="attemptUnlock"
        />
        <Message v-if="error" severity="error" :closable="false" class="mb-3">{{ error }}</Message>
        <Button label="Unlock" class="w-full" :loading="checking" @click="attemptUnlock" />
      </template>
    </Card>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import Card from 'primevue/card'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { isUnlocked, setOrganizerKey, markUnlocked, clearOrganizerKey } from '../service/OrganizerAuth'

// Verifying the key requires an actual request — there's nothing to check
// client-side, so this hits a lightweight organizer-only endpoint and
// unlocks only if the backend accepts it.
const VERIFY_URL = '/api/point-rules'

const keyInput = ref('')
const checking = ref(false)
const error = ref('')

async function attemptUnlock() {
  if (!keyInput.value.trim()) return
  checking.value = true
  error.value = ''
  setOrganizerKey(keyInput.value.trim()) // stored so the interceptor attaches it to the verify call below
  try {
    await axios.get(VERIFY_URL)
    markUnlocked() // only now does the gate actually open
  } catch (err) {
    clearOrganizerKey()
    error.value = err.response?.status === 401 ? 'Incorrect key.' : 'Could not verify key. Try again.'
  } finally {
    checking.value = false
  }
}
</script>