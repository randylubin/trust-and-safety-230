<script setup>
import { ref, toRefs } from 'vue'
import { MetaGameStore } from '../../stores/MetaGameStore'
import { GameSessionStore } from '../../stores/GameSessionStore'
import { IssueQueueStore } from '../../stores/IssueQueueStore'
import { onMounted } from 'vue'
import { event } from 'vue-gtag'
import AchievementShowcase from '../Misc/AchievementShowcase.vue'
import { GameDefaults } from '../../GameDefaults'

const subscreenIndex = ref(-1)

const managerHeader = ref('')
const gameoverTag = ref('')
const performanceRating = ref('')
const safetyRating = ref('')
const speechRating = ref('')

if (GameSessionStore.gameOverType.startsWith('GOOD')) {
  managerHeader.value = "We're Promoting You"
  gameoverTag.value = 'Promoted'
} else if (GameSessionStore.gameOverType == 'BAD-QUIT') {
  managerHeader.value = 'You quit'
  gameoverTag.value = 'You quit'
} else {
  managerHeader.value = "You're Fired"
  gameoverTag.value = "You're Fired"
}

// FINAL SCORE CALCULATIONS
// calculate initial score
if (GameSessionStore.currentRound < GameDefaults.finalRound) {
  // early endings
  if (GameSessionStore.gameOverType.startsWith('GOOD')) {
    performanceRating.value = 5
  } else {
    performanceRating.value = 1
  }
} else {
  // final round endings
  if (GameSessionStore.gameOverType.startsWith('GOOD')) {
    if (
      GameSessionStore.overallPerformance >=
      GameDefaults.overallPerformancePromote
    ) {
      performanceRating.value = 5
    } else if (
      GameSessionStore.overallPerformance >=
      GameDefaults.overallPerformancePraise
    ) {
      performanceRating.value = 4
    } else {
      performanceRating.value = 3
    }
  } else {
    // bad final ending
    if (GameSessionStore.overallPerformance <= 0) {
      performanceRating.value = 1
    } else {
      performanceRating.value = 2
    }
  }
}

// modify score based on public and calc public rating
let publicModifier = 0
if (GameSessionStore.publicSafety >= GameDefaults.publicPraiseLevel) {
  safetyRating.value = 'HIGH'
  publicModifier = 1
} else if (GameSessionStore.publicSafety > GameDefaults.publicWarnLevel) {
  safetyRating.value = 'MEDIUM'
} else {
  safetyRating.value = 'LOW'
  publicModifier = -1
}
if (GameSessionStore.publicFreeSpeech >= GameDefaults.publicPraiseLevel) {
  speechRating.value = 'HIGH'
  publicModifier = safetyRating.value !== 'LOW' ? 1 : -1
} else if (GameSessionStore.publicFreeSpeech > GameDefaults.publicWarnLevel) {
  speechRating.value = 'MEDIUM'
} else {
  speechRating.value = 'LOW'
  publicModifier = -1
}
performanceRating.value += publicModifier
performanceRating.value = Math.min(performanceRating.value, 5)
performanceRating.value = Math.max(performanceRating.value, 1)

onMounted(() => {
  subscreenIndex.value = 0
  event('game_over', {
    round: GameSessionStore.currentRound,
    reason: GameSessionStore.gameOverReason,
  })
})

const GameOverDescriptions = {
  'GOOD-QUALITYPROMO': {
    fullDescription: 'Promoted for competence, congrats!',
    socialShare: 'Promoted for competence, congrats!',
  },
  'GOOD-SENIORITYPROMO': {
    fullDescription: 'Promoted for seniority, congrats!',
    socialShare: 'Promoted for seniority, congrats!',
  },
  'BAD-FINALROUNDPERFORMANCE': {
    fullDescription: 'Fired for poor performance at end of game',
    socialShare: 'Fired for poor performance at end of game',
  },
  'BAD-EARLYPERFORMANCE': {
    fullDescription: 'Fired for poor performance',
    socialShare: 'Fired for poor performance',
  },
  'BAD-ROUNDQUALITY': {
    fullDescription: 'Fired for poor performance',
    socialShare: 'Fired for poor performance',
  },
  'BAD-TOOSLOW': {
    fullDescription: 'Too slow!',
    socialShare: 'Too slow!',
  },
  'BAD-CENSORSHIP': {
    fullDescription: 'Censorship accusations',
    socialShare: 'Censorship accusations',
  },
  'BAD-SAFETY': {
    fullDescription: 'Platform safety',
    socialShare: 'Platform safety',
  },
  'BAD-QUIT': {
    fullDescription: "I understand, it's a hard job and not for everyone!",
    socialShare: 'I quit!',
  },
  'BAD-ARC': {
    fullDescription: 'TK arc reason',
    socialShare: 'TK arc reason',
  },
}

