<script setup>
// import { GameSessionStore } from "../../stores/GameSessionStore";
import { GameSessionStore } from '../../stores/GameSessionStore'
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
</template>

<style scoped></style>
