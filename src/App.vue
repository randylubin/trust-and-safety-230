<script setup>
import { ref, onMounted, watch } from "vue";

import { MetaGameStore } from "./stores/MetaGameStore";

import MainGame from "./components/MainGame.vue";
import LaunchScreen from "./components/LaunchScreen/LaunchScreen.vue";

const showLaunchScreen = ref(true);

function shortcutKeys(e) {
  if (e.key == "D") MetaGameStore.showDevTools = !MetaGameStore.showDevTools;
}

onMounted(() => {
  MetaGameStore.activeSession = localStorage.activeSession ? true : false;
  //TODO sync other local store values

  window.addEventListener("keydown", shortcutKeys);
});

watch(MetaGameStore, (newValue, oldValue) => {
  localStorage.activeSession = newValue.activeSession;
});

function newSession() {
  console.log("starting session");
  MetaGameStore.activeSession = true;
  showLaunchScreen.value = false;
}

function continueSession() {
  MetaGameStore.activeSession = true;
  showLaunchScreen.value = false;
}
</script>

<template>
  <LaunchScreen
    v-if="showLaunchScreen"
    @new-session="newSession()"
    @continue-session="continueSession()"
  />

  <MainGame v-if="!showLaunchScreen" />
</template>

<style scoped></style>
