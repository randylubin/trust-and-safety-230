import { reactive } from "vue";
import { GenericIssues } from "../issueData/GenericIssues.js";
import { GameSessionStore } from "./GameSessionStore";

export const IssueQueueStore = reactive({
  currentIssueQueue: JSON.parse(JSON.stringify(GenericIssues)),
  genericIssuesSeen: [],
  arcsInProgress: [],
  arcsCompleted: [],
  takeAction(action, issueData) {
    if (action == issueData.correctResponse) {
      console.log("right answer");
    } else {
      console.log("wrong answer");
    }
    this.genericIssuesSeen.push(this.currentIssueQueue[0].issueID);
    // TODO Arcs
    // TODO add new issues
    if (GameSessionStore.timeRemaining != 0) {
      GameSessionStore.timeRemaining--; // TODO remove this
    } else {
      GameSessionStore.betweenRounds = true;
      GameSessionStore.triggerPostRound();
    }
    this.currentIssueQueue.shift();
  },
  startNewRound() {
    // TODO
    this.currentIssueQueue = JSON.parse(JSON.stringify(GenericIssues));
    GameSessionStore.betweenRounds = false;
  },
});
