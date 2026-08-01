<template>
  <Dialog
    :visible="visible"
    @update:visible="(v) => $emit('update:visible', v)"
    modal
    :header="mode === 'edit' ? 'Edit Clan' : 'Add New Clan'"
    :style="{ width: '26rem' }"
  >
    <div class="flex flex-column gap-3">
      <div>
        <label for="clanTag" class="font-semibold block mb-1">Tag</label>
        <InputText id="clanTag" v-model="tag" class="w-full" placeholder="Unique clan tag" :disabled="mode === 'edit'" />
        <small v-if="mode === 'edit'" class="text-color-secondary">Tag can't be changed after creation.</small>
      </div>
      <div>
        <label for="clanName" class="font-semibold block mb-1">Clan Name</label>
        <InputText id="clanName" v-model="name" class="w-full" placeholder="Optional" />
      </div>
      <div>
        <label for="clanPoints" class="font-semibold block mb-1">Points</label>
        <InputNumber id="clanPoints" v-model="points" class="w-full" :min="0" />
      </div>
      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
    </div>
    <template #footer>
      <Button label="Cancel" severity="secondary" text @click="$emit('update:visible', false)" />
      <Button
        :label="mode === 'edit' ? 'Save Changes' : 'Create'"
        :icon="mode === 'edit' ? 'pi pi-check' : 'pi pi-plus-circle'"
        :loading="saving"
        :disabled="!tag.trim()"
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
import Button from 'primevue/button'
import Message from 'primevue/message'
import { CLANS_API_BASE } from './apiConfig'

const props = defineProps({
  visible: { type: Boolean, required: true },
  mode: { type: String, default: 'create' }, // 'create' | 'edit'
  initialEntity: { type: Object, default: null }, // required for mode: 'edit'
  suggestedTag: { type: String, default: '' }, // prefill for mode: 'create'
})

const emit = defineEmits(['update:visible', 'saved'])

const tag = ref('')
const name = ref('')
const points = ref(0)
const saving = ref(false)
const error = ref('')

watch(
  () => props.visible,
  (isVisible) => {
    if (!isVisible) return
    error.value = ''
    if (props.mode === 'edit' && props.initialEntity) {
      tag.value = props.initialEntity.tag || ''
      name.value = props.initialEntity.name || ''
      points.value = props.initialEntity.points || 0
    } else {
      tag.value = props.suggestedTag || ''
      name.value = ''
      points.value = 0
    }
  }
)

async function save() {
  const trimmedTag = tag.value.trim()
  if (!trimmedTag) return

  saving.value = true
  error.value = ''
  const payload = {
    tag: trimmedTag,
    name: name.value.trim() || null,
    points: points.value || 0,
  }

  try {
    const res =
      props.mode === 'edit'
        ? await axios.put(`${CLANS_API_BASE}/${encodeURIComponent(trimmedTag)}`, payload)
        : await axios.post(CLANS_API_BASE, payload)
    emit('saved', res.data)
    emit('update:visible', false)
  } catch (err) {
    error.value =
      err.response?.status === 409 || err.response?.status === 400
        ? 'A clan with that tag already exists.'
        : `Could not ${props.mode === 'edit' ? 'save' : 'create'} the clan. Try again.`
  } finally {
    saving.value = false
  }
}
</script>