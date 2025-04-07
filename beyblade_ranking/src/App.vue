<script setup>
import { DataTable, Column, Dialog } from 'primevue'
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
    <div class="bladerField">
      Name: {{ selectedBladerRef.data.name }}
    </div>
    <div class="bladerField">
      Blader Name: {{ selectedBladerRef.data.bladerName }}
    </div>
    <div class="bladerField">
      Description: {{ selectedBladerRef.data.desc }}
    </div>
    <div class="bladerField">
      First Place Finishes: {{ selectedBladerRef.data.firstFinishes }}
    </div>
    <div class="bladerField">
      Second Place Finishes: {{ selectedBladerRef.data.secondFinishes }}
    </div>
    <div class="bladerField">
      Third Place Finishes: {{ selectedBladerRef.data.thirdFinishes }}
    </div>
    <div class="bladerField">
      Total Podiums: {{ selectedBladerRef.data.totalWins }}
    </div>
    <div class="bladerField">
      Signature Combo: {{ selectedBladerRef.data.sigCombo }}
    </div>
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
