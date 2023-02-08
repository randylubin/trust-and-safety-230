<script setup>
import { ref } from "vue";
import { GameSessionStore } from "../stores/GameSessionStore";

import PauseMenu from "./PauseMenu.vue";
import GameStateBar from "./GameStateBar.vue";
import IssueQueue from "./Issues/IssueQueue.vue";
import InterRoundScreens from "./InterRoundScreens.vue";
import GameOver from "./GameOver/GameOver.vue";
import DevTools from "./DevTools.vue";

const gameIsPaused = ref(false);
const betweenRounds = ref(false);

function unpauseGame() {
  gameIsPaused.value = false;
}
</script>

<template>
  <PauseMenu v-if="gameIsPaused" @unpause-game="unpauseGame()"></PauseMenu>
  <div class="game-area" v-if="!gameIsPaused">
    <h1>Main Game Area</h1>
    <button @click="gameIsPaused = true">Pause</button>
    <GameStateBar></GameStateBar>
  </div>
  <IssueQueue
    v-if="!gameIsPaused && !GameSessionStore.betweenRounds"
  ></IssueQueue>
  <InterRoundScreens v-if="GameSessionStore.betweenRounds"></InterRoundScreens>
  <GameOver v-if="GameSessionStore.showGameOver"></GameOver>
  <DevTools></DevTools>
</template>

<style scoped></style>
