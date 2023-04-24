<script setup>
// import { GameSessionStore } from "../../stores/GameSessionStore";
import { IssueQueueStore } from '../../stores/IssueQueueStore'
</script>

<template>
  <div class="interstitial-screen">
    <div class="interstitial-header-image manager">
      <img src="@/assets/svg/image-manager.svg" />
    </div>
    <div
      class="interstitial-text"
      v-html="IssueQueueStore.interstitialShown"
    ></div>
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
  padding: 3rem 3rem 5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;

  background: var(--modal-bg-color);
}

.interstitial-header-image {
  width: 100%;
  overflow: hidden;
  margin-bottom: 1.5rem;
  position: relative;
}

.interstitial-header-image > img {
  display: block;
  margin: 0 auto;
  width: 90%;
  position: relative;
  z-index: 50;
}

.interstitial-header-image::after {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background-image: linear-gradient(to bottom, transparent 75%, var(--modal-bg-color) 98%);
}

.interstitial-text {
  font-weight: 300;
  font-size: 2.2rem;
  margin-bottom: 5rem;
}
</style>
