<script setup>
import { ref } from 'vue'

import { GameSessionStore } from '../stores/GameSessionStore'
import { MetaGameStore } from '../stores/MetaGameStore'
import { IssueQueueStore } from '../stores/IssueQueueStore'

import PauseMenu from './PauseMenu.vue'
import GameStateBar from './GameStateBar.vue'
import IssueQueue from './Issues/IssueQueue.vue'
import InterstitialScreen from './Issues/InterstitialScreen.vue'
import InterRoundScreens from './InterRoundScreens.vue'
import GameOver from './GameOver/GameOver.vue'
import DevTools from './Misc/DevTools.vue'

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
    <Transition name="overlay" mode="out-in">
      <PauseMenu
        v-if="playerPausedGame"
        @unpause-game="unpauseGame()"
      ></PauseMenu>
      <GameOver
        v-else-if="
          GameSessionStore.showGameOver && !IssueQueueStore.interstitialShown
        "
      />
      <InterstitialScreen v-else-if="IssueQueueStore.interstitialShown" />
      <InterRoundScreens
        v-else-if="
          GameSessionStore.betweenRounds && !GameSessionStore.showGameOver
        "
      />
    </Transition>
    <div class="top-bar">
      <GameStateBar @pause-game="showPauseScreen()" />
    </div>
    <GameOver
      v-if="GameSessionStore.showGameOver && !IssueQueueStore.interstitialShown"
    />
    <div class="play-area">
      <IssueQueue
        v-if="!GameSessionStore.betweenRounds && !GameSessionStore.showGameOver"
        :isActive="!GameSessionStore.gameIsPaused"
      />
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
