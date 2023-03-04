<script setup>
import { MetaGameStore } from '../../stores/MetaGameStore'
import { GameSessionStore } from '../../stores/GameSessionStore'
import AchievementsList from '../Misc/AchievementsList.vue'
import { ref } from 'vue'

const emit = defineEmits(['newSession'])

const showTutorialButton = ref(false)

function toggleTutorialButton() {
  showTutorialButton.value = true
}

function startSession(showTutorial = true) {
  GameSessionStore.showTutorial = showTutorial
  emit('newSession')
}
</script>

<template>
  <div class="launch-screen">
    <h1>Launch Screen</h1>
    <div v-if="!showTutorialButton">
      <button
        v-if="MetaGameStore.activeSession"
        @click="$emit('continueSession')"
      >
        Continue Session
      </button>
      <button
        v-if="MetaGameStore.activeSession"
        @click="toggleTutorialButton()"
      >
        Restart Game
      </button>
      <button
        v-if="!MetaGameStore.activeSession"
        @click="toggleTutorialButton()"
      >
        Start Game
      </button>
      <AchievementsList></AchievementsList>
    </div>
    <div v-if="showTutorialButton">
      <button @click="startSession(false)">Skip Tutorial</button>
      <button @click="startSession(true)">Play Tutorial</button>
    </div>
  </div>
</template>

<style scoped></style>
