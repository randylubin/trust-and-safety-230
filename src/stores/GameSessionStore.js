import { reactive } from 'vue'
import { ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { GameDefaults } from '../GameDefaults'

import { MetaGameStore } from './MetaGameStore'
import { IssueQueueStore } from './IssueQueueStore'

import { event } from 'vue-gtag'

const gameIsPaused = ref(true)

const timeRemaining = ref(GameDefaults.roundLength)
const extraTimeForLastCard = GameDefaults.extraTimeForLastCard
const genericDrawLikelihood = GameDefaults.genericDrawLikelihood

const { pause, resume, isActive } = useIntervalFn(() => {
  let tickDuration = GameSessionStore.slowMode ? GameDefaults.slowModeTick : 1

  if (
    !gameIsPaused.value &&
    !IssueQueueStore.interstitialShown &&
    (timeRemaining.value > 0 || GameSessionStore.currentRound == 0)
  ) {
    timeRemaining.value -= tickDuration

    if (timeRemaining.value % 1 == 0) {
      let queueStartedEmpty = !IssueQueueStore.currentIssueQueue.length

      // Add follow-up and appeals cards to current queue
      let followupsAdded = false

      if (IssueQueueStore.unprocessedFollowUps) {
        for (let i = 0; i < IssueQueueStore.unprocessedFollowUps.length; i++) {
          let issue = IssueQueueStore.unprocessedFollowUps[i]

          if (issue.insertTime >= timeRemaining.value && !issue.processed) {
            IssueQueueStore.addIssueToCurrentQueue(
              JSON.parse(JSON.stringify(issue.issueObject))
            )

            IssueQueueStore.unprocessedFollowUps[i].processed = true

            followupsAdded = true
          }
        }
      }

      // ADD GENERICS OVER TIME
      if (
        Math.random() < genericDrawLikelihood &&
        GameSessionStore.currentRound != 0 &&
        !followupsAdded
      ) {
        IssueQueueStore.addRandomIssue()
      }

      // handle a previously empty queue
      if (queueStartedEmpty && IssueQueueStore.currentIssueQueue.length) {
        IssueQueueStore.startNextCard()
      }
    }
  } else if (
    !gameIsPaused.value &&
    !IssueQueueStore.interstitialShown &&
    timeRemaining.value > extraTimeForLastCard
  ) {
    timeRemaining.value -= tickDuration
  } else if (
    timeRemaining.value == extraTimeForLastCard &&
    GameSessionStore.currentRound != 0
  ) {
    // TODO - handle last card if no action taken
    IssueQueueStore.endRound()
  }
}, 1000)

export const GameSessionStore = reactive({
  currentRound: 0,
  initialTimeInRound: GameDefaults.roundLength,
  slowMode: false,
  timeRemaining: timeRemaining,
  issuesCompletedThisRound: 0,
  issuesCompletedThisGame: 0,
  gameIsPaused: gameIsPaused,
  betweenRounds: false,
  // moderationSpeed: 5,
  // moderationQuality: 5,
  // publicPerception: 5,
  overallPerformance: GameDefaults.overallPerformanceStartingState,
  agreeWithManager: 0,
  disagreeWithManager: 0,
  disagreeWithManagerThisRound: 0,
  roundQuality: GameDefaults.roundQualityStartingState,
  publicSafety: 5,
  publicFreeSpeech: 5,
  showGameOver: false,
  gameOverReason: '',
  endGameAtEndOfRound: null,
  interRoundProcessingComplete: false,
  showAbout: false,
  achievementsUnlockedThisSession: [],
  pauseTimer: function () {
    pause
  },
  resumeTimer: function () {
    resume
  },
  timesUp: function (timesUpBoolean) {
    if (timesUpBoolean) {
      this.timeRemaining = 0
    }
  },
  startNewSession() {
    if (this.showTutorial) {
      IssueQueueStore.startTutorial()
    } else {
      this.currentRound = 1
      IssueQueueStore.startNewRound()
    }
    gameIsPaused.value = false
  },
  startNewRound() {
    GameSessionStore.currentRound++
    GameSessionStore.interRoundProcessingComplete = false
    event('start_round', { round: GameSessionStore.currentRound })
    GameSessionStore.timeRemaining = GameSessionStore.initialTimeInRound // TODO

    // RESET PER-ROUND STATS
    GameSessionStore.issuesCompletedThisRound = 0
    GameSessionStore.disagreeWithManagerThisRound = 0
    GameSessionStore.roundQuality = GameDefaults.roundQualityStartingState

    // Construct Card Queue
    IssueQueueStore.startNewRound()
  },
  loadSessionFromLocal() {
    const saveData = JSON.parse(localStorage.GameSessionStore)
    for (const [key, value] of Object.entries(saveData)) {
      this[key] = value
    }
  },
  saveSessionToLocal() {
    localStorage.GameSessionStore = JSON.stringify({
      currentRound: this.currentRound,
      timeRemaining: this.timeRemaining,
      issuesCompletedThisRound: this.issuesCompletedThisRound,
      issuesCompletedThisGame: this.issuesCompletedThisGame,
      gameIsPaused: this.gameIsPaused,
      betweenRounds: this.betweenRounds,
      // moderationSpeed: this.moderationSpeed,
      // moderationQuality: this.moderationQuality,
      // agreeWithManager: this.agreeWithManager,
      overallPerformance: this.overallPerformance,
      disagreeWithManager: this.disagreeWithManager,
      disagreeWithManagerThisRound: this.disagreeWithManagerThisRound,
      roundQuality: this.roundQuality,
      publicPerception: this.publicPerception,
      publicSafety: this.publicSafety,
      publicFreeSpeech: this.publicFreeSpeech,
      showGameOver: this.showGameOver,
      endGameAtEndOfRound: this.endGameAtEndOfRound,
      gameOverReason: this.gameOverReason,
      interRoundProcessingComplete: this.interRoundProcessingComplete,
      achievementsUnlockedThisSession: this.achievementsUnlockedThisSession,
      slowMode: this.slowMode,
    })
  },
  triggerPostRound() {
    if (
      this.moderationQuality * this.moderationSpeed * this.publicPerception ==
      0 // TODO update formula for ending the game
    ) {
      this.showGameOver = true
    } else {
      this.timeRemaining = 0
      this.betweenRounds = true
      this.interRoundProcessingComplete = false
    }
  },
  endGame(gameOverReason) {
    this.gameOverReason = gameOverReason
    this.showGameOver = true
    this.betweenRounds = false
    MetaGameStore.activeSession = false
    this.pauseTimer()
    // TODO update other MetaGame data
  },
  toggleSlowMode() {
    this.slowMode = !this.slowMode
  },
})
