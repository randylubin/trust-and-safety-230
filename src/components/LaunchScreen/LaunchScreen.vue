<script setup>
import AchievementsList from "../Misc/AchievementsList.vue";

const props = defineProps({
  activeSession: Boolean,
});
</script>

<template>
  <div class="launch-screen">
    <h1>Launch Screen</h1>
    <button v-if="activeSession" @click="$emit('continueSession')">
      Continue Session
    </button>
    <button v-if="activeSession" @click="$emit('newSession')">
      Restart Game
    </button>
    <button v-if="!activeSession" @click="$emit('newSession')">
      Start Game
    </button>
    <AchievementsList></AchievementsList>
  </div>
</template>

<style scoped></style>
