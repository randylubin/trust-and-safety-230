import { reactive } from 'vue'

export const MetaGameStore = reactive({
  acheivements: [],
  activeSession: false,
  numberOfSessions: 0,
  numberOfWins: 0,
  arcsSeenButNotCompleted: [],
  arcsCompleted: [],
  showDevTools: false,
})
