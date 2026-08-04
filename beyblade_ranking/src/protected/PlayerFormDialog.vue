<template>
  <Dialog
    :visible="visible"
    @update:visible="(v) => $emit('update:visible', v)"
    modal
    :header="mode === 'edit' ? 'Edit Player' : 'Add New Player'"
    :style="{ width: '28rem' }"
  >
    <div class="flex flex-column gap-3">
      <div>
        <label for="playerUsername" class="font-semibold block mb-1">Username</label>
        <InputText
          id="playerUsername"
          v-model="username"
          class="w-full"
          placeholder="Unique login/id"
        />
        <small v-if="mode === 'edit'" class="text-color-secondary">
          This is the main name of the player, and what is used when searching
        </small>
      </div>
      <div>
        <label for="playerBladerName" class="font-semibold block mb-1">Blader Name</label>
        <InputText id="playerBladerName" v-model="bladerName" class="w-full" placeholder="Optional" />
        <small v-if="mode === 'edit'" class="text-color-secondary">
          This is the player's moniker or alt name. It's for display. For example: CJ "HellsSuboh",
          where "HellsSuboh" is the blader name
        </small>
      </div>
      <div>
        <label for="playerLore" class="font-semibold block mb-1">Lore</label>
        <Textarea id="playerLore" v-model="lore" class="w-full" rows="3" placeholder="Optional" autoResize />
      </div>
      <div>
        <label for="playerSignatureCombo" class="font-semibold block mb-1">Signature Combo</label>
        <InputText id="playerSignatureCombo" v-model="signatureCombo" class="w-full" placeholder="Optional" />
      </div>
      <div>
        <label for="playerPoints" class="font-semibold block mb-1">Points</label>
        <InputNumber id="playerPoints" v-model="points" class="w-full" :min="0" />
      </div>
      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
    </div>
    <template #footer>
      <Button label="Cancel" severity="secondary" text @click="$emit('update:visible', false)" />
      <Button
        :label="mode === 'edit' ? 'Save Changes' : 'Create'"
        :icon="mode === 'edit' ? 'pi pi-check' : 'pi pi-user-plus'"
        :loading="saving"
        :disabled="!username.trim()"
        @click="save"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'

import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { PLAYERS_API_BASE } from './apiConfig'

const props = defineProps({
  visible: { type: Boolean, required: true },
  mode: { type: String, default: 'create' }, // 'create' | 'edit'
  initialEntity: { type: Object, default: null }, // required for mode: 'edit'
  suggestedUsername: { type: String, default: '' }, // prefill for mode: 'create'
})

const emit = defineEmits(['update:visible', 'saved'])

const username = ref('')
const bladerName = ref('')
const lore = ref('')
const signatureCombo = ref('')
const points = ref(0)
const saving = ref(false)
const error = ref('')

// Reset the form fresh every time the dialog opens, rather than once on
// mount — this component gets reused for many different players/creations
// over the app's lifetime, not just instantiated once.
watch(
  () => props.visible,
  (isVisible) => {
    if (!isVisible) return
    error.value = ''
    if (props.mode === 'edit' && props.initialEntity) {
      username.value = props.initialEntity.username || ''
      bladerName.value = props.initialEntity.bladerName || ''
      lore.value = props.initialEntity.lore || ''
      signatureCombo.value = props.initialEntity.signatureCombo || ''
      points.value = props.initialEntity.points || 0
    } else {
      username.value = props.suggestedUsername || ''
      bladerName.value = ''
      lore.value = ''
      signatureCombo.value = ''
      points.value = 0
    }
  }
)

async function save() {
  const trimmedUsername = username.value.trim()
  if (!trimmedUsername) return

  saving.value = true
  error.value = ''
  const payload = {
    username: trimmedUsername,
    bladerName: bladerName.value.trim() || null,
    lore: lore.value.trim() || null,
    signatureCombo: signatureCombo.value.trim() || null,
    points: points.value || 0,
  }

  try {
    const res =
      props.mode === 'edit'
        ? await axios.put(`${PLAYERS_API_BASE}/${encodeURIComponent(props.initialEntity.username)}`, payload)
        : await axios.post(PLAYERS_API_BASE, payload)
    emit('saved', res.data)
    emit('update:visible', false)
  } catch (err) {
    error.value =
      err.response?.status === 409 || err.response?.status === 400
        ? 'A player with that username already exists.'
        : `Could not ${props.mode === 'edit' ? 'save' : 'create'} the player. Try again.`
  } finally {
    saving.value = false
  }
}
</script>