const restartGame = function () {
  IssueQueueStore.resetAllData()
  GameSessionStore.resetAllData()
  console.log('starting session')
  GameSessionStore.showGameOver = false
  GameSessionStore.showHomescreen = false
  MetaGameStore.activeSession = true
  GameSessionStore.startNewSession()
  // location.reload()
}

const returnToHomeScreen = function () {
  IssueQueueStore.resetAllData()
  GameSessionStore.resetAllData()
  GameSessionStore.showGameOver = false
  GameSessionStore.showHomescreen = true
}

const populateClipboard = function (text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text) // for modern browsers
  } else {
    return new Promise((resolve, reject) => {
      // legacy for older browsers
      var textArea = document.createElement('textarea')
      textArea.value = text

      textArea.style.top = '0'
      textArea.style.left = '0'
      textArea.style.position = 'fixed'

      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        var successful = document.execCommand('copy')
      } catch (err) {
        document.body.removeChild(textArea)
        reject()
      }
      document.body.removeChild(textArea)
      if (successful) resolve()
      else reject()
    })
  }
}

const shareCallback = ref(false)

const shareResults = function () {
  const Chars = {
    Stars: {
      ON: '\u{2B50}',
      OFF: '\u{25FE}\u{FE0F}',
      SPECIAL: '\u{1F31F}',
    },
    Safety: {
      LOW: '\u{2620}\u{FE0F}',
      MEDIUM: '\u{2696}\u{FE0F}',
      HIGH: '\u{1F9BA}',
    },
    Speech: {
      LOW: '\u{1F910}',
      MEDIUM: '\u{2696}\u{FE0F}',
      HIGH: '\u{1F4E3}',
    },
    Achievements: {
      novicemod: '\u{1F949}',
      intermediatemod: '\u{1F948}',
      expertmod: '\u{1F947}',
      foryourreconsideration: '\u{1F504}',
      onsecondthought: '\u{1F914}',
      requestdenied: '\u{270B}',
      knowtheropes: '3\u{FE0F}\u{20E3}',
      hanginginthere: '5\u{FE0F}\u{20E3}',
      thelonghaul: '8\u{FE0F}\u{20E3}',
      ajobwelldone: '\u{1F31F}',
      daybyday: '\u{1F5D3}',
      notsofast: '\u{1F422}',
      lapseinjudgement: '\u{1F44E}',
      dontspeak: '\u{1F64A}',
      laissezfaire: '\u{1F648}',
      hailtothechief: '\u{1F5F3}',
      transitionteam: '\u{1F3DB}',
      bigpharma: '\u{1F48A}',
      modestmeans: '\u{1F51E}',
      modelbehavior: '\u{1F5BC}',
      culturewar: '\u{A9}',
      piercegate: '\u{1F4F0}',
      bullypulpit: '\u{1F92C}',
      goal: '\u{26BD}',
      robotuprising: '\u{1F916}',
    },
  }
  const linkText = `Play: ${GameDefaults.gameURL}`
  let text = `I ${
    GameSessionStore.gameOverType.startsWith('GOOD') ? 'won' : 'lost'
  } #ModeratorMayhem on Round ${GameSessionStore.currentRound}\n\n`
  text += GameOverDescriptions[GameSessionStore.gameOverType].socialShare
  text += '\nRating: '
  if (performanceRating.value === 5) {
    text += Chars.Stars.SPECIAL.repeat(5)
  } else {
    text += Chars.Stars.ON.repeat(performanceRating.value)
    text += Chars.Stars.OFF.repeat(5 - performanceRating.value)
  }
  text += `\nTotal reviews: ${GameSessionStore.issuesCompletedThisGame}\n\n`
  text += `Safety: ${Chars.Safety[safetyRating.value]}\n`
  text += `Speech: ${Chars.Speech[speechRating.value]}\n\n`
  if (GameSessionStore.achievementsUnlockedThisGame.length > 0) {
    text += 'Achievements: '
    for (const ach of GameSessionStore.achievementsUnlockedThisGame) {
      if (text.length < 270 - linkText.length - 2) {
        text += Chars.Achievements[ach]
      } else {
        break
      }
    }
    text += '\n\n'
  }
  text += linkText 

  populateClipboard(text).then(
    () => {
      shareCallback.value = 'success'
      setTimeout(() => (shareCallback.value = false), 2000)
    },
    () => {
      shareCallback.value = 'failure'
      setTimeout(() => (shareCallback.value = false), 2000)
    }
  )
}
</script>

