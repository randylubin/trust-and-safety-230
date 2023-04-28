<script setup>
import { ref, computed, onMounted } from 'vue'
import { GameSessionStore } from '../stores/GameSessionStore'
import { GameDefaults } from '../GameDefaults'
import { PossibleAchievementsList } from './Misc/AchievementLogic'
import AchievementShowcase from './Misc/AchievementShowcase.vue'
import AchievementPage from './Misc/AchievementPage.vue'

const interScreenIndex = ref(-1)
const triggerGameOver = ref(false)
const publicComments = ref('')
const managerComments = ref('')
const roundScreenReadyToShow = ref(false)
const managerApproval = ref(
  Math.round(
    100 -
      (100 * GameSessionStore.disagreeWithManagerThisRound) /
        GameSessionStore.issuesCompletedThisRound
  )
)

Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)]
}

onMounted(() => {
  interScreenIndex.value = 0
})

const overallPerformancePraise = GameDefaults.overallPerformancePraise
const overallPerformanceWarn = GameDefaults.overallPerformanceWarn
// const roundQualityPraise = GameDefaults.roundQualityPraise
// const roundQualityWarn = GameDefaults.roundQualityWarn
const roundQualityPraise = GameDefaults.roundQualityPraise
// 1 -
// (GameDefaults.roundQualityStartingState - GameDefaults.roundQualityPraise) /
//   ((GameDefaults.cardsPerRoundWarn + GameDefaults.cardsPerRoundPraise) / 2)
const roundQualityWarn = GameDefaults.roundQualityWarn
// 1 -
// (GameDefaults.roundQualityStartingState - GameDefaults.roundQualityWarn) /
//   ((GameDefaults.cardsPerRoundWarn + GameDefaults.cardsPerRoundPraise) / 2)
const cardsPerRoundPraise = GameDefaults.cardsPerRoundPraise
const cardsPerRoundWarn = GameDefaults.cardsPerRoundWarn
const cardsPerRoundFire = GameDefaults.cardsPerRoundFire
const publicPraiseLevel = GameDefaults.publicPraiseLevel
const publicWarnLevel = GameDefaults.publicWarnLevel

// Manager feedback calibration
let roundQualityLevel = 'medium'
let managerSpeedLevel = 'medium'

// let roundQualityNumber =
//   GameDefaults.roundQualityStartingState -
//   GameSessionStore.disagreeWithManagerThisRound // TODO update
let roundQualityNumber = managerApproval.value / 100
console.log('roundQuality:', roundQualityNumber)
console.log('praisePercent:', roundQualityPraise)
console.log('warn percent:', roundQualityWarn)
let managerSpeedNumber = GameSessionStore.issuesCompletedThisRound

if (roundQualityNumber <= roundQualityWarn) {
  roundQualityLevel = 'low'
} else if (roundQualityNumber < roundQualityPraise) {
  roundQualityLevel = 'medium'
} else {
  roundQualityLevel = 'high'
}

if (managerSpeedNumber <= cardsPerRoundWarn) {
  managerSpeedLevel = 'low'
} else if (managerSpeedNumber < cardsPerRoundPraise) {
  managerSpeedLevel = 'medium'
} else {
  managerSpeedLevel = 'high'
}

