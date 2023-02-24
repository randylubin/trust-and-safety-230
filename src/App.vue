<script setup>
import { ref, onMounted, watch } from 'vue'

import { MetaGameStore } from './stores/MetaGameStore'

import MainGame from './components/MainGame.vue'
import LaunchScreen from './components/LaunchScreen/LaunchScreen.vue'
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

    <MainGame v-if="!showLaunchScreen" />
  </div>
</template>

<style>
:root {
  font-size: 2.5vw;
}

@media (min-width: 400px) {
  :root {
    font-size: 10px;
  }
}

.game-layout {
  --stack-bg-color: rgb(226, 219, 208);
  --controls-bg-color: rgb(201, 194, 184);
  --card-bg-color: white;
  --card-innershadow-color: rgb(185, 225, 234);
  --card-outershadow-color: rgb(141, 173, 178);

  --takedown-bg-color: rgb(224, 133, 133);
  --leaveup-bg-color: rgb(186, 219, 134);
  --examine-bg-color: rgb(178, 222, 237);
  --button-disabled-bg-color: #999;

  --examine-popup-incomplete-bg-color: rgb(215, 215, 215);
  --examine-popup-complete-bg-color: rgb(230, 230, 230);
}

body {
  font-size: 1.4rem;
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
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
</style>
