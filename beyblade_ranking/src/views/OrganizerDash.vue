<script setup>
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import OrganizerGate from '../protected/OrganizerGate.vue';

const router = useRouter()
</script>

<template>
  <OrganizerGate>
  <div class="card-container">
    <Card>
      <template #title>
        Update Player Scores
      </template>

      <template #subtitle>
        Following a ranked tournamenet, update the rankings.
        <a href="https://youtu.be/HTjzFEeaPKQ" target="_blank" rel="noopener noreferrer">
            Tutorial here
        </a>
      </template>

      <template #footer>
        <Button
          label="Players"
          class="m-1"
          icon="pi pi-users"
          @click="router.push('/update-player-scores')"
        />
        <Button
          label="Clans"
          class="m-1"
          icon="pi pi-shield"
          @click="router.push('/update-clan-scores')"
        />
      </template>
    </Card>

    <Card>
      <template #title>
        Reset Scores
      </template>

      <template #subtitle>
        Reset both player and clan leaderboards here.
      </template>

      <template #footer>
        <Button
          label="Reset Scores"
          icon="pi pi-undo"
          @click="router.push('/reset-scores')"
        />
      </template>
    </Card>

    <Card>
      <template #title>
        Edit Participants
      </template>

      <template #subtitle>
        Change participant's (player/clan) name, lore, etc.

        <a href="https://youtu.be/H_QnjLS-avY" target="_blank" rel="noopener noreferrer">
            Tutorial here
        </a>
      </template>

      <template #footer>
        <Button
          class="m-1"
          label="Edit players"
          icon="pi pi-users"
          @click="router.push('/manage-players')"
        />
        <Button
          class="m-1"
          label="Edit Clans"
          icon="pi pi-shield"
          @click="router.push('/manage-clans')"
        />
      </template>
    </Card>

    <Card>
      <template #title>
        View Point History
      </template>

      <template #subtitle>
        See the points you added and undo any mistakes.

        <a href="https://youtu.be/nLlNIN4s0Nk" target="_blank" rel="noopener noreferrer">
            Tutorial here
        </a>
      </template>

      <template #footer>
        <Button
          class="m-1"
          label="Player Points"
          icon="pi pi-users"
          @click="router.push('/player-history')"
        />
        <Button
          class="m-1"
          label="Clan Points"
          icon="pi pi-shield"
          @click="router.push('/clan-history')"
        />
      </template>
    </Card>

    <Card>
      <template #title>
        Grab Leaderboard Snapshot
      </template>

      <template #subtitle>
        Grab Leaderboard snapshots to act as a fallback when backend is down.

        <a href="https://google.com" target="_blank" rel="noopener noreferrer">
            Tutorial here
        </a>
      </template>

      <template #footer>
        <Button
          class="m-1"
          label="Copy to Clipboard"
          icon="pi pi-trophy"
          @click="router.push('/ranking-snapshot')"
        />
      </template>
    </Card>
  </div>
  </OrganizerGate>
</template>

<style scoped>
.card-container {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.p-card {
  width: 22rem;
}
</style>