<script setup>
import { ref, onMounted, watch } from 'vue'

import { MetaGameStore } from './stores/MetaGameStore'

import MainGame from './components/MainGame.vue'
import LaunchScreen from './components/LaunchScreen/LaunchScreen.vue'
import AboutScreen from './components/Misc/AboutPage.vue'
import { GameSessionStore } from './stores/GameSessionStore'
import { IssueQueueStore } from './stores/IssueQueueStore'

if (localStorage.MetaGameStore) {
  MetaGameStore.loadSessionFromLocal()
} else {
  MetaGameStore.loaded = true
}

const showLaunchScreen = ref(true)

function shortcutKeys(e) {
  if (e.key == 'D') MetaGameStore.showDevTools = !MetaGameStore.showDevTools
  if (
    !GameSessionStore.gameIsPaused &&
    IssueQueueStore.currentIssueQueue.length
  ) {
    if (e.key == 'ArrowLeft') {
      IssueQueueStore.takeAction(
        'takeDown',
        IssueQueueStore.currentIssueQueue[0]
      )
    }
    if (e.key == 'ArrowRight') {
      IssueQueueStore.takeAction('keepUp', IssueQueueStore.currentIssueQueue[0])
    }
  }
}

onMounted(() => {
  const localData = localStorage.MetaGameStore
    ? JSON.parse(localStorage.MetaGameStore)
    : { activeSession: false }
  MetaGameStore.activeSession = localData.activeSession ? true : false

  window.addEventListener('keydown', shortcutKeys)
})

watch(
  MetaGameStore,
  () => {
    if (MetaGameStore.loaded) {
      MetaGameStore.saveSessionToLocal()
    }
  },
  { deep: true }
)

watch(
  IssueQueueStore,
  () => {
    IssueQueueStore.saveSessionToLocal()
    GameSessionStore.saveSessionToLocal()
  },
  { deep: true }
)

function newSession() {
  console.log('starting session')
  MetaGameStore.activeSession = true
  showLaunchScreen.value = false
  GameSessionStore.startNewSession()
}

function continueSession() {
  showLaunchScreen.value = false

  if (localStorage.MetaGameStore) MetaGameStore.loadSessionFromLocal()
  if (localStorage.GameSessionStore) GameSessionStore.loadSessionFromLocal()
  if (localStorage.IssueQueueStore) IssueQueueStore.loadSessionFromLocal()
}
</script>

<template>
  <div id="screen-container">
    <LaunchScreen
      v-if="showLaunchScreen"
      @new-session="newSession()"
      @continue-session="continueSession()"
    />

    <AboutScreen v-if="GameSessionStore.showAbout"></AboutScreen>

    <MainGame v-if="!showLaunchScreen" />
  </div>
</template>

<style>
:root {
  font-size: 2.5vw;
  --font-1: 'jaf-bernina-sans';
  --font-2: 'azo-sans-web';
}

@media (min-width: 400px) {
  :root {
    font-size: 10px;
  }
}

#app {
  /* Engine Palette: 3 colours in dark/med/light */

  --en-1d: rgb(233, 29, 81);
  --en-2d: rgb(232, 90, 66);
  --en-3d: rgb(231, 127, 37);
  --en-1m: rgb(236, 65, 102);
  --en-2m: rgb(238, 117, 85);
  --en-3m: rgb(240, 155, 41);
  --en-1l: rgb(240, 110, 143);
  --en-2l: rgb(244, 157, 119);
  --en-3l: rgb(250, 201, 63);

  /* Game Palette */

  --stack-bg-color: rgb(35, 25, 25);
  /* old: rgb(226, 219, 208); */
  --controls-bg-color: rgb(53, 53, 53);
  /* old: rgb(201, 194, 184); */
  --modal-bg-color: rgb(200, 200, 200);
  --card-bg-color: white;
  --card-innershadow-color: var(--en-2d);
  /* old: rgb(185, 225, 234); */
  --card-appeal-innershadow-color: var(--en-1d);
  --card-outershadow-color: hsl(9, 56%, 49%);
  /*old: rgb(141, 173, 178); */
  --card-appeal-outershadow-color: hsl(345, 78%, 43%);

  --takedown-bg-color: rgb(255, 112, 112);
  --takedown-shadow-color: rgb(143, 65, 65);
  /*old: rgb(224, 133, 133);*/
  --leaveup-bg-color: rgb(187, 236, 106);
  --leaveup-shadow-color: rgb(102, 131, 55);
  /*old: rgb(186, 219, 134);*/
  --examine-bg-color: rgb(124, 218, 250);
  --examine-shadow-color: rgb(86, 145, 165);
  /*old: rgb(178, 222, 237);*/

  --takedown-text-color: rgb(180, 80, 80);
  --keepup-text-color: rgb(126, 160, 71);

  --button-basic-bg-color: rgb(140, 226, 255);
  --button-basic-shadow-color: rgb(86, 145, 165);
  --button-disabled-bg-color: #999;
  --button-disabled-shadow-color: #707070;

  --examine-popup-incomplete-bg-color: rgb(215, 215, 215);
  --examine-popup-complete-bg-color: rgb(230, 230, 230);

  --timer-bg-color: rgb(27, 19, 19);
  --timer-bar-bg-color: rgb(192, 62, 224);
  --timer-overlay-color: rgba(255, 255, 255, 0.7);

  --fade-bg-gradient: linear-gradient(to bottom, rgba(0,0,0,0) 10%, rgba(0,0,0,.2) 90%);
}

.btn-basic {
  background-color: var(--button-basic-bg-color);
  border: none;
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  font-family: var(--font-2), Helvetica, Arial, sans-serif;
  text-transform: uppercase;
  font-size: 2rem;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

body {
  font-size: 1.4rem;
  margin: 0;
  padding: 0;
}

#app {
  font-family: var(--font-1), Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;

  background: #333;

  display: flex;
  justify-content: center;
  align-items: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

#screen-container {
  background: white;
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 400px;
  max-height: 860px;
  min-width: 320px;
  overflow: hidden;
}

/* Reusable Vue Transitions */

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
  filter: blur(100%);
}
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.2s linear, filter 0.2s linear;
}
</style>
