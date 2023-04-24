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

const gameOverDescriptions = {
  'GOOD-QUALITYPROMO': {
    fullDescription: 'Promoted for competence, congrats!',
    socialShare: 'Promoted for competence, congrats!',
  },
  'GOOD-SENIORITYPROMO': {
    fullDescription: 'Promoted for seniority, congrats!',
    socialShare: 'Promoted for seniority, congrats!',
  },
  'BAD-FINALROUNDPERFORMANCE': {
    fullDescription: 'Fired for poor performance at end of game',
    socialShare: 'Fired for poor performance at end of game',
  },
  'BAD-EARLYPERFORMANCE': {
    fullDescription: 'Fired for poor performance',
    socialShare: 'Fired for poor performance',
  },
  'BAD-TOOSLOW': {
    fullDescription: 'Too slow!',
    socialShare: 'Too slow!',
  },
  'BAD-CENSORSHIP': {
    fullDescription: 'Censorship accusations',
    socialShare: 'Censorship accusations',
  },
  'BAD-SAFETY': {
    fullDescription: 'Platform safety',
    socialShare: 'Platform safety',
  },
  'BAD-ARC': {
    fullDescription: 'TK arc reason',
    socialShare: 'TK arc reason',
  },

}

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
      {{ gameOverDescriptions[GameSessionStore.gameOverType].fullDescription }}
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
