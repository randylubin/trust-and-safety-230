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
    <GameOver
      v-if="GameSessionStore.showGameOver && !IssueQueueStore.interstitialShown"
    />
    <Transition appear name="overlay" mode="out-in">
      <PauseMenu
        v-if="playerPausedGame"
        @unpause-game="unpauseGame()"
      ></PauseMenu>
      <InterstitialScreen v-else-if="IssueQueueStore.interstitialShown" />
      <InterRoundScreens
        v-else-if="
          GameSessionStore.betweenRounds && !GameSessionStore.showGameOver
        "
      />
    </Transition>
    <Transition appear name="overlay">
      <div
        class="top-bar"
        v-if="!GameSessionStore.betweenRounds && !GameSessionStore.showGameOver"
      >
        <GameStateBar @pause-game="showPauseScreen()" />
      </div>
    </Transition>
    <Transition appear name="overlay">
      <div
        class="play-area"
        v-if="!GameSessionStore.betweenRounds && !GameSessionStore.showGameOver"
      >
        <IssueQueue :isActive="!GameSessionStore.gameIsPaused" />
        <DevTools v-if="MetaGameStore.showDevTools" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.game-layout {
  display: flex;
  flex-direction: column;
  align-items: stretch;

  position: absolute;
  z-index: 500;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: var(--stack-bg-color);
  background-image: linear-gradient(
      45deg,
      hsla(0, 0%, 0%, 0.25) 25%,
      transparent 25%,
      transparent 75%,
      hsla(0, 0%, 0%, 0.25) 75%,
      hsla(0, 0%, 0%, 0.25)
    ),
    linear-gradient(
      45deg,
      hsla(0, 0%, 0%, 0.25) 25%,
      transparent 25%,
      transparent 75%,
      hsla(0, 0%, 0%, 0.25) 75%,
      hsla(0, 0%, 0%, 0.25)
    );
  background-position: 0 0, 3px 3px;
  background-size: 6px 6px;
}

.top-bar {
  position: relative;
  height: 10%;
  min-height: 75px;
  box-sizing: border-box;
}

.play-area {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex-grow: 1;
  position: relative;
}
</style>
