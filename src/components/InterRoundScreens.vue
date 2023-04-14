<script setup>
import { ref } from 'vue'
import { GameSessionStore } from '../stores/GameSessionStore'

let interScreenIndex = ref(0)
let contentsArray = []
const triggerGameOver = ref(false)

const cardsPerRoundWarn = 15
const cardsPerRoundFire = 2
const publicWarnLevel = 3
const publicPraiseLevel = 8

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

if (gameOverReason.length && GameSessionStore.currentRound != 0) {
  triggerGameOver.value = true
  GameSessionStore.betweenRounds = false
  console.log(gameOverReason)
  GameSessionStore.endGame(gameOverReason)
}

// GENERATE CONTENT (IF NOT GAME OVER)
if (!triggerGameOver.value) {
  // Manager Check-in
  let managerComments = ''

  let managerAgreementFeedbackArray = [
    "You're making too many decisions that are at odds with our policies. Keep it up and you'll be out of a job.",
    'Many of your decisions are at odds with our policies. Be more careful.',
    'Some of your decisions go against platform policy. Take a bit more care.',
    "You're doing a okay job with your decisions but there's room for improvement",
    "You're doing a great job of making sure content adheres to our policies.",
  ]

  // TODO calibrate
  let managersAgreementArrayScores = [1, 3, 5, 10, 15]

  let managerScore = GameSessionStore.disagreeWithManager
  let managerFeedback = ''

  // Assign manager level
  for (let i = 0; i < managersAgreementArrayScores.length; i++) {
    if (managerScore > managersAgreementArrayScores[i]) {
      managerFeedback = managerAgreementFeedbackArray[i]
    }
  }
  managerComments += managerFeedback

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

  let publicFreeSpeechTier = 'medium'
  let publicSafetyTier = 'medium'

  if (GameSessionStore.publicFreeSpeech <= publicWarnLevel) {
    publicFreeSpeechTier = 'low'
  } else if (GameSessionStore.publicFreeSpeech < publicPraiseLevel) {
    publicFreeSpeechTier = 'medium'
  } else {
    publicFreeSpeechTier = 'high'
  }

  if (GameSessionStore.publicSafety <= publicWarnLevel) {
    publicSafetyTier = 'low'
  } else if (GameSessionStore.publicSafety < publicPraiseLevel) {
    publicSafetyTier = 'medium'
  } else {
    publicSafetyTier = 'high'
  }

  if (publicFreeSpeechTier === 'low') {
    if (publicSafetyTier === 'low') {
      publicComments = 'TK LOW LOW'
    } else if (publicSafetyTier === 'medium') {
      publicComments = 'TK LOW MED'
    } else if (publicSafetyTier === 'high') {
      publicComments = 'TK LOW HIGH'
    }
  } else if (publicFreeSpeechTier === 'medium') {
    if (publicSafetyTier === 'low') {
      publicComments = 'TK MED LOW'
    } else if (publicSafetyTier === 'medium') {
      publicComments = 'TK MED MED'
    } else if (publicSafetyTier === 'high') {
      publicComments = 'TK MED HIGH'
    }
  } else if (publicFreeSpeechTier === 'high') {
    if (publicSafetyTier === 'low') {
      publicComments = 'TK HIGH LOW'
    } else if (publicSafetyTier === 'medium') {
      publicComments = 'TK HIGH MED'
    } else if (publicSafetyTier === 'high') {
      publicComments = 'TK HIGH HIGH'
    }
  }

  // if (GameSessionStore.publicFreeSpeech <= publicWarnLevel) {
  //   publicComments +=
  //     'People are angry about the platform "censoring" their views'
  // } else {
  //   publicComments += 'TODO no censorship'
  // }

  // if (GameSessionStore.publicSafety <= publicWarnLevel) {
  //   publicComments += '<br><br>People are worried about the site being unsafe'
  // } else {
  //   publicComments += '<br><br>TODO no safety issue'
  // }

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
