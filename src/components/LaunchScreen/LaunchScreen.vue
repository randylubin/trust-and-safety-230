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
  <div class="launch-screen" v-if="!showAboutPage">
    <!--<h1>Launch Screen</h1>-->
    <div v-if="!showTutorialButton">
      <h1>GAME LOGO</h1>
      <h2>One line pitch</h2>
      <button
        v-if="MetaGameStore.activeSession"
        class="btn-basic"
        @click="$emit('continueSession')"
      >
        Continue Session
      </button>
      <button
        v-if="MetaGameStore.activeSession"
        class="btn-basic"
        @click="toggleTutorialButton()"
      >
        Restart Game
      </button>
      <button
        v-if="!MetaGameStore.activeSession"
        class="btn-basic"
        @click="toggleTutorialButton()"
      >
        Start Game
      </button>
      <!--<AchievementsList></AchievementsList>-->
      <button class="btn-basic" @click="GameSessionStore.showAbout = true">
        About
      </button>
    </div>
    <div v-if="showTutorialButton">
      <button class="btn-basic" @click="startSession(false)">
        Skip Tutorial
      </button>
      <button class="btn-basic" @click="startSession(true)">
        Play Tutorial
      </button>
    </div>
  </div>
</template>

<style scoped>
.launch-screen > div {
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
  align-items: stretch;

  background: var(--controls-bg-color);
}

.launch-text {
  font-size: 2.8rem;
  font-weight: 400;
  margin-bottom: 2rem;
}

button {
  margin-bottom: 2rem;
}
</style>
