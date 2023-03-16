<script setup>
import { ref } from 'vue'

import { GameSessionStore } from '../stores/GameSessionStore'
import { MetaGameStore } from '../stores/MetaGameStore'

import PauseMenu from './PauseMenu.vue'
import GameStateBar from './GameStateBar.vue'
import IssueQueue from './Issues/IssueQueue.vue'
import InterRoundScreens from './InterRoundScreens.vue'
import GameOver from './GameOver/GameOver.vue'
import DevTools from './DevTools.vue'

const playerPausedGame = ref(false)

function showPauseScreen() {
  playerPausedGame.value = true
  GameSessionStore.gameIsPaused = true
}

function unpauseGame() {
  playerPausedGame.value = false
  GameSessionStore.gameIsPaused = false
}
</script>

<template>
  <div class="game-layout">
    <PauseMenu
      v-if="playerPausedGame"
      @unpause-game="unpauseGame()"
    ></PauseMenu>
    <div class="top-bar">
      <GameStateBar @pause-game="showPauseScreen()" />
    </div>
    <div class="play-area">
      <InterRoundScreens v-if="GameSessionStore.betweenRounds" />
      <GameOver v-else-if="GameSessionStore.showGameOver" />
      <IssueQueue v-else :isActive="!GameSessionStore.gameIsPaused" />
      <DevTools v-if="MetaGameStore.showDevTools" />
    </div>
  </div>
</template>

<style scoped>
.game-layout {
  display: flex;
  flex-direction: column;
  align-items: stretch;

  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  user-select: none;
}

.top-bar {
  position: relative;
  height: 12%;
  min-height: 75px;
  box-sizing: border-box;
  background-color: var(--stack-bg-color);
}

.play-area {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex-grow: 1;
  position: relative;
  background-color: var(--stack-bg-color);
}
</style>
