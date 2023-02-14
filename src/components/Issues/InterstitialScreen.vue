<script setup>
// import { GameSessionStore } from "../../stores/GameSessionStore";
import { IssueQueueStore } from '../../stores/IssueQueueStore'
</script>

<template>
  <h1>Interstitial Screen</h1>
  <div>{{ IssueQueueStore.interstitialShown }}</div>
  <button @click="IssueQueueStore.closeInterstitial()">Close</button>
</template>

<style scoped></style>