// GENERATE FEEDBACK (SEEN IF NOT GAME OVER) AND UPDATE PERFORMANCE TRACK
let performanceAdjustment = 0
if (GameSessionStore.currentRound === 0) {
  managerComments.value =
    "After each round, you'll get feedback from me, your manager, about the speed and quality of your decisions."
} else if (roundQualityLevel === 'low') {
  if (managerSpeedLevel === 'low') {
    managerComments.value =
      "You're <strong>too slow</strong> and you're making <strong>poor decisions</strong>. Get your act together or you're fired."
    performanceAdjustment -= 3
  } else if (managerSpeedLevel === 'medium') {
    managerComments.value =
      "You're moving at an <strong>okay pace</strong> but you need to improve your <strong>poor decision quality</strong>."
    performanceAdjustment -= 2
  } else if (managerSpeedLevel === 'high') {
    managerComments.value =
      "You've got a <strong>great pace</strong> but <strong>poor decision quality</strong>. Slow down and make sure your decisions align with our policies."
    performanceAdjustment -= 1
  }
} else if (roundQualityLevel === 'medium') {
  if (managerSpeedLevel === 'low') {
    managerComments.value =
      "You've got <strong>okay decision quality</strong> but you're going <strong>too slow</strong>. You'll need to make faster decisions if you want to keep your job."
    performanceAdjustment -= 2
  } else if (managerSpeedLevel === 'medium') {
    managerComments.value = [
      "You're making <strong>okay decisions</strong> at an <strong>okay pace</strong>; keep up the good work.",
      'Nice work - keep it up!',
    ].sample()
  } else if (managerSpeedLevel === 'high') {
    managerComments.value =
      "You're making <strong>okay decisions</strong> at an <strong>excellent pace</strong>. If only all our workers were as fast as you."
    performanceAdjustment += 1
  }
} else if (roundQualityLevel === 'high') {
  if (managerSpeedLevel === 'low') {
    managerComments.value =
      "You're making <strong>excellent decisions</strong> but you're way <strong>too slow</strong>. Speed up if you want to keep your job."
    performanceAdjustment -= 1
  } else if (managerSpeedLevel === 'medium') {
    managerComments.value =
      "You're making <strong>excellent decisions</strong>, and at an <strong>okay pace</strong>. Keep up the good work."
    performanceAdjustment += 1
  } else if (managerSpeedLevel === 'high') {
    managerComments.value =
      "You're making <strong>excellent decisions</strong> at a <strong>fast pace</strong>. Keep it up and we'll get you a raise at the end of the year."
    performanceAdjustment += 2
  }
}

if (!GameSessionStore.interRoundProcessingComplete) {
  GameSessionStore.overallPerformance += performanceAdjustment
  console.log('adjusting performance by', performanceAdjustment)
}

// OVERALL PERFORMANCE PRAISE OR WARN
// Two message options if score is decreasing (based on why), otherwise talk about still being on thin ice
if (GameSessionStore.overallPerformance >= overallPerformancePraise) {
  console.log('on track for promotion:', GameSessionStore.overallPerformance)
  managerComments.value = [
    "You're on track for promotion. Just keep up the good work!",
    "We're all impressed with your work - I've made a note in your file.",
    "You've got management potential - keep it up!",
  ].sample()
} else if (GameSessionStore.overallPerformance <= overallPerformanceWarn) {
  if (performanceAdjustment < 0) {
    if (roundQualityLevel == 'low') {
      managerComments.value = [
        "If you don't improve your decision quality soon, I will have to let you go.",
        "You're making way too many mistakes. Shape up or ship out.",
        "I'm worried that you're not taking your job seriously. This work matters.",
      ].sample()
      console.log('manager warn quality', GameSessionStore.overallPerformance)
    } else {
      managerComments.value = [
        'You need to increase your decision speed or I will have to replace you with someone faster.',
        "You're way too slow. Pick up the pace or you're outta here.",
      ].sample()
      console.log('manager warn slow', GameSessionStore.overallPerformance)
    }
  } else {
    managerComments.value = [
      'You did better this round but you are still on thin ice.',
      "Not bad, but I'm still keeping an eye on your performance.",
    ].sample()
    console.log('manager thin ice', GameSessionStore.overallPerformance)
  }
} else {
  console.log('performance is fine', GameSessionStore.overallPerformance)
}

// Public Check-in

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

