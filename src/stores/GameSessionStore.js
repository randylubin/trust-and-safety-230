import { reactive } from 'vue'
import { ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'

import { IssueQueueStore } from './IssueQueueStore'

const timeRemaining = ref(100)
const gameIsPaused = ref(true)

const { pause, resume, isActive } = useIntervalFn(() => {
  if (!gameIsPaused.value && timeRemaining.value > 0) {
    timeRemaining.value--

    // TODO add cards over time

    // Add follow up cards to current queue
    if (IssueQueueStore.unprocessedFollowUps) {
      for (let i = 0; i < IssueQueueStore.unprocessedFollowUps.length; i++) {
        let issue = IssueQueueStore.unprocessedFollowUps[i]

        if (issue.insertTime >= timeRemaining.value && !issue.processed) {
          IssueQueueStore.addIssueToCurrentQueue(
            JSON.parse(JSON.stringify(issue.issueObject))
          )

          IssueQueueStore.unprocessedFollowUps[i].processed = true
          // TODO pay attention to insert order, right now it adds to end
        }
      }
    }

    // ADD GENERICS OVER TIME
    if (Math.random() < 0.33 && GameSessionStore.currentRound != 0) {
      IssueQueueStore.addRandomIssue()
    }
  }
}, 1000)

export const GameSessionStore = reactive({
  currentRound: 0,
  initialTimeInRound: 100,
  timeRemaining: timeRemaining,
  issuesCompletedThisRound: 0,
  issuesCompletedThisGame: 0,
  gameIsPaused: gameIsPaused,
  betweenRounds: false,
  moderationSpeed: 5,
  moderationQuality: 5,
  publicPerception: 5,
  agreeWithManager: 0,
  disagreeWithManager: 0,
  showGameOver: false,
  showAbout: false,
  publicSafety: 5,
  publicFreeSpeech: 5,
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
    // TODO
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
    GameSessionStore.timeRemaining = GameSessionStore.initialTimeInRound // TODO

    // RESET PER-ROUND STATS
    GameSessionStore.issuesCompletedThisRound = 0

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
      moderationSpeed: this.moderationSpeed,
      moderationQuality: this.moderationQuality,
      agreeWithManager: this.agreeWithManager,
      disagreeWithManager: this.disagreeWithManager,
      publicPerception: this.publicPerception,
      publicSafety: this.publicSafety,
      publicFreeSpeech: this.publicFreeSpeech,
      achievementsUnlockedThisSession: this.achievementsUnlockedThisSession,
    })
  },
  triggerPostRound() {
    // TODO
    if (
      this.moderationQuality * this.moderationSpeed * this.publicPerception ==
      0 // TODO update formula
    ) {
      this.showGameOver = true
    } else {
      this.timeRemaining = 0
      this.betweenRounds = true
    }
  },
})
