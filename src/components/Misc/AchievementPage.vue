<script setup>
import { computed } from 'vue'
import { GameSessionStore } from '../../stores/GameSessionStore'
import { MetaGameStore } from '../../stores/MetaGameStore'
import { PossibleAchievementsList } from './AchievementLogic'

const unlockedAchievements = computed(() => {
  const list = []
  for (const [id, ach] of Object.entries(PossibleAchievementsList)) {
    if (MetaGameStore.achievements.includes(id)) list.push(ach)
  }
  return list
})

const lockedAchievements = computed(() => {
  const list = []
  for (const [id, ach] of Object.entries(PossibleAchievementsList)) {
    if (!MetaGameStore.achievements.includes(id)) list.push(ach)
  }
  return list
})
</script>

<template>
  <div class="achievement-page">
    <div class="achievements-intro">
      Unlock achievements by playing the game.
    </div>
    <div class="overflow-wrapper">
      <div class="achievements-frame">
        <div class="achievements-label">
          <span>
            {{ unlockedAchievements.length }}/{{
              unlockedAchievements.length + lockedAchievements.length
            }}
            Achievements</span
          >
        </div>
        <div class="achievements-scrollbox">
          <div
            v-for="achievement in unlockedAchievements"
            class="achievement-card"
            :class="'ach-' + achievement.id"
            :key="achievement.id"
          >
            <div class="achievement-icon"></div>
            <div class="achievement-info">
              <div class="achievement-name">
                {{ PossibleAchievementsList[achievement.id].title }}
              </div>
              <div class="achievement-text">
                {{ PossibleAchievementsList[achievement.id].description }}
              </div>
            </div>
          </div>
          <div
            v-for="achievement in lockedAchievements"
            class="achievement-card ach-locked"
            :key="achievement"
          >
            <div class="achievement-icon"></div>
            <div class="achievement-info">
              <div class="achievement-name">
                {{ PossibleAchievementsList[achievement.id].title }}
              </div>
              <div class="achievement-text">
                {{ PossibleAchievementsList[achievement.id].description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <button
      class="btn-basic"
      @click="GameSessionStore.showAchievements = false"
    >
      Close
    </button>
  </div>
</template>

<style scoped>
@import url('@/assets/achievements/achievements.css');
.achievement-page {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1005;
  padding: 0 2.5rem 4rem;
  background: var(--modal-bg-color);
}

.achievements-intro {
  font-weight: 300;
  font-size: 1.8rem;
  margin-top: 3.25rem;
}

.achievements-frame {
  display: flex;
  flex-direction: column;
  padding: 0 0 2rem 2rem;
  border: 0.3rem solid var(--card-outershadow-color);
  border-radius: 2rem;
  max-height: calc(100% - 4rem);
}

.overflow-wrapper {
  flex-grow: 1;
  padding-top: 4rem;
  margin-bottom: 3rem;
  overflow: hidden;
}
.achievements-scrollbox {
  padding-right: 2rem;
  overflow-y: scroll;
}

.achievements-label {
  color: var(--card-outershadow-color);
  font-family: var(--font-2);
  text-transform: uppercase;
  position: relative;
  top: -1rem;
  right: 1rem;
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

.achievement-card.ach-locked {
  filter: grayscale(1);
  opacity: 0.75;
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
</style>
