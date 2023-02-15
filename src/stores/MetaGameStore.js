import { reactive } from 'vue'

export const MetaGameStore = reactive({
  loaded: false,
  achievements: [],
  activeSession: false,
  numberOfSessions: 0,
  numberOfWins: 0,
  arcsSeenButNotCompleted: [],
  arcsCompleted: [],
  showDevTools: false,
  loadSessionFromLocal() {
    this.achievements = JSON.parse(localStorage.MetaGameStore).achievements
    this.activeSession = JSON.parse(localStorage.MetaGameStore).activeSession
    this.numberOfSessions = JSON.parse(
      localStorage.MetaGameStore
    ).numberOfSessions
    this.numberOfWins = JSON.parse(localStorage.MetaGameStore).numberOfWins
    this.arcsSeenButNotCompleted = JSON.parse(
      localStorage.MetaGameStore
    ).arcsSeenButNotCompleted
    this.arcsCompleted = JSON.parse(localStorage.MetaGameStore).arcsCompleted
    this.showDevTools = JSON.parse(localStorage.MetaGameStore).showDevTools
    this.loaded = true
  },
  saveSessionToLocal() {
    localStorage.MetaGameStore = JSON.stringify({
      achievements: this.achievements,
      activeSession: this.activeSession,
      numberOfSessions: this.numberOfSessions,
      numberOfWins: this.numberOfWins,
      arcsSeenButNotCompleted: this.arcsSeenButNotCompleted,
      arcsCompleted: this.arcsCompleted,
      showDevTools: this.showDevTools,
    })
  },
})
