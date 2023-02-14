import { reactive } from 'vue'
import { GenericIssues } from '../issueData/GenericIssues.js'
import { GenericFollowUps } from '../issueData/GenericFollowUps.js'
import { GameSessionStore } from './GameSessionStore'

export const IssueQueueStore = reactive({
  currentIssueQueue: JSON.parse(JSON.stringify(GenericIssues)),
  unprocessedFollowUps: [],
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
        this.interstitialShown = this.currentIssueQueue[0].preIssueInterstitial
        this.interstitialType = 'pre'
        GameSessionStore.gameIsPaused = true
      } else if (this.currentIssueQueue[0].interstitialOnly) {
        this.interstitialShown = this.currentIssueQueue[0].interstitialOnly
        this.interstitialType = 'interstitialOnly'
        GameSessionStore.gameIsPaused = true
      } else {
        GameSessionStore.gameIsPaused = false
      }
    } else {
      this.endRound()
    }
  },
  takeAction(action, issueData) {
    if (action == issueData.correctResponse) {
      console.log('right answer')
    } else {
      if (action == 'takeDown') {
        console.log('wrong answer: false positive')
      } else if (action == 'keepUp') {
        console.log('wrong answer: false negative')
      }
    }
    this.genericIssuesSeen.push(this.currentIssueQueue[0].issueID)

    // Handle consequences
    if (action == 'keepUp' && issueData.keepUpConsequences) {
      if (issueData.keepUpConsequences.followUpID) {
        this.insertIssueInQueue(
          GenericFollowUps[issueData.keepUpConsequences.followUpID],
          issueData.keepUpConsequences.followUpTimeDelay,
          issueData.keepUpConsequences.followUpPosition
        )
      }
    }

    if (action == 'takeDown' && issueData.takeDownConsequences) {
      if (issueData.takeDownConsequences.followUpID) {
        this.insertIssueInQueue(
          GenericFollowUps[issueData.takeDownConsequences.followUpID],
          issueData.takeDownConsequences.followUpTimeDelay,
          issueData.takeDownConsequences.followUpPosition
        )
      }
    }

    // TODO Arcs

    // CHECK FOR INTERSTITIAL AND REMOVE CARD FROM QUEUE
    if (issueData.postIssueInterstitial) {
      GameSessionStore.gameIsPaused = true
      this.interstitialShown = issueData.postIssueInterstitial
      this.interstitialType = 'post'
      this.currentIssueQueue.shift()
    } else {
      this.currentIssueQueue.shift()
      if (GameSessionStore.timeRemaining != 0) {
        GameSessionStore.timeRemaining-- // TODO remove this
        this.startNextCard()
      } else if (!issueData.postIssueInterstitial) {
        this.endRound()
      }
    }
  },
  endRound() {
    GameSessionStore.betweenRounds = true
    GameSessionStore.triggerPostRound()
  },
  insertIssueInQueue(issueObject, insertDelay = 1, insertPosition = null) {
    console.log(issueObject, insertDelay, insertPosition)
    this.unprocessedFollowUps.push({
      issueObject: JSON.parse(JSON.stringify(issueObject)),
      insertTime: GameSessionStore.timeRemaining - insertDelay,
      insertPosition: insertPosition,
    })
  },
  closeInterstitial() {
    console.log('closing interstitial')
    GameSessionStore.gameIsPaused = false
    this.interstitialShown = false
    if (this.interstitialType !== 'pre') {
      if (this.interstitialType === 'interstitialOnly') {
        this.currentIssueQueue.shift()
      }
      this.startNextCard()
    }
  },
  startNewRound() {
    // TODO

    let newQueue = []
    // REMOVE GENERICS FROM OLD QUEUE
    for (let i = 0; i < this.currentIssueQueue.length; i++) {
      let issue = JSON.parse(JSON.stringify(this.currentIssueQueue[i]))
      if (issue.issueType !== 'generic') {
        newQueue.push(issue)
      }
    }

    // ADD UNPROCESSED QUEUE ISSUES
    for (let i = 0; i < this.unprocessedFollowUps.length; i++) {
      newQueue.push(this.unprocessedFollowUps[i].issueObject)
    }
    this.unprocessedFollowUps = []

    // TODO: PAD WITH GENERIC ISSUES
    this.currentIssueQueue = newQueue.concat(
      JSON.parse(JSON.stringify(GenericIssues))
    )

    GameSessionStore.betweenRounds = false
    this.startNextCard()
  },
  addRandomIssue() {
    // TODO check for repeats
    let newIssueIndex = Math.floor(Math.random() * GenericIssues.length)

    this.currentIssueQueue.push(
      JSON.parse(JSON.stringify(GenericIssues[newIssueIndex]))
    )
  },
})
