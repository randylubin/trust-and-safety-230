<script setup>
import { MetaGameStore } from '../../stores/MetaGameStore'
import { GameSessionStore } from '../../stores/GameSessionStore'
import { IssueQueueStore } from '../../stores/IssueQueueStore'
import { onMounted } from 'vue'
import { event } from 'vue-gtag'

onMounted(() => {
  event('game_over', {
    round: GameSessionStore.currentRound,
    reason: GameSessionStore.gameOverReason,
  })
})

let restartGame = function () {
  IssueQueueStore.resetAllData()
  GameSessionStore.resetAllData()
  console.log('starting session')
  GameSessionStore.showGameOver = false
  GameSessionStore.showHomescreen = false
  MetaGameStore.activeSession = true
  GameSessionStore.startNewSession()
  // location.reload()
}

let returnToHomeScreen = function () {
  IssueQueueStore.resetAllData()
  GameSessionStore.resetAllData()
  GameSessionStore.showGameOver = false
  GameSessionStore.showHomescreen = true
}
</script>

<template>
  <div class="gameover-screen">
    <h1>Game Over</h1>
    <div
      v-for="(reason, key) in GameSessionStore.gameOverReason"
      v-bind:key="key"
    >
      {{ reason }}
    </div>
    <button @click="restartGame()">New Game</button>
    <button @click="returnToHomeScreen()">Back to Home Screen</button>
  </div>
</template>

<style scoped>
.gameover-screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;

  box-sizing: border-box;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;

  background: var(--modal-bg-color);
}
</style>
