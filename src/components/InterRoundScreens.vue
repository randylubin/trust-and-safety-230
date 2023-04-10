<script setup>
import { ref } from 'vue'
import { GameSessionStore } from '../stores/GameSessionStore'

let interScreenIndex = ref(0)
let contentsArray = []
const triggerGameOver = ref(false)

const cardsPerRoundWarn = 20
const cardsPerRoundFire = 10
const publicWarnLevel = 3

// CHECK FOR GAME OVER
// TODO FIX LOGIC AND CONTENT
let gameOverReason = []
if (GameSessionStore.disagreeWithManager >= 15)
  gameOverReason.push('Fired for bad judgement')
if (GameSessionStore.issuesCompletedThisRound <= cardsPerRoundFire)
  gameOverReason.push('Too slow!')
if (GameSessionStore.publicFreeSpeech == 0)
  gameOverReason.push('Censorship accusations')
if (GameSessionStore.publicSafety == 0) gameOverReason.push('Platform safety')
if (GameSessionStore.endGameAtEndOfRound)
  // from ARC
  gameOverReason.push(GameSessionStore.endGameAtEndOfRound)

if (gameOverReason.length) {
  triggerGameOver.value = true
  GameSessionStore.endGame(gameOverReason)
}

// GENERATE CONTENT (IF NOT GAME OVER)
if (!triggerGameOver.value) {
  // Manager Check-in
  let managerComments = ''

  if (
    GameSessionStore.disagreeWithManager > GameSessionStore.agreeWithManager
  ) {
    // TODO: fix logic
    managerComments +=
      "You're making too many decisions that are at odds with our policies. Keep it up and you'll be out of a job."
  } else {
    managerComments +=
      "You're doing a great job of making sure content adheres to our policies."
  }

  if (
    GameSessionStore.issuesCompletedThisRound <= cardsPerRoundWarn &&
    GameSessionStore.issuesCompletedThisRound > cardsPerRoundFire
  ) {
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

  if (GameSessionStore.publicFreeSpeech <= publicWarnLevel) {
    publicComments +=
      'People are angry about the platform "censoring" their views'
  } else {
    publicComments += 'TODO no censorship'
  }

  if (GameSessionStore.publicSafety <= publicWarnLevel) {
    publicComments += '<br><br>People are worried about the site being unsafe'
  } else {
    publicComments += '<br><br>TODO no safety issue'
  }

  contentsArray.push(publicComments)
}
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
      @click="GameSessionStore.startNewRound()"
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

  background: var(--modal-bg-color);
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