if (GameSessionStore.currentRound === 0) {
  publicComments.value =
    "You'll also get information about the broader public perception of the TrustHive platform."
} else if (publicFreeSpeechTier === 'low') {
  if (publicSafetyTier === 'low') {
    publicComments.value =
      'This is a disaster - half our users are accusing us of censorship and the other half say that TrustHive is unsafe for anyone to use!'
  } else if (publicSafetyTier === 'medium') {
    publicComments.value =
      "Some users are accusing TrustHive of being overzealous in our take-downs but we're keeping the most harmful content off the platform."
  } else if (publicSafetyTier === 'high') {
    publicComments.value =
      "We're doing a great job at keeping TrustHive safe for our users but it's coming at a cost: a lot of users are angry about us taking down their content."
  }
} else if (publicFreeSpeechTier === 'medium') {
  if (publicSafetyTier === 'low') {
    publicComments.value =
      'The public is accusing TrustHive of running an unsafe platform. We need to turn that perception around if we want to stay in business.'
  } else if (publicSafetyTier === 'medium') {
    publicComments.value = [
      "We're doing a decent job of balancing platform safety with free speech concerns, though not everyone is happy.",
      "It's impossible to please everyone but we're doing a decent job of handling safety and free speech.",
    ].sample()
  } else if (publicSafetyTier === 'high') {
    publicComments.value =
      "We're doing an excellent job of keeping TrustHive safe, though some users accuse us of overzealous moderation."
  }
} else if (publicFreeSpeechTier === 'high') {
  if (publicSafetyTier === 'low') {
    publicComments.value =
      "Some users are lauding TrustHive's commitment to free speech but there's a lot of unsafe content on our site and other users are fleeing."
  } else if (publicSafetyTier === 'medium') {
    publicComments.value =
      "We're doing a decent job of maintaining TrustHive safety with the minimum amount of content takedowns."
  } else if (publicSafetyTier === 'high') {
    publicComments.value =
      "We're doing a fantastic job of keeping TrustHive safe while minimizing content removal; great work!"
  }
}

// CHECK FOR GAME OVER
// TODO FIX LOGIC AND CONTENT
let gameOverReason = []
let gameOverType = 'BAD'
if (
  GameSessionStore.overallPerformance >= GameDefaults.overallPerformancePromote
) {
  gameOverReason.push('Promoted for competence, congrats!')
  gameOverType = 'GOOD-QUALITYPROMO'
  GameSessionStore.registerAchievement('ajobwelldone')
} else if (GameSessionStore.currentRound == GameDefaults.finalRound) {
  if (
    GameSessionStore.overallPerformance > GameDefaults.overallPerformanceWarn
  ) {
    gameOverReason.push('Promoted for seniority, congrats!')
    gameOverType = 'GOOD-SENIORITYPROMO'
    GameSessionStore.registerAchievement('daybyday')
  } else {
    gameOverReason.push('Fired for poor performance at end of game')
    gameOverType = 'BAD-FINALROUNDPERFORMANCE'
    GameSessionStore.registerAchievement('lapseinjudgement')
  }
} else if (GameSessionStore.overallPerformance <= 0) {
  gameOverReason.push('Fired for poor performance')
  gameOverType = 'BAD-EARLYPERFORMANCE'
  GameSessionStore.registerAchievement('lapseinjudgement')
} else if (managerApproval.value <= GameDefaults.roundQualityFire) {
  gameOverReason.push('Fired for poor performance')
  gameOverType = 'BAD-ROUNDQUALITY'
  GameSessionStore.registerAchievement('lapseinjudgement')
} else if (GameSessionStore.issuesCompletedThisRound <= cardsPerRoundFire) {
  gameOverReason.push('Too slow!')
  gameOverType = 'BAD-TOOSLOW'
  GameSessionStore.registerAchievement('notsofast')
} else if (GameSessionStore.publicFreeSpeech == 0) {
  gameOverReason.push('Censorship accusations')
  gameOverType = 'BAD-CENSORSHIP'
  GameSessionStore.registerAchievement('dontspeak')
} else if (GameSessionStore.publicSafety == 0) {
  gameOverReason.push('Platform safety')
  gameOverType = 'BAD-SAFETY'
  GameSessionStore.registerAchievement('laissezfaire')
} else if (GameSessionStore.endGameAtEndOfRound) {
  // from ARC
  gameOverReason.push(GameSessionStore.endGameAtEndOfRound)
  gameOverType = 'BAD-ARC'
}

