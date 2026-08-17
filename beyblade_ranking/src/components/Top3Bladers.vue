<template>
  <div class="leaderboard-container">
    <h2 class="text-center mb-4">Top 3 Players</h2>

    <div class="top3-wrapper flex flex-column align-items-center gap-4 mb-5">
      <!-- Loading state: 3 skeleton cards -->
      <template v-if="loading">
        <Card v-for="n in 3" :key="n" class="player-card min-w-75 vh-25">
          <template #content>
            <div class="flex flex-column align-items-start gap-2">
              <Skeleton width="8rem" height="1.5rem" />
              <Skeleton width="5rem" height="1rem" />
            </div>
          </template>
        </Card>
      </template>

      <!-- Loaded state -->
      <template v-else>
        <Card
          v-for="player in players"
          :key="player.username"
          class="player-card min-w-75 border-left-custom vh-25"
          :class="
            { 
              'gold-colour': player.rank === 1,  
              'silver-colour': player.rank === 2, 
              'bronze-colour': player.rank === 3
            }"
        >
          <template #content>
            <div class="flex flex-column align-items-start">
              <h3>{{ player.username }}</h3>
              <p>{{ player.points }} points</p>
            </div>
          </template>
        </Card>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Skeleton, Card } from 'primevue';
import { Bladers } from '../service/BladersService';

import './styling/Top3Cards.css'

const loading = ref(true);
const data = ref([]);
const players = ref([]);

onMounted(async () => {
  try {
    const result = await Bladers.getBladers();
    data.value = Array.isArray(result) ? result : [];

    data.value.sort((a, b) => b.points - a.points);
    data.value.forEach((item, index) => {
      item.rank = index + 1;
    });

    // Only build podium if we actually have 3+ players
    if (data.value.length >= 3) {
      const [first, second, third] = data.value;
      players.value = [first, second, third];
    } else {
      players.value = data.value; // fallback: show what we have, in rank order
    }
  } catch (error) {
    console.error('Failed to load bladers:', error);
  } finally {
    loading.value = false;
  }
});
</script>