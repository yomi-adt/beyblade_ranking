<script setup>
import {
  DataTable,
  Column,
  Dialog,
  Avatar,
  Panel,
  Divider,
  Message,
  InputText,
  Button,
  Toolbar,
  ToggleSwitch,
  Tag,
} from "primevue";
import { Bladers } from "../service/ClansService";
import { onMounted, ref } from "vue";
import { FilterMatchMode } from "@primevue/core/api";

const props = defineProps({
  editableClan: 
  {
    type: Boolean,
    default: false
  }
});

const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  data.value = await Bladers.getBladers();
  data.value.sort((a, b) => b.points - a.points);
  for (let i = 1; i <= data.value.length; i++) {
    data.value[i - 1].rank = i.toString();
  }
  loading.value = false;
});

const data = ref([]);
const columns = [
  { field: "rank", header: "Rank" },
  { field: "name", header: "Name" },
  { field: "points", header: "Points" },
];

const filters = ref({
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
});

async function copyToClipboard(data) {
  const challongeName = data.username + " (#" + data.id + ")" 
  await navigator.clipboard.writeText(challongeName)

  console.log('Copied ' + challongeName + ' to clipboard!')
}

const currAudit = ref([])
const auditsLoading = ref(false)

const organizerMode = ref(false);
const apiKey = ref("");
const communityId = ref("wbbx");
const tournamentId = ref("");

const bladerPopup = ref(false);
const selectedBladerRef = ref();

const showAudits = ref(false);

async function popupBlader(selectedBlader) {
  selectedBladerRef.value = selectedBlader;
  bladerPopup.value = true;

  auditsLoading.value = true;
  currAudit.value = await Bladers.getAudits(selectedBlader.data.tag);
  auditsLoading.value = false;
}
</script>

<template>
  <h3>Clans</h3>
  <Toolbar>
    <template #start>
      <InputText
        v-model="filters['name'].value"
        placeholder="Search for Blader"
      />
    </template>
  </Toolbar>
  <DataTable
    v-model:filters="filters"
    removableSort
    :value="data"
    :loading="loading"
    sortField="rank"
    :sortOrder="1"
    selectionMode="single"
    v-model:selection="selectedBladerRef"
    stripedRows
    paginator
    :rows="10"
    @rowSelect="popupBlader"
  >
    <Column
      v-for="col of columns"
      sortable
      :key="col.field"
      :field="col.field"
      :header="col.header"
    ></Column>
  </DataTable>

  <Dialog
    v-model:visible="bladerPopup"
    style="min-width: 20vw; max-width: 70vw"
    @hide="() => {showAudits = false}"
  >
    <template #header>
      <div class="fadeIn">
        <Avatar
          :label="'#' + selectedBladerRef.data['rank']"
          shape="circle"
        ></Avatar>
        {{ selectedBladerRef.data["username"]
        }}<span v-show="selectedBladerRef.data['bladerName']"
          >, "{{ selectedBladerRef.data["bladerName"] }}"</span
        >
      </div>
    </template>
    <div class="fadeInDelay1Sec">
      <Panel header="Description:">
        <div v-if="selectedBladerRef.data['lore']">
          {{ selectedBladerRef.data["lore"] }}
        </div>
        <div v-if="!selectedBladerRef.data['lore']">[NO DATA AVAILABLE]</div>
      </Panel>
    </div>

    <div class="fadeInDelay2Sec">
      <Divider></Divider>

      <Message severity="success" icon="pi pi-trophy">
        Total Podiums: {{ selectedBladerRef.data["Total Wins"] }}
      </Message>
      <div class="bladerField">
        <i class="pi pi-angle-right"></i>
        First Place Finishes:
        {{ selectedBladerRef.data["First Place Finishes"] }}
      </div>
      <div class="bladerField">
        <i class="pi pi-angle-right"></i>
        Second Place Finishes:
        {{ selectedBladerRef.data["Second Place Finishes"] }}
      </div>
      <div class="bladerField">
        <i class="pi pi-angle-right"></i>
        Third Place Finishes:
        {{ selectedBladerRef.data["Third Place Finishes"] }}
      </div>
      <div class="bladerField">
        <i class="pi pi-angle-right"></i>
        Swiss Wins: {{ selectedBladerRef.data["Swiss Wins"] }}
      </div>

      <Divider></Divider>

      <Message
        v-if="selectedBladerRef.data['signatureCombo']"
        severity="warn"
        icon="pi pi-exclamation-triangle"
      >
        signatureCombo Combo: {{ selectedBladerRef.data["signatureCombo"] }}
      </Message>
      <Message
        v-if="!selectedBladerRef.data['signatureCombo']"
        severity="info"
        icon="pi pi-info"
      >
        signatureCombo Combo: [NO DATA AVAILABLE]
      </Message>

      <Divider></Divider>
      <Button v-on:click="() => {showAudits = !showAudits}">{{showAudits ? "Hide" : "Show"}} Audit</Button>
      <div v-show="showAudits">
        <Divider></Divider>

        <div v-if="auditsLoading" class="text-color-secondary py-3">
          <i class="pi pi-spin pi-spinner mr-2"></i>Loading history…
        </div>

        <div v-else-if="!currAudit.length" class="text-color-secondary py-3 text-center">
          No recorded point history.
        </div>

        <div v-else class="flex flex-column gap-3">
          <div
            v-for="(audit, idx) in currAudit"
            :key="idx"
            class="border-1 surface-border border-round p-3"
          >
            <div class="flex justify-content-between align-items-start mb-2">
              <div>
                <div class="font-semibold">{{ audit.tournamentName || 'Untitled tournament' }}</div>
                <div class="text-sm text-color-secondary">
                  {{ audit.totalPoints >= 0 ? 'Awarded' : 'Reversal' }}
                </div>
              </div>
              <Tag
                :value="`${audit.totalPoints >= 0 ? '+' : ''}${audit.totalPoints} pts`"
                :severity="audit.totalPoints >= 0 ? 'success' : 'danger'"
              />
            </div>

            <div v-if="audit.appliedRules?.length" class="flex flex-wrap gap-2">
              <Tag
                v-for="(rule, ruleIdx) in audit.appliedRules"
                :key="ruleIdx"
                :value="`${rule.label} × ${rule.count} (${rule.points} ea)`"
                severity="secondary"
              />
            </div>
          </div>
        </div>

        <Divider></Divider>
      </div>

    </div>
    <template #footer>
        <Button
            label="Close"
            severity="danger"
            @click="bladerPopup = false"
        />
    </template>
  </Dialog>
</template>

<style></style>