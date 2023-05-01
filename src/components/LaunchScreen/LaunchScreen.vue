<script setup>
import { MetaGameStore } from '../../stores/MetaGameStore'
import { GameSessionStore } from '../../stores/GameSessionStore'
import { ref } from 'vue'
import { event } from 'vue-gtag'
import { onMounted } from 'vue'
import { GameDefaults } from '../../GameDefaults'
import AnimatedLogo from './AnimatedLogo.vue'

const emit = defineEmits(['newSession', 'continueSession'])

onMounted(() => {
  event('view_homepage')
})

const showTutorialButton = ref(false)
const showFullscreenInfo = ref(false)
const attemptFullscreen = ref(
  window.innerHeight <= 860 && window.innerWidth <= 500
)

function enterFullscreen() {
  document.getElementById('app').requestFullscreen?.()
}

function toggleTutorialButton() {
  if (attemptFullscreen.value) enterFullscreen()
  showTutorialButton.value = true
}

function startSession(showTutorial = true) {
  if (showTutorial) {
    GameSessionStore.timeRemaining = GameDefaults.tutorialLength
  }
  GameSessionStore.showTutorial = showTutorial
  emit('newSession')

  event('start_game_session')
}

const rememberTutorialChoice = ref(false)

function checkFullscreen(showTutorial = true) {
  if (document.fullscreenElement || !attemptFullscreen.value) {
    startSession(showTutorial)
  } else {
    rememberTutorialChoice.value = showTutorial
    showTutorialButton.value = false
    showFullscreenInfo.value = true
  }
}

function continueSession() {
  if (attemptFullscreen.value) { 
    enterFullscreen()
  }
  emit('continueSession')
}
</script>

<template>
  <div class="launch-screen">
    <Transition name="overlay" mode="out-in">
      <div v-if="!showTutorialButton && !showFullscreenInfo">
        <div class="game-logo">
          <!--<img src="@/assets/svg/moderator-mayhem.svg" />-->
          <AnimatedLogo />
        </div>
        <div class="game-tagline">A Content Moderation Game</div>
        <button
          v-if="MetaGameStore.activeSession"
          class="btn-basic highlight shine"
          @click="continueSession"
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
          class="btn-basic highlight shine"
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
      <div v-else-if="showTutorialButton">
        <div class="content-warning">
          <strong>Content Warning:</strong><br />
          This game is designed for players ages 18 and up, and deals with
          potentially disturbing content. It does not show you such content, but
          it does make reference to it. Please consider this before playing.
        </div>
        <button class="btn-basic highlight" @click="checkFullscreen(true)">
          Play Tutorial
        </button>
        <button class="btn-basic" @click="checkFullscreen(false)">
          Skip Tutorial
        </button>
        <button class="btn-basic btn-back" @click="showTutorialButton = false">
          Back
        </button>
      </div>
      <div class="fullscreen-info" v-else-if="showFullscreenInfo">
        For the best experience on mobile devices, we recommend adding Moderator
        Mayhem to your home screen using your browser menu. This will allow you
        to launch the game in full screen mode.
        <button class="btn-basic" @click="startSession(rememberTutorialChoice)">
          Continue
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
  height: 20vh;
  max-height: 16.5rem;
  min-height: 10rem;
  margin-bottom: 1.25rem;
  margin-left: -3rem;
  margin-right: -3rem;
  flex-shrink: 3;
}

.game-logo > svg {
  display: block;
  max-height: 100%;
  max-width: 100%;
  margin: 0 auto;
}

.game-tagline {
  color: var(--logo-light-color);
  font-size: 2.2rem;
  font-weight: 600;
  white-space: nowrap;
  text-align: center;
  overflow: hidden;
  width: 100%;
  margin: 0 auto 3rem;
  line-height: 1;
  padding: 1rem 0;
  border-top: 1px solid var(--card-outershadow-color);
  border-bottom: 1px solid var(--card-outershadow-color);
  flex-shrink: 0;
}

.launch-text {
  font-size: 2.8rem;
  font-weight: 400;
  margin-bottom: 2rem;
}

button {
  margin-bottom: 1.5rem;
}

.engine-logo {
  margin-top: 2rem;
  height: 6.5rem;
}
.engine-logo > img {
  display: block;
  height: 6.5rem;
  max-width: 100%;
  margin: 0 auto;
}

div.content-warning {
  font-weight: 300;
  font-size: 1.7rem;
  line-height: 1.4;
  margin-bottom: 2rem;
}

div.content-warning > strong {
  font-weight: 700;
  text-transform: uppercase;
}

div.fullscreen-info {
  font-weight: 300;
  font-size: 2.2rem;
  line-height: 1.4;
}

div.fullscreen-info > button {
  margin-top: 2rem;
}

/* Vue Transitions */

.launch-enter-from .game-logo {
  opacity: 0;
  transform: scale(0.1);
  filter: blur(3rem);
}

.launch-enter-active .game-logo {
  transition: opacity 0.4s ease-out, transform 0.4s ease-out,
    filter 0.7s ease-out;
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
