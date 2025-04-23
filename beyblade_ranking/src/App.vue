<script setup>
import { DataTable, Column, Dialog, Avatar, Panel, Divider, Message, InputText, Button, Toolbar, ToggleSwitch } from 'primevue'
import { FilterMatchMode } from '@primevue/core/api';
import {ref, onMounted} from 'vue'
import { Bladers } from './service/BladersService'

onMounted(() => {
  data.value = Bladers.getBladers()
})
const data = ref([])
const columns = [
  {field: 'name', header: 'Name'},
  {field: 'points', header: 'Points'},
]

const filters = ref({
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
});

const organizerMode = ref(false)
const apiKey = ref("")
const communityId = ref("wbbx")
const tournamentId = ref("")

function addParticipant(data){
  console.log(data)
}

const bladerPopup = ref(false)
const selectedBladerRef = ref()
function popupBlader(selectedBlader){
  selectedBladerRef.value = selectedBlader
  bladerPopup.value = true
}

</script>

<template>
  <h3 class="fadeIn">LGHS x Yomi Presents...</h3>
  <h1 class="fadeInDelay1Sec">The Peg's Best Bladers (Final name pending)</h1>
  <h3 class="fadeInDelay1Sec">Winnipeg's Competitive Beyblade X Rankings</h3>
  <div class="fadeInDelay2Sec">
    <div class="scrollDown bounce">
      <i class="pi pi-angle-down"></i>
      Click on a Blader To See More Info!
      <i class="pi pi-angle-down"></i>
    </div>

    <br>
    <div class="fadeInDelay2Sec" v-animateonscroll="{ enterClass: 'fadeIn', leaveClass: 'fadeOut'}">
      <Toolbar>
        <template #start>
          <InputText v-model="filters['name'].value" placeholder="Search for Blader" />
        </template>

        <template #center>
          <div v-show="organizerMode">
            <InputText placeholder="API Key"></InputText>
            <InputText placeholder="Community ID" v-model="communityId"></InputText>
            <InputText placeholder="Tournament URL"></InputText>
          </div>
        </template>
        <template #end>
          <p>Organizer Mode</p>
          <ToggleSwitch v-model="organizerMode" />
        </template>
      </Toolbar>
      <DataTable v-model:filters="filters" removableSort :value="data" sortField="points" :sortOrder="-1" selectionMode="single" v-model:selection="selectedBladerRef" stripedRows paginator :rows="10"
        @rowSelect="popupBlader">

        <Column v-for="col of columns" sortable :key="col.field" :field="col.field" :header="col.header"></Column>
        <Column>
          <template #header>
            <Button label="New Participant" v-show="organizerMode"></Button>
          </template>
          <template #body="{ data }" v-show="organizerMode">
            <Button label="Test add api" @click="addParticipant(data)" v-show="organizerMode"></Button>
          </template>
        </Column>
      </DataTable>
    </div>

    <p style="font-style: italic">Last updated April 8th, 2025 (With fake data)</p>
  </div>

  <Dialog v-model:visible="bladerPopup" style="min-width: 20vw;">
    <template #header>
      <div class="fadeIn">
        <Avatar :label="'#' + selectedBladerRef.data['Rank']" shape="circle"></Avatar> {{ selectedBladerRef.data["Name"] }}<span v-show="selectedBladerRef.data['Blader Name']">, "{{ selectedBladerRef.data['Blader Name'] }}"</span>
      </div>
    </template>
    <div class="fadeInDelay1Sec">
      <Panel header="Description:">
        <div v-if="selectedBladerRef.data['Description']">{{selectedBladerRef.data['Description']}}</div>
        <div v-if="!selectedBladerRef.data['Description']">[NO DATA AVAILABLE]</div>
      </Panel>
    </div>
    
    <div class="fadeInDelay2Sec">
      <Divider></Divider>

      <Message severity="success" icon="pi pi-trophy">
        Total Podiums: {{ selectedBladerRef.data['Total Wins'] }}
      </Message>
      <div class="bladerField">
        <i class="pi pi-angle-right"></i>
        First Place Finishes: {{ selectedBladerRef.data['First Place Finishes'] }}
      </div>
      <div class="bladerField">
        <i class="pi pi-angle-right"></i>
        Second Place Finishes: {{ selectedBladerRef.data['Second Place Finishes'] }}
      </div>
      <div class="bladerField">
        <i class="pi pi-angle-right"></i>
        Third Place Finishes: {{ selectedBladerRef.data['Third Place Finishes'] }}
      </div>
      <div class="bladerField">
        <i class="pi pi-angle-right"></i>
        Swiss Wins: {{ selectedBladerRef.data['Swiss Wins'] }}
      </div>

      <Divider></Divider>

      <Message v-if="selectedBladerRef.data['Signature Combo']" severity="warn" icon="pi pi-exclamation-triangle">
        Signature Combo: {{ selectedBladerRef.data['Signature Combo'] }}
      </Message>
      <Message v-if="!selectedBladerRef.data['Signature Combo']" severity="info" icon="pi pi-info">
        Signature Combo: [NO DATA AVAILABLE]
      </Message>
    </div>
    <template #footer>
      <Divider></Divider>
    </template>
  </Dialog>
</template>

<style scoped>
/* The animation code */
@keyframes bounce {
  0%   {top:0px;}
  50% {top:10px;}
  100%   {top:0px;}
}
@keyframes fadeIn {
  0% {opacity:0}
  100% {opacity:1}
}
@keyframes fadeOut {
  0% {opacity:1}
  100% {opacity:0}
}

/* The element to apply the animation to */
div .bounce {
  position: relative;
  animation-name: bounce;
  animation-duration: 1s;
  animation-iteration-count: infinite;
}
.fadeIn {
  animation-name: fadeIn;
  animation-duration: 1s;
}
.fadeOut {
  animation-name: fadeOut;
  animation-duration: 1s;
}
.fadeInDelay1Sec {
  animation-name: fadeIn;
  animation-duration: 1s;
  animation-fill-mode: both;
  animation-delay: 1s;
}
.fadeInDelay2Sec {
  animation-name: fadeIn;
  animation-duration: 1s;
  animation-fill-mode: both;
  animation-delay: 2s;
}
</style>
