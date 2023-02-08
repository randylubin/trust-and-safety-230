<script setup>
import { GameSessionStore } from "../stores/GameSessionStore";
</script>

<template>
  <span>Speed: {{ GameSessionStore.moderationSpeed }} | </span>
  <span>Quality: {{ GameSessionStore.moderationQuality }} | </span>
  <span>Perception: {{ GameSessionStore.publicPerception }}</span>
</template>

<style scoped></style>
