<script setup>
import { ref, computed } from 'vue'
import { PossibleAchievementsList } from './AchievementLogic'
import { GameSessionStore } from '../../stores/GameSessionStore'

const achievementDisplay = computed(() =>
  GameSessionStore.achievementsUnlockedThisRound.slice(0, 2)
)

const achievementOverflow = ref(
  Math.max(0, GameSessionStore.achievementsUnlockedThisRound.length - 2)
)
</script>

<template>
  <div
    class="round-achievements"
    v-if="GameSessionStore.achievementsUnlockedThisRound.length"
    @click="GameSessionStore.showAchievements = true"
  >
    <div class="achievements-label"><span>Achievements</span></div>
    <div
      v-for="achievement in achievementDisplay"
      class="achievement-card"
      :class="'ach-' + achievement"
      :key="achievement"
    >
      <div class="achievement-icon"></div>
      <div class="achievement-info">
        <div class="achievement-name">
          {{ PossibleAchievementsList[achievement].title }}
        </div>
        <div class="achievement-text">
          {{ PossibleAchievementsList[achievement].description }}
        </div>
      </div>
    </div>
    <div class="achievements-footer">
      <strong v-if="achievementOverflow"
        >+ {{ achievementOverflow }} More. </strong
      ><span>View All &raquo;</span>
    </div>
  </div>
</template>

<style scoped>
@import url('@/assets/achievements/achievements.css');
.round-achievements {
  margin-bottom: 3rem;
  padding: 0 2rem 1rem;
  border: 0.3rem solid var(--card-outershadow-color);
  border-radius: 2rem;
}

.achievements-label {
  color: var(--card-outershadow-color);
  font-family: var(--font-2);
  text-transform: uppercase;
  position: relative;
  top: -1rem;
  font-size: 1.3rem;
}

.achievements-label > span {
  padding: 0 1rem;
  background: var(--modal-bg-color);
}

.achievement-card {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  text-align: left;
  border-bottom: 0.1rem solid var(--card-outershadow-color);
  padding: 1rem 0;
}

.achievements-label + .achievement-card {
  padding-top: 0;
}

.achievement-icon {
  flex-shrink: 0;
  height: 3rem;
  width: 3rem;
  margin-right: 1.5rem;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.achievement-name {
  font-weight: 700;
  color: var(--card-innershadow-color);
  margin-bottom: 0.3rem;
}

.achievement-text {
  font-style: italic;
  color: rgba(255, 255, 255, 0.65);
}

.achievement-info {
  flex-grow: 1;
}

.achievements-footer {
  color: var(--card-innershadow-color);
  margin-top: 1rem;
  line-height: 1;
}

.achievements-footer > span {
  cursor: pointer;
  color: var(--en-3d);
  text-decoration: underline;
  margin-left: 0.5rem;
}
</style>
