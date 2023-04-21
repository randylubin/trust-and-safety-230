<script setup>
// import { GameSessionStore } from "../../stores/GameSessionStore";
import { GameSessionStore } from '../../stores/GameSessionStore'
import AchievementsList from '../Misc/AchievementsList.vue'
import { onMounted } from 'vue'
import { event } from 'vue-gtag'

onMounted(() => {
  event('game_over', {
    round: GameSessionStore.currentRound,
    reason: GameSessionStore.gameOverReason,
  })
})
</script>

<template>
  <h1>Game Over</h1>
  <div
    v-for="(reason, key) in GameSessionStore.gameOverReason"
    v-bind:key="key"
  >
    {{ reason }}
  </div>
  <button @click="GameSessionStore.showGameOver = false">New Game</button>

  <h2 v-if="GameSessionStore.achievementsUnlockedThisGame.length">
    New Achievements
  </h2>
  <div
    v-for="(achievement, key) in GameSessionStore.achievementsUnlockedThisGame"
    v-bind:key="key"
  >
    {{ achievement }}
  </div>
  <AchievementsList></AchievementsList>
</template>

<style scoped></style>