<template>
  <div class="gameover-screen">
    <Transition
      name="subscreen"
      :duration="{ enter: 3300, leave: 200 }"
      mode="out-in"
    >
      <div
        v-if="subscreenIndex === 0"
        class="gameover-subscreen screen-manager"
      >
        <div class="subscreen-header-image manager">
          <img src="@/assets/svg/image-manager.svg" />
        </div>
        <div class="subscreen-header">{{ managerHeader }}</div>
        <div
          class="subscreen-text"
          v-html="
            GameOverDescriptions[GameSessionStore.gameOverType].fullDescription
          "
        ></div>
        <div class="subscreen-buttons">
          <button class="btn-basic" @click="subscreenIndex++">Continue</button>
        </div>
      </div>
      <div
        v-else-if="subscreenIndex === 1"
        class="round-subscreen screen-score"
      >
        <div class="big-label">
          Game Over
          <div class="completed-label">{{ gameoverTag }}</div>
        </div>
        <!-- <div class="score-label">{{ GameOverDescriptions[GameSessionStore.gameOverType].socialShare }}</div> -->
        <div class="score-display">
          <div class="score-stars">
            <div
              class="star"
              :class="{
                on: performanceRating >= n,
                off: performanceRating < n,
              }"
              :style="{
                'transition-delay': 0.9 + n * 0.1 + 's',
              }"
              v-for="n in 5"
              :key="'STAR-' + n"
            >
              <img
                src="@/assets/svg/icon-star.svg"
                :style="{
                  'transition-delay': 1.8 + n * 0.1 + 's',
                  'animation-delay': n * 0.2 + 's',
                }"
              />
            </div>
          </div>
          <!-- <div class="score-label">Performance Score</div> -->
          <div class="score-label">Total reviews: {{ GameSessionStore.issuesCompletedThisGame }} </div>
          <div class="score-label">Safety: {{ safetyRating }}</div>
          <div class="score-label">Speech: {{ speechRating }}</div>
        </div>
        <div
          class="subscreen-buttons subscreen-share"
          style="transition-delay: 2.9s"
        >
          <button
            class="btn-basic highlight alt"
            :class="{
              success: shareCallback === 'success',
              failure: shareCallback === 'failure',
            }"
            id="share-button"
            @click="shareResults"
          >
            Share Results
          </button>
        </div>
        <div class="subscreen-buttons" style="transition-delay: 3s">
          <button class="btn-basic shine" @click="subscreenIndex++">
            Continue
          </button>
        </div>
      </div>
      <div
        v-else-if="subscreenIndex === 2"
        class="round-subscreen screen-details"
      >
        <AchievementShowcase />
        <div class="survey-link">
          We'd love your feedback about playing Moderator Mayhem!<br />
          <a :href="GameDefaults.surveyURL" target="_blank">
            Take our survey &raquo;
          </a>
        </div>
        <div class="subscreen-buttons">
          <button class="btn-basic highlight shine" @click="restartGame()">
            New Game
          </button>
          <button class="btn-basic" @click="returnToHomeScreen()">
            Main Menu
          </button>
          <button class="btn-basic btn-back" @click="subscreenIndex--">
            Back
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.gameover-screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1005;

  box-sizing: border-box;
  padding: 2rem 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;

  background: var(--modal-bg-color);
}

.big-label {
  position: relative;
  font-family: var(--font-2);
  font-size: 7rem;
  line-height: 6.5rem;
  height: 13rem;
  margin-bottom: 3rem;
  text-transform: uppercase;
  font-weight: 900;
}

.completed-label {
  position: relative;
  top: -8rem;
  left: 30%;
  transform: scale(100%) rotateZ(-20deg);
  font-size: 1.6rem;
  line-height: 1.6rem;
  height: 1.6rem;
  width: 40%;
  padding: 0.7rem;
  background-color: var(--en-2d);
}

