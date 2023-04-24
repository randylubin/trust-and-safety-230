import { reactive } from 'vue'

export const MetaGameStore = reactive({
  loaded: false,
  achievements: [],
  activeSession: false,
  numberOfSessions: 0,
  numberOfWins: 0,
  PlayerStatistics: {
    issuesProcessed: 0,
    appealsProcessed: 0,
    appealsAccepted: 0,
    appealsDenied: 0,
    highestRoundCompleted: 0,
  },
  arcsSeenButNotCompleted: [],
  arcsCompleted: [],
  showDevTools: false,
  loadSessionFromLocal() {
    const saveData = JSON.parse(localStorage.MetaGameStore)
    for (const [key, value] of Object.entries(saveData)) {
      this[key] = value
    }
    this.loaded = true
  },
  saveSessionToLocal() {
    localStorage.MetaGameStore = JSON.stringify({
      achievements: this.achievements,
      activeSession: this.activeSession,
      numberOfSessions: this.numberOfSessions,
      numberOfWins: this.numberOfWins,
      PlayerStatistics: this.PlayerStatistics,
      arcsSeenButNotCompleted: this.arcsSeenButNotCompleted,
      arcsCompleted: this.arcsCompleted,
      showDevTools: this.showDevTools,
    })
  },
  clearAchievements() {
    this.achievements = []
  },
})
