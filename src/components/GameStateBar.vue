<script setup>
import { computed } from 'vue'
import { GameSessionStore } from '../stores/GameSessionStore'
defineEmits(['pauseGame', 'unpauseGame'])

const clockGradientAngle = computed(() => {
  return `${
    360 -
    360 * (GameSessionStore.timeRemaining / GameSessionStore.initialTimeInRound)
  }deg`
})
</script>

<template>
  <!--<span>Speed: {{ GameSessionStore.moderationSpeed }} | </span>
  <span>Quality: {{ GameSessionStore.moderationQuality }} | </span>
  <span>Perception: {{ GameSessionStore.publicPerception }}</span>-->
  <div class="game-state-bar">
    <div class="state-area">
      Game State
      <button @click="$emit('pauseGame')">Pause</button>
    </div>
    <div class="clock-area">
      <div class="round-clock"></div>
    </div>
  </div>
</template>

<style scoped>
.game-state-bar {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  padding: 1rem 1rem 0.2rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: stretch;
}

.state-area {
  flex-grow: 1;
}

.clock-area {
  aspect-ratio: 1/1;
}
.round-clock {
  --gradient-angle: v-bind(clockGradientAngle);
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  border-radius: 100%;
  border: 0.8rem solid var(--controls-bg-color);
  background-color: rgb(119, 112, 103);
  background-image: conic-gradient(
    rgba(255, 255, 255, 0.25) var(--gradient-angle),
    transparent var(--gradient-angle)
  );
  background-size: cover;
  background-repeat: no-repeat;
  background-blend-mode: soft-light;
}
</style>
