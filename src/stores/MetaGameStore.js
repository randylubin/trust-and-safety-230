import { reactive } from "vue";

export const MetaGameStore = reactive({
  acheivements: [],
  numberOfSessions: 0,
  numberOfWins: 0,
  arcsSeenButNotCompleted: [],
  arcsCompleted: [],
});
