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
          Changing this renames the player. Existing point history stays under the old username.
        </small>
      </div>
      <div>
        <label for="playerBladerName" class="font-semibold block mb-1">Blader Name</label>
        <InputText id="playerBladerName" v-model="bladerName" class="w-full" placeholder="Optional" />
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
      <div>
        <label class="font-semibold block mb-1">Age Group</label>
        <SelectButton
          v-model="ageGroup"
          :options="ageGroupOptions"
          optionLabel="label"
          optionValue="value"
          :allowEmpty="false"
        />
        <small v-if="!props.initialEntity?.ageGroup && mode === 'edit'" class="text-color-secondary d-block mt-1">
          Not set yet — pick one and save to classify this player.
        </small>
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
import SelectButton from 'primevue/selectbutton'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { PLAYERS_API_BASE } from './apiConfig'

const props = defineProps({
  visible: { type: Boolean, required: true },
  mode: { type: String, default: 'create' }, // 'create' | 'edit'
  initialEntity: { type: Object, default: null }, // required for mode: 'edit'
  suggestedUsername: { type: String, default: '' }, // prefill for mode: 'create'
  suggestedAgeGroup: { type: String, default: null }, // prefill for mode: 'create' — e.g. the scoring page's active league
})

const emit = defineEmits(['update:visible', 'saved'])

const username = ref('')
const bladerName = ref('')
const lore = ref('')
const signatureCombo = ref('')
const points = ref(0)
const ageGroup = ref('ADULT') // null = not yet classified — no default guess between ADULT/KID
const saving = ref(false)
const error = ref('')

const ageGroupOptions = [
  { label: 'Adult', value: 'ADULT' },
  { label: 'Kid', value: 'KID' },
]

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
      ageGroup.value = props.initialEntity.ageGroup || null
    } else {
      username.value = props.suggestedUsername || ''
      bladerName.value = ''
      lore.value = ''
      signatureCombo.value = ''
      points.value = 0
      ageGroup.value = props.suggestedAgeGroup || 'ADULT'
    }
  }
)

async function save() {
  const trimmedUsername = username.value.trim()
  if (!trimmedUsername) return
  if (!ageGroup.value) {
    error.value = 'Pick an age group (Adult or Kid) before saving.'
    return
  }

  saving.value = true
  error.value = ''
  const payload = {
    username: trimmedUsername,
    bladerName: bladerName.value.trim() || null,
    lore: lore.value.trim() || null,
    signatureCombo: signatureCombo.value.trim() || null,
    points: points.value || 0,
    ageGroup: ageGroup.value,
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