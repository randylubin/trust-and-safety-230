import { reactive } from 'vue'
import { ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'

import { IssueQueueStore } from './IssueQueueStore'

const timeRemaining = ref(100)
const gameIsPaused = ref(true)

const { pause, resume, isActive } = useIntervalFn(() => {
  if (!gameIsPaused.value && timeRemaining.value > 0) {
    timeRemaining.value--

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
  showTutorial: true,
  initialTimeInRound: 100,
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
    if (this.showTutorial) {
      IssueQueueStore.startTutorial()
    } else {
      this.currentRound = 1
      IssueQueueStore.startNewRound()
    }
    gameIsPaused.value = false
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
