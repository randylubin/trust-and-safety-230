<script setup>
import { GameSessionStore } from '../stores/GameSessionStore'
import AchievementPage from './Misc/AchievementPage.vue'
import AboutPage from './Misc/AboutPage.vue'

const emits = defineEmits(['unpauseGame'])
</script>

<template>
  <div class="pause-screen">
    <div class="big-label">Paused</div>
    <button class="btn-basic highlight" @click="$emit('unpauseGame')">
      Resume
    </button>
    <button class="btn-basic" @click="GameSessionStore.showPolicies = true">
      Content Policies
    </button>
    <button class="btn-basic" @click="GameSessionStore.showAchievements = true">
      Achievements
    </button>
    <button
      class="btn-basic btn-about"
      @click="GameSessionStore.showAbout = true"
    >
      About The Game
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

  background: var(--modal-bg-color);
}

.big-label {
  position: relative;
  font-family: var(--font-2);
  font-size: 6rem;
  line-height: 6rem;
  height: 6rem;
  margin-bottom: 3rem;
  text-transform: uppercase;
  font-weight: 900;
}

.pause-text {
  font-size: 2.8rem;
  font-weight: 400;
  margin-bottom: 2rem;
}

button {
  margin-bottom: 2rem;
}

.btn-about {
  margin-top: 6rem;
}
</style>
