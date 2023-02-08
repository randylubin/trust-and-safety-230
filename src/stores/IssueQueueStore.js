import { reactive } from "vue";
import { GenericIssues } from "../issueData/GenericIssues.js";
import { GameSessionStore } from "./GameSessionStore";

export const IssueQueueStore = reactive({
  currentIssueQueue: JSON.parse(JSON.stringify(GenericIssues)),
  genericIssuesSeen: [],
  arcsInProgress: [],
  arcsCompleted: [],
  interstitialShown: false,
  startNextCard() {
    if (
      GameSessionStore.timeRemaining != 0 &&
      IssueQueueStore.currentIssueQueue.length
    ) {
      if (this.currentIssueQueue[0].preIssueInterstitial) {
        this.interstitialShown = this.currentIssueQueue[0].preIssueInterstitial;
        this.interstitialType = "pre";
      }
      if (this.currentIssueQueue[0].interstitialOnly) {
        this.interstitialShown = this.currentIssueQueue[0].interstitialOnly;
        this.interstitialType = "interstitialOnly";
      }
    } else {
      this.endRound();
    }
  },
  takeAction(action, issueData) {
    if (action == issueData.correctResponse) {
      console.log("right answer");
    } else {
      console.log("wrong answer");
    }
    this.genericIssuesSeen.push(this.currentIssueQueue[0].issueID);
    // TODO Arcs
    // TODO add new issues
    if (issueData.postIssueInterstitial) {
      this.interstitialShown = issueData.postIssueInterstitial;
      this.interstitialType = "post";
      this.currentIssueQueue.shift();
    } else {
      this.currentIssueQueue.shift();
      if (GameSessionStore.timeRemaining != 0) {
        GameSessionStore.timeRemaining--; // TODO remove this
        this.startNextCard();
      } else if (!issueData.postIssueInterstitial) {
        this.endRound();
      }
    }
  },
  endRound() {
    GameSessionStore.betweenRounds = true;
    GameSessionStore.triggerPostRound();
  },
  closeInterstitial() {
    console.log("closing interstitial");
    this.interstitialShown = false;
    if (this.interstitialType !== "pre") {
      if (this.interstitialType === "interstitialOnly") {
        this.currentIssueQueue.shift();
      }
      this.startNextCard();
    }
  },
  startNewRound() {
    // TODO
    this.currentIssueQueue = JSON.parse(JSON.stringify(GenericIssues));
    GameSessionStore.betweenRounds = false;
  },
});
