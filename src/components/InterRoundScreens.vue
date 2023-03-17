<script setup>
import { GameSessionStore } from '../stores/GameSessionStore'
import { IssueQueueStore } from '../stores/IssueQueueStore'

const startNewRound = function () {
  console.log('new round')
  GameSessionStore.currentRound++
  GameSessionStore.timeRemaining = 100 // TODO
  IssueQueueStore.startNewRound()
}
</script>

<template>
  <div class="round-screen">
    <div class="round-text">Round {{ GameSessionStore.currentRound + 1 }}</div>
    <button class="btn-basic" @click="startNewRound()">Next Round</button>
  </div>
</template>

<style scoped>
.round-screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;

  box-sizing: border-box;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;

  background: var(--controls-bg-color);
}

.round-text {
  font-size: 2.8rem;
  font-weight: 400;
  margin-bottom: 2rem;
}
</style>