button#share-button {
  position: relative;
}

button#share-button::after {
  content: 'Score and stats copied to clipboard!';
  position: absolute;
  left: 5%;
  right: 5%;
  bottom: 130%;
  z-index: 100;
  font-family: var(--font-1);
  font-size: 1.6rem;
  text-transform: none;
  font-weight: 700;
  background: var(--button-alt-bg-color);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.7);
  opacity: 0;
  transform: translateY(1.5rem);
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}

button#share-button.success::after {
  transform: translateY(0);
  opacity: 1;
}

button#share-button.failure::after {
  content: 'Error copying to clipboard';
  transform: translateY(0);
  background: var(--takedown-bg-color);
  opacity: 1;
}

.subscreen-buttons {
  margin-bottom: 3rem;
  text-align: left;
}

div.screen-score .subscreen-share {
  margin-bottom: 0;
}

.subscreen-buttons:last-child {
  margin-bottom: 0;
}

.subscreen-buttons > button {
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

.survey-link {
  font-weight: 300;
  font-size: 1.8rem;
  line-height: 1.5;
  margin-bottom: 3rem;
  padding: 1.5rem;
  border: 0.2rem solid var(--button-highlight-bg-color);
  border-radius: 1.5rem;
}

.survey-link a {
  font-weight: 600;
}

.score-display {
  margin-bottom: 3.5rem;
  padding: 1.5rem;
  border: 0.2rem solid var(--button-alt-bg-color);
  border-radius: 1.5rem;
}
.score-stars {
  width: 90%;
  margin: 0 auto 1rem;
  display: flex;
  justify-content: space-between;
  column-gap: 1.5rem;
}

.score-stars .star {
  flex-grow: 1;
  background-image: url('@/assets/svg/icon-star-off.svg');
}

@keyframes star-pulse {
  0% {
    transform: scale(1) rotate(0);
  }
  20% {
    transform: scale(1.2);
  }
  40% {
    transform: scale(1);
  }
}

.star img {
  width: 100%;
  visibility: hidden;
}

.star.on img {
  visibility: visible;
  animation: star-pulse 1s ease-in-out infinite;
}

.score-label {
  font-family: var(--font-1);
  text-transform: uppercase;
  margin: 1.5rem;
  font-size: 2rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

/* Vue Transitions */

.subscreen-leave-to {
  opacity: 0;
  transform: scale(120%);
}

.subscreen-leave-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}

.subscreen-enter-from .big-label,
.subscreen-enter-from .subscreen-header {
  opacity: 0;
  transform: translateX(100%);
}

.subscreen-enter-from .subscreen-share,
.subscreen-enter-from .round-achievements,
.subscreen-enter-from .subscreen-buttons,
.subscreen-enter-from .subscreen-text,
.subscreen-enter-from .score-label,
.subscreen-enter-from .survey-link {
  opacity: 0;
  transform: translateY(3rem);
}

.subscreen-enter-active .big-label,
.subscreen-enter-active .subscreen-share,
.subscreen-enter-active .round-achievements,
.subscreen-enter-active .subscreen-text,
.subscreen-enter-active .subscreen-buttons,
.subscreen-enter-active .subscreen-header,
.subscreen-enter-active .score-label,
.subscreen-enter-active .survey-link {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

.subscreen-enter-from .score-stars .star {
  opacity: 0;
  transform: scale(0.5);
}

.subscreen-enter-active .score-stars .star {
  transition: opacity 0.2s linear, transform 0.2s linear;
}

.subscreen-enter-from .star.on img {
  opacity: 0;
  transform: scale(2.5) rotate(360deg);
}

.subscreen-enter-active .star.on img {
  transition: opacity 0.2s linear, transform 0.4s ease-out;
  animation: none !important;
}

.subscreen-enter-from.star.on img {
  animation: none !important;
}

.subscreen-enter-active .big-label {
  transition-delay: 0.3s, 0.3s;
}

.subscreen-enter-active .score-label {
  transition-duration: 0.5s;
  transition-delay: 1.9s;
}

.subscreen-enter-active .subscreen-share {
  transition-delay: 1.9s, 1.9s;
}

.subscreen-enter-active .round-achievements {
  transition-delay: 0.4s, 0.4s;
}
.subscreen-enter-active .survey-link {
  transition-delay: 0.6s, 0.6s;
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
