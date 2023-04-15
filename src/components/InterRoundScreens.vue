<script setup>
import { ref } from 'vue'
import { GameSessionStore } from '../stores/GameSessionStore'

let interScreenIndex = ref(0)
let contentsArray = []
const triggerGameOver = ref(false)

const managerQualityWarn = 5
const managerQualityPraise = 10
const cardsPerRoundPraise = 25
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

  let managerQualityLevel = 'medium'
  let managerSpeedLevel = 'medium'

  let managerQualityNumber = GameSessionStore.disagreeWithManager // TODO update
  let managerSpeedNumber = GameSessionStore.issuesCompletedThisRound

  if (managerQualityNumber <= managerQualityWarn) {
    managerQualityLevel = 'low'
  } else if (managerQualityNumber < managerQualityPraise) {
    managerQualityLevel = 'medium'
  } else {
    managerQualityLevel = 'high'
  }

  if (managerSpeedNumber <= cardsPerRoundWarn) {
    managerSpeedLevel = 'low'
  } else if (managerSpeedNumber < cardsPerRoundPraise) {
    managerSpeedLevel = 'medium'
  } else {
    managerSpeedLevel = 'high'
  }

  if (managerQualityLevel === 'low') {
    if (managerSpeedLevel === 'low') {
      managerComments =
        "You're too slow and you're making poor decisions. Get your act together or you're fired."
    } else if (managerSpeedLevel === 'medium') {
      managerComments =
        "You're moving at a decent pace but you need to improve your decision quality."
    } else if (managerSpeedLevel === 'high') {
      managerComments =
        "You've got a great throughput but your decision quality is poor. Slow down and make sure your decisions align with our policies."
    }
  } else if (managerQualityLevel === 'medium') {
    if (managerSpeedLevel === 'low') {
      managerComments =
        "Your decision quality is fine but you're taking too long. You'll need to make faster decisions if you want to keep your job."
    } else if (managerSpeedLevel === 'medium') {
      managerComments =
        "You're making decent decisions at a decent pace; keep up the good work."
    } else if (managerSpeedLevel === 'high') {
      managerComments =
        "You're making decent decisions and your pace is excellent. If only all our works were as fast as you."
    }
  } else if (managerQualityLevel === 'high') {
    if (managerSpeedLevel === 'low') {
      managerComments =
        "You're doing an excellent job of making decisions but you're way too slow. Speed up if you want to keep your job."
    } else if (managerSpeedLevel === 'medium') {
      managerComments =
        "You're doing an excellent job of making decisions, and at a decent pace. Keep up the good work."
    } else if (managerSpeedLevel === 'high') {
      managerComments =
        "You're making excellent decisions at a fast pace. Keep it up and we'll get you at raise at the end of the year."
    }
  }

  // let managerAgreementFeedbackArray = [
  //   "You're making too many decisions that are at odds with our policies. Keep it up and you'll be out of a job.",
  //   'Many of your decisions are at odds with our policies. Be more careful.',
  //   'Some of your decisions go against platform policy. Take a bit more care.',
  //   "You're doing a okay job with your decisions but there's room for improvement",
  //   "You're doing a great job of making sure content adheres to our policies.",
  // ]

  // // TODO calibrate
  // let managersAgreementArrayScores = [1, 3, 5, 10, 15]

  // let managerScore = GameSessionStore.disagreeWithManager
  // let managerFeedback = ''

  // // Assign manager level
  // for (let i = 0; i < managersAgreementArrayScores.length; i++) {
  //   if (managerScore > managersAgreementArrayScores[i]) {
  //     managerFeedback = managerAgreementFeedbackArray[i]
  //   }
  // }
  // managerComments += managerFeedback

  // if (
  //   GameSessionStore.issuesCompletedThisRound <= cardsPerRoundWarn &&
  //   GameSessionStore.issuesCompletedThisRound > cardsPerRoundFire
  // ) {
  //   // TODO: fix logic
  //   managerComments +=
  //     "<br><br>You're making decisions too slowly... move faster."
  // } else {
  //   managerComments +=
  //     "<br><br>You're doing a great job making decisions quickly."
  // }

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
      publicComments =
        'This is a disaster - half our users are accusing us of censorship and the other half say the platform is unsafe for anyone to use!'
    } else if (publicSafetyTier === 'medium') {
      publicComments =
        "Some users accuse us of being overzealous in our take-downs but we're keeping the most harmful content off the platform."
    } else if (publicSafetyTier === 'high') {
      publicComments =
        "We're doing a great job at keep the site safe for our users but it's coming at a cost: a lot of users are angry about us taking down their content."
    }
  } else if (publicFreeSpeechTier === 'medium') {
    if (publicSafetyTier === 'low') {
      publicComments =
        'The public is accusing us of having an unsafe platform. We need to turn that perception around if we want to stay in business.'
    } else if (publicSafetyTier === 'medium') {
      publicComments =
        "We're doing a decent job of balancing platform safety with free speech concerns, though not everyone is happy."
    } else if (publicSafetyTier === 'high') {
      publicComments =
        "We're doing an excellent job of keeping the site safe, though some users accuse us of overzealous moderation."
    }
  } else if (publicFreeSpeechTier === 'high') {
    if (publicSafetyTier === 'low') {
      publicComments =
        "Some users are lauding our commitment to free speech but there's a lot of unsafe content on our site and other users are fleeing."
    } else if (publicSafetyTier === 'medium') {
      publicComments =
        "We're doing a decent job of maintaining platform safety with the minimum amount of content takedowns."
    } else if (publicSafetyTier === 'high') {
      publicComments =
        "We're doing a fantastic job of keeping the platform safe while minimizing content removal; great work!"
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
