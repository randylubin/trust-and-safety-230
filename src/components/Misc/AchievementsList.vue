<script setup>
import { PossibleAchievementsList } from './AchievementLogic'
import { MetaGameStore } from '../../stores/MetaGameStore'
</script>

<template>
  <div class="achievements-list">
    <h1>Achievements</h1>
    <div
      v-for="(achievement, key) in PossibleAchievementsList"
      v-bind:key="key"
    >
      <div
        v-if="MetaGameStore.achievements.includes(achievement)"
        class="achievement-item"
      >
        {{ achievement.title }}: {{ achievement.description }}
      </div>
    </div>
  </div>
</template>

<style scoped></style>
