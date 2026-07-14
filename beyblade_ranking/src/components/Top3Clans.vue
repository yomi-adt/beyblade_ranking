<template>
  <div class="leaderboard-container">
    <h2 class="text-center mb-4">Top 3 Players</h2>

    <div class="top3-wrapper flex justify-content-center align-items-end gap-4 mb-5">
      <!-- Loading state: 3 skeleton cards -->
      <template v-if="loading">
        <Card v-for="n in 3" :key="n" class="player-card">
          <template #content>
            <div class="flex flex-column align-items-center gap-2">
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
          class="player-card"
          :class="{ 'top-player': player.rank === 1 }"
        >
          <template #content>
            <div class="flex flex-column align-items-center">
              <h3>{{ player.rank }}: {{ player.username }}</h3>
              <p class="text-secondary">{{ player.points }} points</p>
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
import { Bladers } from '../service/ClansService';

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
      players.value = [second, first, third];
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