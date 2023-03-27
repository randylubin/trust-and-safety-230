<script setup>
import { GameSessionStore } from '../stores/GameSessionStore'

const emits = defineEmits(['unpauseGame'])
</script>

<template>
  <div class="pause-screen">
    <div class="pause-text">The Pause Menu</div>
    <button class="btn-basic" @click="$emit('unpauseGame')">Resume</button>
    <button class="btn-basic" @click="GameSessionStore.showAbout = true">
      About
    </button>
  </div>
</template>

<style scoped>
.pause-screen {
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

  background: var(--controls-bg-color);
}

.pause-text {
  font-size: 2.8rem;
  font-weight: 400;
  margin-bottom: 2rem;
}

button {
  margin-bottom: 2rem;
}
</style>
