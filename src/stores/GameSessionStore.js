import { reactive } from "vue";
import { ref } from "vue";
import { useIntervalFn } from "@vueuse/core";

import { IssueQueueStore } from "./IssueQueueStore";

const timeRemaining = ref(100);
const gameIsPaused = ref(false);

const { pause, resume, isActive } = useIntervalFn(() => {
  if (!gameIsPaused.value && timeRemaining.value > 0) {
    timeRemaining.value--;

    // TODO add cards over time

    // Add follow up cards
    if (IssueQueueStore.unprocessedFollowUps) {
      for (let i = 0; i < IssueQueueStore.unprocessedFollowUps.length; i++) {
        let issue = IssueQueueStore.unprocessedFollowUps[i];

        if (issue.insertTime >= timeRemaining.value && !issue.processed) {
          IssueQueueStore.currentIssueQueue.push(
            JSON.parse(JSON.stringify(issue.issueObject))
          );

          IssueQueueStore.unprocessedFollowUps[i].processed = true;
          // TODO pay attention to insert order, right now it adds to end
        }
      }
    }
  }
}, 1000);

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
    pause;
  },
  resumeTimer: function () {
    resume;
  },
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
