<script setup>
import { ref } from "vue";
import MainGame from "./components/MainGame.vue";
import LaunchScreen from "./components/LaunchScreen/LaunchScreen.vue";

const showLaunchScreen = ref(true);
const activeSession = ref(false);

function newSession() {
  console.log("starting session");
  activeSession.value = true;
  showLaunchScreen.value = false;
}

function continueSession() {
  activeSession.value = true;
  showLaunchScreen.value = false;
}
</script>

<template>
  <LaunchScreen
    v-if="showLaunchScreen"
    :active-session="activeSession"
    @new-session="newSession()"
    @continue-session="continueSession()"
  />

  <MainGame v-if="!showLaunchScreen" />
</template>

<style scoped></style>
