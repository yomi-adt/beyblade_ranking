<script setup>
import { RouterView } from 'vue-router';
import { Button } from 'primevue';
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
      <RouterView />
    </div>

    <p style="font-style: italic">Last updated May 31st, 2025</p>
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
