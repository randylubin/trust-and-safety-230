<script setup>
import { GameSessionStore } from '../stores/GameSessionStore'
import { IssueQueueStore } from '../stores/IssueQueueStore'

const startNewRound = function () {
  GameSessionStore.currentRound++
  GameSessionStore.timeRemaining = 100 // TODO
  IssueQueueStore.startNewRound()
}
</script>

<template>
  <div>This is where information is presented between rounds.</div>
  <button @click="startNewRound()">Next Round</button>
</template>

<style scoped></style>
