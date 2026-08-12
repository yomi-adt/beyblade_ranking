<template>
  <OrganizerGate>
  <div class="roster p-4">
    <div class="mb-4">
      <h1 class="text-2xl font-bold m-0">Pre-Registrations</h1>
      <p class="text-color-secondary mt-1 mb-0">
        Registrations submitted via the Discord bot. Edit details or remove one.
      </p>
    </div>

    <Card>
      <template #title>
        <Toolbar>
          <template #start>{{ entities.length }} Registrations</template>
        </Toolbar>
      </template>
      <template #content>
        <div v-if="error" class="flex align-items-center gap-2 mb-3">
          <Message severity="error" :closable="false" class="flex-1">{{ error }}</Message>
          <Button label="Retry" icon="pi pi-refresh" severity="secondary" outlined @click="fetchEntities" />
        </div>

        <div class="flex justify-content-end mb-3">
          <span class="p-input-icon-left">
            <i class="pi pi-search mx-2" />
            <InputText v-model="filters.name.value" placeholder="Search name..." />
          </span>
        </div>

        <DataTable
          :value="entities"
          :loading="loading"
          dataKey="id"
          paginator
          :rows="15"
          sortField="createdAt"
          :sortOrder="-1"
          v-model:filters="filters"
          filterDisplay="row"
        >
          <Column field="name" header="Name" sortable :showFilterMenu="false" />
          <Column field="eta" header="ETA" />
          <Column header="Combos">
            <template #body="{ data }">
              <div class="flex flex-wrap gap-1">
                <Tag v-for="(combo, idx) in data.beybladeCombos" :key="idx" :value="combo" severity="secondary" />
              </div>
            </template>
          </Column>
          <Column field="paymentType" header="Payment" style="width: 9rem" />
          <Column header="Registered" style="width: 11rem">
            <template #body="{ data }">
              {{ data.createdAt ? new Date(data.createdAt).toLocaleString() : '—' }}
            </template>
          </Column>
          <Column header="" style="width: 8rem">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button icon="pi pi-pencil" text severity="secondary" @click="openEdit(data)" aria-label="Edit" />
                <Button icon="pi pi-trash" text severity="danger" @click="confirmDelete(data)" aria-label="Delete" />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <PreRegistrationFormDialog
      v-model:visible="formVisible"
      :initial-entity="editTarget"
      @saved="(entity) => upsertLocal('id', entity)"
    />

    <Dialog v-model:visible="deleteConfirmVisible" modal header="Delete registration" :style="{ width: '26rem' }">
      <p class="m-0 mb-3">
        Delete the registration for <strong>{{ deleteTarget?.name }}</strong>? This can't be undone.
      </p>
      <Message v-if="deleteError" severity="error" :closable="false" class="mb-3">{{ deleteError }}</Message>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="deleteConfirmVisible = false" />
        <Button label="Delete" severity="danger" :loading="deleting" @click="doDelete" />
      </template>
    </Dialog>
  </div>
  </OrganizerGate>
</template>

<script setup>
import { ref } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'

import Card from 'primevue/card'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Toolbar from 'primevue/toolbar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import OrganizerGate from './OrganizerGate.vue'
import PreRegistrationFormDialog from './PreRegistrationFormDialog.vue'
import { useEntityRoster } from './useEntityRoster'
import { PRE_REGISTRATIONS_API_BASE } from './apiConfig'

const { entities, loading, error, fetchEntities, deleteEntity, upsertLocal } = useEntityRoster(PRE_REGISTRATIONS_API_BASE)

const filters = ref({
  name: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const formVisible = ref(false)
const editTarget = ref(null)

function openEdit(registration) {
  editTarget.value = registration
  formVisible.value = true
}

const deleteConfirmVisible = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)
const deleteError = ref('')

function confirmDelete(registration) {
  deleteTarget.value = registration
  deleteError.value = ''
  deleteConfirmVisible.value = true
}

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await deleteEntity('id', deleteTarget.value.id)
    deleteConfirmVisible.value = false
  } catch (err) {
    deleteError.value = 'Could not delete this registration. Try again.'
  } finally {
    deleting.value = false
  }
}
</script>