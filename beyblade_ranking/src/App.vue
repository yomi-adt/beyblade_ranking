<script setup>
import { DataTable, Column, Dialog, Avatar, Panel, Divider, Message } from 'primevue'
import {ref, onMounted} from 'vue'
import { Bladers } from './service/BladersService'

onMounted(() => {
  data.value = Bladers.getBladers()
  for(let i=0; i<data.value.length; i++){
    let blader = data.value[i]
    blader.totalWins = blader.firstFinishes+blader.secondFinishes+blader.firstFinishes
  }
})
const data = ref([])
const columns = [
  {field: 'name', header: 'Name'},
  {field: 'bladerName', header: 'Blader Name'},
  {field: 'elo', header: 'Elo'},
  {field: 'totalWins', header: 'Total Podiums'},
]

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
    (Pro Tip: Click on one of the rows in the table below)
    <div class="scrollDown bounce">
      <i class="pi pi-angle-down"></i>
      Scroll Down
      <i class="pi pi-angle-down"></i>
    </div>

    <br>
    <div v-animateonscroll="{ enterClass: 'fadeIn', leaveClass: 'fadeOut'}">
      <DataTable removableSort selectionMode="single" v-model:selection="selectedBladerRef" :value="data" stripedRows sortField="elo" :sortOrder="-1"
        @rowSelect="popupBlader">
        <Column v-for="col of columns" sortable :key="col.field" :field="col.field" :header="col.header"></Column>
      </DataTable>
    </div>
  </div>

  <Dialog v-model:visible="bladerPopup">
    <template #header>
      <div class="fadeIn">
        <Avatar icon="pi pi-user" shape="circle"></Avatar> {{ selectedBladerRef.data.name }}, "{{ selectedBladerRef.data.bladerName }}"
      </div>
    </template>

    <div class="fadeInDelay1Sec">
      <Panel header="Description:">
        {{ selectedBladerRef.data.desc }}
      </Panel>
    </div>
    
    <div class="fadeInDelay2Sec">
      <Divider></Divider>

      <Message severity="success" icon="pi pi-trophy">
        Total Podiums: {{ selectedBladerRef.data.totalWins }}
      </Message>
      <div class="bladerField">
        <i class="pi pi-angle-right"></i>
        First Place Finishes: {{ selectedBladerRef.data.firstFinishes }}
      </div>
      <div class="bladerField">
        <i class="pi pi-angle-right"></i>
        Second Place Finishes: {{ selectedBladerRef.data.secondFinishes }}
      </div>
      <div class="bladerField">
        <i class="pi pi-angle-right"></i>
        Third Place Finishes: {{ selectedBladerRef.data.thirdFinishes }}
      </div>

      <Divider></Divider>

      <Message severity="warn" icon="pi pi-exclamation-triangle">
        Signature Combo: {{ selectedBladerRef.data.sigCombo }}
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
