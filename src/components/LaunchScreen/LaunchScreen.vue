<script setup>
import { MetaGameStore } from '../../stores/MetaGameStore'
import { GameSessionStore } from '../../stores/GameSessionStore'
import { ref } from 'vue'
import { event } from 'vue-gtag'
import { onMounted } from 'vue'

const emit = defineEmits(['newSession', 'continueSession'])

onMounted(() => {
  event('view_homepage')
})

const showTutorialButton = ref(false)

function toggleTutorialButton() {
  showTutorialButton.value = true
}

function startSession(showTutorial = true) {
  GameSessionStore.showTutorial = showTutorial
  emit('newSession')

  event('start_game_session')
}
</script>

<template>
  <div class="launch-screen">
    <Transition name="overlay" mode="out-in">
      <div v-if="!showTutorialButton">
        <div class="game-logo">
          <img src="@/assets/svg/moderator-mayhem.svg" />
        </div>
        <div class="game-tagline">A Content Moderation Game</div>
        <button
          v-if="MetaGameStore.activeSession"
          class="btn-basic highlight"
          @click="$emit('continueSession')"
        >
          Continue Game
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
          class="btn-basic highlight"
          @click="toggleTutorialButton()"
        >
          New Game
        </button>
        <button
          class="btn-basic btn-about"
          @click="GameSessionStore.showAbout = true"
        >
          About
        </button>
        <div class="engine-logo">
          <img src="@/assets/logos/logo-engine.png" />
        </div>
      </div>
      <div v-else>
        <div class="content-warning">CONTENT WARNING TK</div>
        <button class="btn-basic highlight" @click="startSession(true)">
          Play Tutorial
        </button>
        <button class="btn-basic" @click="startSession(false)">
          Skip Tutorial
        </button>
        <button class="btn-basic btn-back" @click="showTutorialButton = false">
          Back
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>

.launch-screen {
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  padding: 3rem;

  background: var(--modal-bg-color);
}

.launch-screen > div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  max-height: 100%;
  overflow: hidden;

}

.game-logo {
  max-height: 13.5rem;
  margin-bottom: 4rem;
  flex-shrink: 3;
}

.game-logo > img {
  display: block;
  max-height: 100%;
  max-width: 100%;
  margin: 0 auto;
}

.game-tagline {
  color: var(--card-innershadow-color);
  font-size: 2.2rem;
  font-weight: 600;
  white-space: nowrap;
  text-align: center;
  overflow: hidden;
  width: 100%;
  margin: 0 auto 4rem;
  line-height: 1;
  padding: 1rem 0;
  border-top: 1px solid var(--card-outershadow-color);
  border-bottom: 1px solid var(--card-outershadow-color);
}

.launch-text {
  font-size: 2.8rem;
  font-weight: 400;
  margin-bottom: 2rem;
}

button {
  margin-bottom: 2rem;
}

.btn-about {
  
}

.engine-logo {
  margin-top: 2rem;
  height: 6rem;
}
.engine-logo > img {
  display: block;
  max-height: 100%;
  max-width: 100%;
  margin: 0 auto;
}

/* Vue Transitions */

.launch-enter-from .game-logo {
  opacity: 0;
  transform: scale(.1);
  filter: blur(3rem);
}

.launch-enter-active .game-logo {
  transition: opacity 0.4s ease-out, transform 0.4s ease-out, filter 0.7s ease-out;
}

.launch-enter-from .game-tagline {
  opacity: 0;
  transform: scaleX(10%);
  color: var(--modal-bg-color);
}

.launch-enter-active .game-tagline {
  transition: opacity 0.2s linear, transform 0.3s linear, color 0.2s linear;
  transition-delay: 0.5s, 0.5s, 0.8s;
}

.launch-enter-from button,
.launch-enter-from .engine-logo {
  opacity: 0;
  transform: translateY(3rem);
}

.launch-enter-active button,
.launch-enter-active .engine-logo {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}
.launch-enter-active button {
  transition-delay: 0.8s, 0.8s;
}
.launch-enter-active .engine-logo {
  transition-delay: 1s, 1s;
}
</style>
