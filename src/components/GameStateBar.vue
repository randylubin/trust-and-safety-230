<script setup>
import { computed } from 'vue'
import { GameSessionStore } from '../stores/GameSessionStore'
defineEmits(['pauseGame', 'unpauseGame'])

const timerBarWidth = computed(() => {
  return `${Math.max(
    0,
    100 * (GameSessionStore.timeRemaining / GameSessionStore.initialTimeInRound)
  )}%`
})

const roundLabel = computed(() => {
  if (GameSessionStore.timeRemaining <= 0) {
    return 'Hurry Up!'
  } else if (GameSessionStore.currentRound === 0) {
    return 'Tutorial'
  } else {
    return 'Round ' + GameSessionStore.currentRound
  }
})
</script>

<template>
  <div class="game-state-bar">
    <div
      class="round-timer"
      :class="{ alert: GameSessionStore.timeRemaining <= 0 }"
    >
      <div class="timer-bar"></div>
      <div class="timer-overlay">
        <div class="round-label">{{ roundLabel }}</div>
        <div class="game-controls">
          <button class="button-pause" @click="$emit('pauseGame')"></button>
        </div>
      </div>
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
  padding: 1.5rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: stretch;
}

.round-timer {
  position: relative;
  display: block;
  box-sizing: border-box;
  flex-grow: 1;
  overflow: hidden;
  background-color: var(--timer-bg-color);
  white-space: nowrap;
  border: 0.3rem solid var(--controls-bg-color);
  border-radius: 4rem;
  padding: 0.3rem;
}

.round-timer::before {
  content: '';
  position: absolute;
  z-index: 100;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  box-sizing: border-box;
  border: 0.3rem solid var(--timer-bg-color);
  border-radius: 3.8rem;
  filter: drop-shadow(0 0.2rem 0 rgba(255, 255, 255, 0.25));
}

@keyframes alert-pulse {
  0% {
    background-color: var(--timer-bg-color);
  }
  50% {
    background-color: var(--timer-alert-color);
  }
}

.round-timer.alert {
  animation: alert-pulse 0.5s linear infinite;
}

.timer-bar {
  width: v-bind('timerBarWidth');
  height: 100%;
  z-index: 20;
  border-radius: 3.4rem;
  background-color: var(--timer-bar-bg-color);
  background-image: var(--fade-bg-gradient);
}

.timer-overlay {
  position: absolute;
  left: 2rem;
  top: 0;
  right: 2rem;
  bottom: 0;
  z-index: 100;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.round-label {
  flex-grow: 1;
  text-align: left;
  font-size: 1.5rem;
  font-family: var(--font-1);
  font-weight: 700;
  text-transform: uppercase;
  line-height: 1;
  height: 1.2rem;
  margin-right: 1rem;
  color: var(--timer-overlay-color);
  position: relative;
}

.game-controls {
  position: relative;
}

button.button-pause {
  background-image: linear-gradient(
    to right,
    var(--timer-overlay-color) 34%,
    transparent 34%,
    transparent 66%,
    var(--timer-overlay-color) 66%
  );
  background-size: cover;
  background-color: transparent;
  border: none;
  height: 1.8rem;
  width: 1.8rem;
}

button.button-pause:hover {
  cursor: pointer;
  opacity: 0.8;
}
</style>
