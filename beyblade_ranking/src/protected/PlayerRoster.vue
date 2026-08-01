<template>
  <OrganizerGate>
  <div class="roster p-4">
    <div class="mb-4">
      <h1 class="text-2xl font-bold m-0">Manage Players</h1>
      <p class="text-color-secondary mt-1 mb-0">Edit blader details or remove a player entirely.</p>
    </div>

    <Card>
      <template #title>
        <Toolbar>
          <template #start>{{ entities.length }} Players</template>
          <template #end>
            <Button label="Add Player" icon="pi pi-user-plus" @click="openCreate" />
          </template>
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
                <InputText
                v-model="filters.username.value"
                placeholder="Search username..."
                />
            </span>
        </div>
        <DataTable
            :value="entities"
            :loading="loading"
            dataKey="username"
            paginator
            :rows="15"
            sortField="points"
            :sortOrder="-1"
            v-model:filters="filters"
            filterDisplay="row"
        >
          <Column
            field="username"
            header="Username"
            sortable
            :showFilterMenu="false"
          />
          <Column field="bladerName" header="Blader Name" sortable />
          <Column field="points" header="Points" sortable style="width: 8rem" />
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

    <PlayerFormDialog
      v-model:visible="formVisible"
      :mode="formMode"
      :initial-entity="editTarget"
      @saved="(entity) => upsertLocal('username', entity)"
    />

    <Dialog v-model:visible="deleteConfirmVisible" modal header="Delete player" :style="{ width: '26rem' }">
      <p class="m-0 mb-3">
        Delete <strong>{{ deleteTarget?.username }}</strong>? This can't be undone.
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

import Card from 'primevue/card'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Toolbar from 'primevue/toolbar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import OrganizerGate from './OrganizerGate.vue'
import PlayerFormDialog from './PlayerFormDialog.vue'
import { useEntityRoster } from './useEntityRoster'
import { PLAYERS_API_BASE } from './apiConfig'
import InputText from 'primevue/inputtext'
import { FilterMatchMode } from '@primevue/core/api'

const { entities, loading, error, fetchEntities, deleteEntity, upsertLocal } = useEntityRoster(PLAYERS_API_BASE)

const formVisible = ref(false)
const formMode = ref('create')
const editTarget = ref(null)

const filters = ref({
  username: {
    value: null,
    matchMode: FilterMatchMode.CONTAINS
  }
})

function openCreate() {
  formMode.value = 'create'
  editTarget.value = null
  formVisible.value = true
}

function openEdit(player) {
  formMode.value = 'edit'
  editTarget.value = player
  formVisible.value = true
}

const deleteConfirmVisible = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)
const deleteError = ref('')

function confirmDelete(player) {
  deleteTarget.value = player
  deleteError.value = ''
  deleteConfirmVisible.value = true
}

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await deleteEntity('username', deleteTarget.value.username)
    deleteConfirmVisible.value = false
  } catch (err) {
    deleteError.value = 'Could not delete this player. Try again.'
  } finally {
    deleting.value = false
  }
}
</script>