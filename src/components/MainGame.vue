<script setup>
import { ref } from "vue";

import { GameSessionStore } from "../stores/GameSessionStore";
import { MetaGameStore } from "../stores/MetaGameStore";

import PauseMenu from "./PauseMenu.vue";
import GameStateBar from "./GameStateBar.vue";
import IssueQueue from "./Issues/IssueQueue.vue";
import InterRoundScreens from "./InterRoundScreens.vue";
import GameOver from "./GameOver/GameOver.vue";
import DevTools from "./DevTools.vue";

const playerPausedGame = ref(false);

function showPauseScreen() {
  playerPausedGame.value = true;
  GameSessionStore.gameIsPaused = true;
}

function unpauseGame() {
  playerPausedGame.value = false;
  GameSessionStore.gameIsPaused = false;
}
</script>

<template>
  <PauseMenu v-if="playerPausedGame" @unpause-game="unpauseGame()"></PauseMenu>
  <div class="game-area">
    <h1>Main Game Area</h1>
    <button @click="showPauseScreen()">Pause</button>
    <GameStateBar></GameStateBar>
  </div>
  <IssueQueue v-if="!GameSessionStore.betweenRounds"></IssueQueue>
  <InterRoundScreens v-if="GameSessionStore.betweenRounds"></InterRoundScreens>
  <GameOver v-if="GameSessionStore.showGameOver"></GameOver>
  <DevTools v-if="MetaGameStore.showDevTools"></DevTools>
</template>

<style scoped></style>
