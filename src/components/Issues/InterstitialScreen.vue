<script setup>
// import { GameSessionStore } from "../../stores/GameSessionStore";
import { IssueQueueStore } from '../../stores/IssueQueueStore'
</script>

<template>
  <div class="interstitial-screen">
    <h1>Interstitial Screen</h1>
    <div>{{ IssueQueueStore.interstitialShown }}</div>
    <button @click="IssueQueueStore.closeInterstitial()">Close</button>
  </div>
</template>

<style scoped>
.interstitial-screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;

  background: #999;
}
</style>
