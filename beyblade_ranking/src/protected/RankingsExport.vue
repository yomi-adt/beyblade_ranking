<template>
  <OrganizerGate>
  <div class="rankings-export p-4">
    <div class="mb-4">
      <h1 class="text-2xl font-bold m-0">Export Rankings</h1>
      <p class="text-color-secondary mt-1 mb-0">Copy the current rankings as JSON.</p>
    </div>

    <div class="flex flex-column gap-4">
      <Card>
        <template #title>
          <Toolbar>
            <template #start>Players ({{ players.length }})</template>
            <template #end>
              <Button
                :label="playersCopied ? 'Copied!' : 'Copy Players JSON'"
                :icon="playersCopied ? 'pi pi-check' : 'pi pi-copy'"
                :severity="playersCopied ? 'success' : 'primary'"
                :loading="playersLoading"
                :disabled="!players.length"
                @click="copyPlayers"
              />
            </template>
          </Toolbar>
        </template>
        <template #content>
          <Message v-if="playersError" severity="error" :closable="false" class="mb-3">{{ playersError }}</Message>
          <Textarea :modelValue="playersJson" readonly rows="10" class="w-full font-mono text-sm" />
        </template>
      </Card>

      <Card>
        <template #title>
          <Toolbar>
            <template #start>Clans ({{ clans.length }})</template>
            <template #end>
              <Button
                :label="clansCopied ? 'Copied!' : 'Copy Clans JSON'"
                :icon="clansCopied ? 'pi pi-check' : 'pi pi-copy'"
                :severity="clansCopied ? 'success' : 'primary'"
                :loading="clansLoading"
                :disabled="!clans.length"
                @click="copyClans"
              />
            </template>
          </Toolbar>
        </template>
        <template #content>
          <Message v-if="clansError" severity="error" :closable="false" class="mb-3">{{ clansError }}</Message>
          <Textarea :modelValue="clansJson" readonly rows="10" class="w-full font-mono text-sm" />
        </template>
      </Card>
    </div>
  </div>
  </OrganizerGate>
</template>

<script setup>
import { ref, computed } from 'vue'

import Card from 'primevue/card'
import Button from 'primevue/button'
import Toolbar from 'primevue/toolbar'
import Message from 'primevue/message'
import Textarea from 'primevue/textarea'
import { useEntityRoster } from './useEntityRoster'
import { PLAYERS_API_BASE, CLANS_API_BASE } from './apiConfig'
import OrganizerGate from './OrganizerGate.vue'

// Both current leaderboards are already public GET endpoints (same data
// BladerTable/ClansTable show) — this page is just a JSON export view on
// top of them, so it isn't gated behind OrganizerGate.

const { entities: players, loading: playersLoading, error: playersError } = useEntityRoster(PLAYERS_API_BASE)
const { entities: clans, loading: clansLoading, error: clansError } = useEntityRoster(CLANS_API_BASE)

const playersJson = computed(() => JSON.stringify(players.value, null, 2))
const clansJson = computed(() => JSON.stringify(clans.value, null, 2))

const playersCopied = ref(false)
const clansCopied = ref(false)

async function copyToClipboard(text, copiedFlag) {
  try {
    await navigator.clipboard.writeText(text)
    copiedFlag.value = true
    setTimeout(() => { copiedFlag.value = false }, 2000)
  } catch (err) {
    // Clipboard API can fail (permissions, non-secure context, etc.) —
    // the JSON is already visible in the textarea above as a fallback,
    // so the user can select-and-copy manually if this happens.
  }
}

function copyPlayers() {
  copyToClipboard(playersJson.value, playersCopied)
}

function copyClans() {
  copyToClipboard(clansJson.value, clansCopied)
}
</script>