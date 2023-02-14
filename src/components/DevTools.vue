<script setup>
import { GameSessionStore } from '../stores/GameSessionStore'
</script>

<template>
  <div class="dev-tools">
    <h1>Dev Tools</h1>
    <button @click="GameSessionStore.timesUp(true)">Set Timer to Zero</button>
    <div>Current Round: {{ GameSessionStore.currentRound }}</div>
    <div>Time remaining: {{ GameSessionStore.timeRemaining }}</div>
    <div>Speed: {{ GameSessionStore.moderationSpeed }}</div>
    <div>Quality: {{ GameSessionStore.moderationQuality }}</div>
    <div>Perception: {{ GameSessionStore.publicPerception }}</div>
  </div>
</template>

<style scoped>
.dev-tools {
  border: 1px darkgrey solid;
  margin-top: 1rem;
}
</style>
