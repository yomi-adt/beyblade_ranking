<template>
  <div class="leaderboard-container">
    <h2 class="text-center mb-4">Top 3 Players</h2>

    <div class="top3-wrapper flex justify-content-center align-items-end gap-4 mb-5">
      <Card
        v-for="player in players"
        :key="player.name"
        class="player-card"
        :class="{ 'top-player': player.rank === 1 }"
      >
        <template #content>
          <div class="flex flex-column align-items-center">
            <h3>{{ player.rank }}: {{player.name}}</h3>
            <p class="text-secondary">{{ player.points }} points</p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {Card, Button} from "primevue";
import { Bladers } from "../service/BladersService";

let players = ref([]);
let data = ref([]);

onMounted(() => {
  data.value = Bladers.getBladers();

  // Sort by points descending
  data.value.sort((a, b) => b.points - a.points);

  // Assign ranks
  data.value.forEach((item, index) => {
    item.rank = (index + 1);
  });

  // Put rank 1 in the middle
  const first = data.value[0];   // rank 1
  const second = data.value[1];  // rank 2
  const third = data.value[2];   // rank 3

  players.value = [second, first, third];
});
</script>

<style scoped>
.leaderboard-container {
  border-radius: 16px;
  padding: 2rem;
  color: #fff;
}

.player-card.p-card h3 {
  display: block;
  max-width: 100%;
  overflow-x: auto;
  white-space: nowrap;
}

.player-card.p-card {
  display: flex !important;
  flex-direction: column;

  /* Responsive width */
  flex: 0 1 auto !important;
  min-width: 140px !important;
  max-width: 200px !important;
  width: clamp(140px, 20vw, 200px) !important;

  /* Proportional height */
  aspect-ratio: 4 / 4; /* adjust to taste */

  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.top-player {
  transform: translateY(-1em);
  background: rgba(255, 255, 255, 0.1);
}

.desc-scroll {
  height: 60px;      /* adjust to your card size */
  overflow-y: auto;      /* vertical scroll */
  overflow-x: hidden;    /* no horizontal scroll */
  white-space: normal;   /* allow wrapping */
  text-align: center;    /* optional: center text */
  padding: 4px 0;
}
</style>
