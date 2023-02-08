import { reactive } from "vue";

export const GameSessionStore = reactive({
  currentRound: 0,
  timeRemaining: 10,
  betweenRounds: false,
  moderationSpeed: 5,
  moderationQuality: 5,
  publicPerceptions: 5,
  timesUp: function (timesUpBoolean) {
    this.timeRemaining = 0;
  },
  triggerPostRound() {
    // TODO
    this.timeRemaining = 0;
    this.betweenRounds = true;
  },
});
