import { reactive } from "vue";

export const GameSessionStore = reactive({
  currentRound: 0,
  timeRemaining: 10,
  betweenRounds: false,
  moderationSpeed: 5,
  moderationQuality: 5,
  publicPerception: 5,
  showGameOver: false,
  timesUp: function (timesUpBoolean) {
    this.timeRemaining = 0;
  },
  triggerPostRound() {
    // TODO
    if (
      this.moderationQuality * this.moderationSpeed * this.publicPerception ==
      0 // TODO update formula
    ) {
      this.showGameOver = true;
    } else {
      this.timeRemaining = 0;
      this.betweenRounds = true;
    }
  },
});
