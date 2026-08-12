<template>
  <Dialog
    :visible="visible"
    @update:visible="(v) => $emit('update:visible', v)"
    modal
    header="Edit Pre-Registration"
    :style="{ width: '30rem' }"
  >
    <div class="flex flex-column gap-3">
      <div>
        <label for="regName" class="font-semibold block mb-1">Name</label>
        <InputText id="regName" v-model="name" class="w-full" />
      </div>
      <div>
        <label for="regEta" class="font-semibold block mb-1">ETA</label>
        <InputText id="regEta" v-model="eta" class="w-full" placeholder="e.g. 2pm, tomorrow morning" />
      </div>
      <div>
        <label for="regCombos" class="font-semibold block mb-1">Beyblade Combos</label>
        <InputChips id="regCombos" v-model="beybladeCombos" class="w-full" placeholder="Type a combo, press Enter" />
      </div>
      <div>
        <label for="regPayment" class="font-semibold block mb-1">Payment Type</label>
        <InputText id="regPayment" v-model="paymentType" class="w-full" placeholder="e.g. cash, venmo" />
      </div>
      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
    </div>
    <template #footer>
      <Button label="Cancel" severity="secondary" text @click="$emit('update:visible', false)" />
      <Button label="Save Changes" icon="pi pi-check" :loading="saving" :disabled="!name.trim()" @click="save" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'

import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputChips from 'primevue/inputchips'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { PRE_REGISTRATIONS_API_BASE } from './apiConfig'

const props = defineProps({
  visible: { type: Boolean, required: true },
  initialEntity: { type: Object, default: null },
})

const emit = defineEmits(['update:visible', 'saved'])

const name = ref('')
const eta = ref('')
const beybladeCombos = ref([])
const paymentType = ref('')
const saving = ref(false)
const error = ref('')

watch(
  () => props.visible,
  (isVisible) => {
    if (!isVisible || !props.initialEntity) return
    error.value = ''
    name.value = props.initialEntity.name || ''
    eta.value = props.initialEntity.eta || ''
    beybladeCombos.value = [...(props.initialEntity.beybladeCombos || [])]
    paymentType.value = props.initialEntity.paymentType || ''
  }
)

async function save() {
  if (!name.value.trim() || !props.initialEntity) return

  saving.value = true
  error.value = ''
  try {
    const res = await axios.put(`${PRE_REGISTRATIONS_API_BASE}/${encodeURIComponent(props.initialEntity.id)}`, {
      name: name.value.trim(),
      eta: eta.value.trim() || null,
      beybladeCombos: beybladeCombos.value,
      paymentType: paymentType.value.trim() || null,
    })
    emit('saved', res.data)
    emit('update:visible', false)
  } catch (err) {
    error.value = 'Could not save this registration. Try again.'
  } finally {
    saving.value = false
  }
}
</script>