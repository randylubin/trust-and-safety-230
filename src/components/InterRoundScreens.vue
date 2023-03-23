<script setup>
import { ref } from 'vue'
import { GameSessionStore } from '../stores/GameSessionStore'
import { IssueQueueStore } from '../stores/IssueQueueStore'

let interScreenIndex = ref(0)
let contentsArray = []

const startNewRound = function () {
  console.log('new round')
  GameSessionStore.currentRound++
  GameSessionStore.timeRemaining = 100 // TODO
  IssueQueueStore.startNewRound()
}

// ADD CONTENT
// Manager Check-in
let managerComments = ''

if (GameSessionStore.disagreeWithManager > GameSessionStore.agreeWithManager) {
  // TODO: fix logic
  managerComments +=
    "You're making too many decisions that are at odds with our policies. Keep it up and you'll be out of a job."
} else {
  managerComments +=
    "You're doing a great job of making sure content adhears to our policies."
}

if (GameSessionStore.issuesSeenThisRound < 10) {
  // TODO: fix logic
  managerComments +=
    "<br><br>You're making decisions too slowly... move faster."
} else {
  managerComments +=
    "<br><br>You're doing a great job making decisions quickly."
}

contentsArray.push(managerComments)

// Public Check-in
let publicComments = ''

if (GameSessionStore.publicFreeSpeech <= 3) {
  publicComments += 'People are angry about the platform "censoring" their views'
} else {
  publicComments += 'TODO no censorship'
}

if (GameSessionStore.publicSafety <= 3) {
  publicComments += '<br><br>People are worried about the site being unsafe'
} else {
  publicComments += '<br><br>TODO no safety issue'
}

contentsArray.push(publicComments)
</script>

<template>
  <div class="round-screen">
    <div class="round-text">Round {{ GameSessionStore.currentRound + 1 }}</div>
    <div
      class="feedback-text"
      v-if="interScreenIndex < contentsArray.length"
      v-html="contentsArray[interScreenIndex]"
    ></div>
    <div class="feedback-text" v-else>Ready for your next shift?</div>
    <button
      v-if="interScreenIndex > 0"
      class="btn-basic"
      @click="interScreenIndex--"
    >
      Previous
    </button>
    <button
      v-if="interScreenIndex < contentsArray.length"
      class="btn-basic"
      @click="interScreenIndex++"
    >
      Next
    </button>
    <button
      v-if="contentsArray.length == interScreenIndex"
      class="btn-basic"
      @click="startNewRound()"
    >
      Next Round
    </button>
  </div>
</template>

<style scoped>
.round-screen {
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

  background: var(--controls-bg-color);
}

.round-text {
  font-size: 2.8rem;
  font-weight: 400;
  margin-bottom: 2rem;
}

.feedback-text {
  font-size: 2rem;
  font-weight: 400;
  margin-bottom: 2rem;
}
</style>
