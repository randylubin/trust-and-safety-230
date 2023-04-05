<script setup>
// import { GameSessionStore } from "../../stores/GameSessionStore";
import { IssueQueueStore } from '../../stores/IssueQueueStore'
</script>

<template>
  <div class="interstitial-screen">
    <div class="interstitial-text">{{ IssueQueueStore.interstitialShown }}</div>
    <button class="btn-basic" @click="IssueQueueStore.closeInterstitial()">
      Continue
    </button>
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

  box-sizing: border-box;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;

  background: var(--modal-bg-color);
}

.interstitial-text {
  font-size: 2.8rem;
  font-weight: 400;
  margin-bottom: 2rem;
}
</style>
