<script setup>
import { DataTable, Column, Button } from 'primevue'
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
  {field: 'moniker', header: 'Moniker'},
  {field: 'elo', header: 'Elo'},
  {field: 'totalWins', header: 'Total Podiums'},
]
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
      <DataTable :value="data">
        <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header"></Column>
      </DataTable>
    </div>
  </div>
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