if (gameOverReason.length && GameSessionStore.currentRound != 0) {
  triggerGameOver.value = true
  GameSessionStore.betweenRounds = false
  console.log(gameOverReason)
  GameSessionStore.endGame(gameOverReason, gameOverType)
} else {
  roundScreenReadyToShow.value = true
}

GameSessionStore.interRoundProcessingComplete = true
GameSessionStore.saveSessionToLocal()

const quitSession = function () {
  triggerGameOver.value = true
  GameSessionStore.betweenRounds = false
  console.log('player quit')
  GameSessionStore.endGame('player quit', 'BAD-QUIT')
}
</script>

<template>
  <div class="round-screen" v-if="roundScreenReadyToShow">
    <Transition
      name="subscreen"
      :duration="{ enter: 1400, leave: 200 }"
      mode="out-in"
    >
      <div
        v-if="interScreenIndex === 0"
        class="round-subscreen screen-achievements"
      >
        <div class="big-round-label">
          {{
            GameSessionStore.currentRound === 0
              ? 'Tutorial'
              : 'Round ' + GameSessionStore.currentRound
          }}
          <div class="completed-label">Complete</div>
        </div>
        <div class="round-statistics" v-if="GameSessionStore.currentRound != 0">
          <div class="issues-completed">
            Decisions Made: {{ GameSessionStore.issuesCompletedThisRound }}
          </div>
          <div class="manager-approval">
            Policy Alignment: {{ managerApproval }}%
          </div>
        </div>
        <AchievementShowcase />
        <div class="subscreen-buttons">
          <button class="btn-basic" @click="interScreenIndex++">
            Continue
          </button>
        </div>
      </div>
      <div
        v-else-if="interScreenIndex === 1"
        class="round-subscreen screen-manager"
      >
        <div class="subscreen-header-image manager">
          <img src="@/assets/svg/image-manager.svg" />
        </div>
        <div class="subscreen-header">Employee Evaluation</div>
        <div class="subscreen-text" v-html="managerComments"></div>
        <div class="subscreen-buttons">
          <button class="btn-basic" @click="interScreenIndex++">
            {{
              GameSessionStore.currentRound === 0
                ? 'Got it!'
                : "I'll do my best!"
            }}
          </button>
          <button class="btn-basic btn-back" @click="interScreenIndex--">
            Back
          </button>
        </div>
      </div>
      <div
        v-else-if="interScreenIndex === 2"
        class="round-subscreen screen-public"
      >
        <div class="subscreen-header-image public">
          <img src="@/assets/svg/image-public.svg" />
        </div>
        <div class="subscreen-header">Public Opinion</div>
        <div class="subscreen-text" v-html="publicComments"></div>
        <div class="subscreen-buttons">
          <button class="btn-basic" @click="interScreenIndex++">
            {{ GameSessionStore.currentRound === 0 ? 'Got it!' : 'Continue' }}
          </button>
          <button class="btn-basic btn-back" @click="interScreenIndex--">
            Back
          </button>
        </div>
      </div>
      <div
        v-else-if="interScreenIndex === 3"
        class="round-subscreen screen-nextround"
      >
        <div class="big-round-label">
          Round {{ GameSessionStore.currentRound + 1 }}
        </div>
        <div class="subscreen-text">
          Ready for your
          {{ GameSessionStore.currentRound === 0 ? 'first' : 'next' }} shift?
        </div>
        <div class="subscreen-buttons">
          <button
            class="btn-basic highlight"
            @click="GameSessionStore.startNewRound()"
          >
            Let's Go!
          </button>
          <button
            v-if="GameSessionStore.currentRound > 0"
            class="btn-basic"
            @click="quitSession()"
          >
            I quit!
          </button>
          <button class="btn-basic btn-back" @click="interScreenIndex--">
            Back
          </button>
        </div>
      </div>
    </Transition>
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
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;

  background: var(--modal-bg-color);
}

