<script setup>
import { GameSessionStore } from '../../stores/GameSessionStore'
</script>

<template>
  <div class="about-page">
    <!-- TODO: ADD CONTENT AND STYLE -->
    <h1>About Page</h1>
    <p>Some information about the game</p>
    <button class="btn-basic" @click="GameSessionStore.showAbout = false">
      X
    </button>
  </div>
</template>

<style scoped>
.about-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1001;

  background: var(--modal-bg-color);
}
</style>
