<script setup>
import { DataTable, Column, Button } from 'primevue'
</script>

<template>
  <h1 class="fadeIn">Yomi's BBX Rankings</h1>
  <h3 class="fadeInDelay1Sec">Winnipeg's Competitive Beyblade X Rankings</h3>
  <div class="scrollDown bounce">
    <i class="pi pi-angle-down"></i>
    Scroll Down
    <i class="pi pi-angle-down"></i>
  </div>
  <br>
  <DataTable></DataTable>
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
</style>
