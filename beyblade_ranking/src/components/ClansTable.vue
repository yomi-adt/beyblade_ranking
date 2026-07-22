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
} from "primevue";
import { Bladers } from "../service/ClansService";
import { onMounted, ref } from "vue";
import { FilterMatchMode } from "@primevue/core/api";

onMounted(async () => {
  data.value = await Bladers.getBladers();
  data.value.sort((a, b) => b.points - a.points);
  for (let i = 1; i <= data.value.length; i++) {
    data.value[i - 1].rank = i.toString();
  }
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

const organizerMode = ref(false);
const apiKey = ref("");
const communityId = ref("wbbx");
const tournamentId = ref("");

const bladerPopup = ref(false);
const selectedBladerRef = ref();
function popupBlader(selectedBlader) {
  selectedBladerRef.value = selectedBlader;
  bladerPopup.value = true;
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
    <Column 
      header="Add to Challonge"
    >
      <template #body="slotProps">
        <Button
          icon="pi pi-copy"
          @click="copyToClipboard(slotProps.data)"
        />
      </template>
    </Column>
  </DataTable>

  <Dialog
    v-model:visible="bladerPopup"
    style="min-width: 20vw; max-width: 70vw"
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
    </div>
    <template #footer>
      <Divider></Divider>
    </template>
  </Dialog>
</template>

<style></style>
