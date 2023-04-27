<script setup>
import { ref, onMounted, watch } from 'vue'

import { MetaGameStore } from './stores/MetaGameStore'

import MainGame from './components/MainGame.vue'
import LaunchScreen from './components/LaunchScreen/LaunchScreen.vue'
import AboutPage from './components/Misc/AboutPage.vue'
import AchievementPage from './components/Misc/AchievementPage.vue'
import PolicyPage from './components/Misc/PolicyPage.vue'
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
    !IssueQueueStore.interstitialShown &&
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
  GameSessionStore.showHomescreen = false
  GameSessionStore.startNewSession()
}

function continueSession() {
  showLaunchScreen.value = false
  GameSessionStore.showHomescreen = false

  if (localStorage.MetaGameStore) MetaGameStore.loadSessionFromLocal()
  if (localStorage.GameSessionStore) GameSessionStore.loadSessionFromLocal()
  if (localStorage.IssueQueueStore) IssueQueueStore.loadSessionFromLocal()
}
</script>

<template>
  <div id="screen-container">
    <Transition appear name="launch" :duration="{ enter: 1400, leave: 400 }">
      <LaunchScreen
        v-if="showLaunchScreen || GameSessionStore.showHomescreen"
        @new-session="newSession()"
        @continue-session="continueSession()"
      />
      <MainGame v-else />
    </Transition>
    <Transition name="overlay">
      <AboutPage v-if="GameSessionStore.showAbout" />
    </Transition>
    <Transition name="overlay">
      <AchievementPage v-if="GameSessionStore.showAchievements" />
    </Transition>
    <Transition name="overlay">
      <PolicyPage v-if="GameSessionStore.showPolicies" />
    </Transition>
  </div>
</template>

<style>

* {
  user-select: none !important;
  -webkit-user-select: none !important;
  -webkit-user-drag: none !important;
  -webkit-touch-callout: none !important;
}

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

  --stack-bg-color: rgb(39, 31, 31);
  --controls-bg-color: rgb(53, 53, 53);
  --controls-shadow-color: rgb(37, 37, 37);
  --modal-bg-color: rgb(39, 39, 39);
  --logo-light-color: rgb(204, 228, 234);

  --card-bg-color: white;
  --card-text-color: rgb(44, 62, 80);
  --card-innershadow-color: rgb(191, 214, 221);
  --card-outershadow-color: rgb(150, 184, 194);
  --card-appeal-innershadow-color: rgb(247, 131, 77);
  --card-appeal-outershadow-color: rgb(187, 96, 54);
  --card-bot-innershadow-color: rgb(89, 161, 209);
  --card-bot-outershadow-color: rgb(74, 134, 173);

  --takedown-bg-color: rgb(255, 112, 112);
  --takedown-shadow-color: rgb(143, 65, 65);
  --leaveup-bg-color: rgb(187, 236, 106);
  --leaveup-shadow-color: rgb(102, 131, 55);
  --examine-bg-color: rgb(124, 218, 250);
  --examine-shadow-color: rgb(81, 137, 156);

  --takedown-text-color: rgb(180, 80, 80);
  --keepup-text-color: rgb(126, 160, 71);

  --button-basic-bg-color: rgb(140, 226, 255);
  --button-basic-shadow-color: rgb(86, 145, 165);
  --button-disabled-bg-color: #999;
  --button-disabled-shadow-color: #5e5d5d;
  --button-highlight-bg-color: var(--en-2m);
  --button-highlight-shadow-color: rgb(148, 72, 50);
  --button-alt-bg-color: var(--leaveup-bg-color);
  --button-alt-shadow-color: var(--leaveup-shadow-color);

  --examine-popup-incomplete-bg-color: rgb(215, 215, 215);
  --examine-popup-complete-bg-color: rgb(230, 230, 230);
  --examine-popup-text-color: rgb(44, 62, 80);

  --timer-bg-color: rgb(27, 19, 19);
  --timer-bar-bg-color: var(--en-2d);
  /* old: rgb(168, 83, 234); */
  --timer-overlay-color: rgba(255, 255, 255, 0.7);
  --timer-alert-color: rgb(199, 54, 54);

  --fade-bg-gradient: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 10%,
    rgba(0, 0, 0, 0.2) 90%
  );
}

.btn-basic {
  background-color: var(--button-basic-bg-color);
  background-image: var(--fade-bg-gradient);
  box-shadow: 0 0.4rem var(--button-basic-shadow-color);
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

.btn-basic.highlight {
  background-color: var(--button-highlight-bg-color);
  box-shadow: 0 0.4rem var(--button-highlight-shadow-color);
}

.btn-basic.alt {
  background-color: var(--button-alt-bg-color);
  box-shadow: 0 0.4rem var(--button-alt-shadow-color);
}

.btn-back {
  margin-left: 0;
  width: 40% !important;
  filter: grayscale(1);
  font-size: 1.7rem;
  line-height: 1.7rem;
  padding: 0.8rem 1.2rem;
}

.card-container .btn-basic {
  box-shadow: none;
  background-image: none;
}

a {
  color: var(--en-2l);
}

body {
  font-size: 1.4rem;
  margin: 0;
  padding: 0;
}

#app {
  font-family: var(--font-1), Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: white;

  background: #222;

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
  background: var(--stack-bg-color);
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 400px;
  max-height: 860px;
  min-width: 320px;
  overflow: hidden;
}

/* Vue Transitions */

.launch-leave-to > div {
  opacity: 0;
}

.launch-leave-active > div {
  transition: opacity 0.4s linear;
}

/* Reusable Vue Transitions */

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.2s linear;
}
</style>