.big-round-label {
  position: relative;
  font-family: var(--font-2);
  font-size: 6rem;
  line-height: 6rem;
  height: 6rem;
  margin-bottom: 3rem;
  text-transform: uppercase;
  font-weight: 900;
}

.completed-label {
  position: relative;
  top: -4.5rem;
  left: 30%;
  transform: scale(100%) rotateZ(-20deg);
  font-size: 1.6rem;
  line-height: 1.6rem;
  height: 1.6rem;
  width: 40%;
  padding: 0.7rem;
  background-color: var(--en-2d);
}

.round-statistics {
  font-size: 2.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 3rem;
}

.subscreen-buttons > button {
  display: block;
  width: 100%;
  margin-bottom: 1rem;
}

.subscreen-header-image {
  width: 100%;
  overflow: hidden;
}

.subscreen-header-image > img {
  display: block;
  margin: 0 auto;
  width: 95%;
}

.subscreen-header {
  position: relative;
  z-index: 200;
  font-family: var(--font-2);
  font-size: 2rem;
  line-height: 2rem;
  height: 2rem;
  width: 100%;
  font-weight: 700;
  text-transform: uppercase;
  background-color: var(--en-2d);
  background-image: var(--fade-bg-gradient);
  box-shadow: 0 -0.5rem 3rem rgba(0, 0, 0, 0.5);
  padding: 1rem 0;
  margin: 0 auto 2rem;
}

.subscreen-header-image + .subscreen-header {
  position: relative;
  top: -2rem;
  margin-bottom: 0;
}

.subscreen-text {
  font-weight: 300;
  font-size: 2.2rem;
  margin-bottom: 2.5rem;
}

.big-round-label + .subscreen-text {
  margin-bottom: 3.5rem;
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

/* Vue Transitions */

.subscreen-leave-to {
  opacity: 0;
  transform: scale(120%);
}

.subscreen-leave-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}

.subscreen-enter-from .big-round-label,
.subscreen-enter-from .subscreen-header {
  opacity: 0;
  transform: translateX(100%);
}

.subscreen-enter-from .round-statistics,
.subscreen-enter-from .round-achievements,
.subscreen-enter-from .subscreen-buttons,
.subscreen-enter-from .subscreen-text {
  opacity: 0;
  transform: translateY(3rem);
}

.subscreen-enter-active .big-round-label,
.subscreen-enter-active .round-statistics,
.subscreen-enter-active .round-achievements,
.subscreen-enter-active .subscreen-text,
.subscreen-enter-active .subscreen-buttons,
.subscreen-enter-active .subscreen-header {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

.subscreen-enter-active .big-round-label {
  transition-delay: 0.3s, 0.3s;
}

.subscreen-enter-active .round-statistics {
  transition-delay: 0.9s, 0.9s;
}

.subscreen-enter-active .round-achievements {
  transition-delay: 1s, 1s;
}

.subscreen-enter-from .completed-label {
  opacity: 0;
  transform: scale(300%) rotateZ(45deg);
}

.subscreen-enter-active .completed-label {
  transition: opacity 0.3s ease-in, transform 0.3s ease-in;
  transition-delay: 0.6s, 0.6s;
}

.subscreen-enter-active .subscreen-header {
  transition-delay: 0;
}

.subscreen-enter-from .subscreen-header-image img {
  transform: translateY(100%);
}

.subscreen-enter-active .subscreen-header-image img {
  transition: transform 0.4s ease-out;
  transition-delay: 0.2s;
}

.subscreen-enter-active .subscreen-text {
  transition-delay: 0.5s;
}

.subscreen-enter-active .subscreen-buttons {
  transition-delay: 1.1s, 1.1s;
}
</style>
