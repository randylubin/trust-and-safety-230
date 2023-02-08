<script setup>
// import { GameSessionStore } from "../../stores/GameSessionStore";
import { MetaGameStore } from "../../stores/MetaGameStore";

function startNewGame() {
  MetaGameStore.numberOfSessions.value++;
}
</script>

<template>
  <h1>Game Over</h1>
  <button @click="startNewGame()">New Game</button>
</template>

<style scoped></style>
