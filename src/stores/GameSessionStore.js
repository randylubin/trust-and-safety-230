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
          IssueQueueStore.currentIssueQueue.push(
            JSON.parse(JSON.stringify(issue.issueObject))
          )

          IssueQueueStore.unprocessedFollowUps[i].processed = true
          // TODO pay attention to insert order, right now it adds to end
        }
      }
    }

    // ADD GENERICS OVER TIME
    if (Math.random() < 0.33) {
      IssueQueueStore.addRandomIssue()
    }
  }
}, 1000)

export const GameSessionStore = reactive({
  currentRound: 0,
  timeRemaining: timeRemaining,
  gameIsPaused: gameIsPaused,
  betweenRounds: false,
  moderationSpeed: 5,
  moderationQuality: 5,
  publicPerception: 5,
  showGameOver: false,
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
    IssueQueueStore.startNewRound()
    gameIsPaused.value = false
  },
  loadSessionFromLocal() {
    this.currentRound = JSON.parse(localStorage.GameSessionStore).currentRound
    this.timeRemaining = JSON.parse(localStorage.GameSessionStore).timeRemaining
    this.gameIsPaused = JSON.parse(localStorage.GameSessionStore).gameIsPaused
    this.betweenRounds = JSON.parse(localStorage.GameSessionStore).betweenRounds
    this.moderationSpeed = JSON.parse(
      localStorage.GameSessionStore
    ).moderationSpeed
    this.moderationQuality = JSON.parse(
      localStorage.GameSessionStore
    ).moderationQuality
    this.publicPerception = JSON.parse(
      localStorage.GameSessionStore
    ).publicPerception
  },
  saveSessionToLocal() {
    localStorage.GameSessionStore = JSON.stringify({
      currentRound: this.currentRound,
      timeRemaining: this.timeRemaining,
      gameIsPaused: this.gameIsPaused,
      betweenRounds: this.betweenRounds,
      moderationSpeed: this.moderationSpeed,
      moderationQuality: this.moderationQuality,
      publicPerception: this.publicPerception,
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
