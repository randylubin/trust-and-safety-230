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
      // TODO - maybe recalibrate likelihood based on round (e.g. less likely during a big Grab Bag like BETAAI)
      let drawLikelihood = GameDefaults.genericDrawLikelihood
      if (
        GameSessionStore.currentRound == 0 ||
        GameSessionStore.currentRound == GameDefaults.betaAIRound ||
        GameSessionStore.currentRound >= GameDefaults.betterAIRound
      ) {
        drawLikelihood = GameDefaults.genericDrawDuringHeavyRounds
      }
      if (
        Math.random() < drawLikelihood &&
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
  overallPerformance: GameDefaults.overallPerformanceStartingState,
  agreeWithManager: 0,
  disagreeWithManager: 0,
  disagreeWithManagerThisRound: 0,
  roundQuality: GameDefaults.roundQualityStartingState,
  publicSafety: GameDefaults.publicStartingState,
  publicFreeSpeech: GameDefaults.publicStartingState,
  showGameOver: false,
  gameOverReason: '',
  gameOverType: '',
  endGameAtEndOfRound: null,
  interRoundProcessingComplete: false,
  showAbout: false,
  showAchievements: false,
  showPolicies: false,
  showHomescreen: false,
  achievementsUnlockedThisRound: [],
  achievementsUnlockedThisGame: [],
  resetAllData() {
    this.currentRound = 0
    this.initialTimeInRound = GameDefaults.roundLength
    this.timeRemaining = GameDefaults.roundLength
    this.issuesCompletedThisRound = 0
    this.issuesCompletedThisGame = 0
    this.gameIsPaused = gameIsPaused
    this.betweenRounds = false
    this.overallPerformance = GameDefaults.overallPerformanceStartingState
    this.agreeWithManager = 0
    this.disagreeWithManager = 0
    this.disagreeWithManagerThisRound = 0
    this.roundQuality = GameDefaults.roundQualityStartingState
    this.publicSafety = GameDefaults.publicStartingState
    this.publicFreeSpeech = GameDefaults.publicStartingState
    this.showGameOver = false
    this.gameOverReason = ''
    this.gameOverType = ''
    this.endGameAtEndOfRound = null
    this.interRoundProcessingComplete = false
    this.showAbout = false
    this.achievementsUnlockedThisRound = []
    this.achievementsUnlockedThisGame = []
  },
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
    GameSessionStore.timeRemaining =
      GameSessionStore.currentRound > 0
        ? GameSessionStore.initialTimeInRound
        : GameSessionStore.initialTimeInRound * 2

    // RESET PER-ROUND STATS
    GameSessionStore.issuesCompletedThisRound = 0
    GameSessionStore.disagreeWithManagerThisRound = 0
    GameSessionStore.roundQuality = GameDefaults.roundQualityStartingState
    GameSessionStore.achievementsUnlockedThisRound = []

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
      gameOverType: this.gameOverType,
      achievementsUnlockedThisGame: this.achievementsUnlockedThisGame,
      achievementsUnlockedThisRound: this.achievementsUnlockedThisRound,
    })
  },
  triggerPostRound() {
    this.timeRemaining = 0
    this.betweenRounds = true
    this.interRoundProcessingComplete = false
  },
  endGame(gameOverReason, gameOverType) {
    this.gameOverReason = gameOverReason
    this.gameOverType = gameOverType
    this.showGameOver = true
    this.betweenRounds = false
    MetaGameStore.activeSession = false
    MetaGameStore.numberOfSessionsFinished++
    if (gameOverType.startsWith('GOOD')) {
      MetaGameStore.numberOfWins++
    } else {
      MetaGameStore.numberOfLosses++
    }
    this.pauseTimer()
  },
  toggleSlowMode() {
    this.slowMode = !this.slowMode
  },
  registerAchievement(id) {
    if (id) {
      if (!MetaGameStore.achievements.includes(id)) {
        this.achievementsUnlockedThisRound.push(id)
        this.achievementsUnlockedThisGame.push(id)
        MetaGameStore.achievements.push(id)
        event('achievement_unlocked', {
          achievement: id,
        })
      }
    }
  },
})
