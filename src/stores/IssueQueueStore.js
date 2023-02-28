import { reactive } from 'vue'
import {
  GenericIssues,
  // GenericsFromGoogleSheet,
} from '../issueData/GenericIssues.js'
// import { MetaGameStore } from '../stores/MetaGameStore'
import { GenericFollowUps } from '../issueData/GenericFollowUps.js'
import { GameSessionStore } from './GameSessionStore'
// import { ArcIssues } from '../issueData/ArcIssues.js'

export const IssueQueueStore = reactive({
  currentIssueQueue: [],
  unprocessedFollowUps: [],
  genericIssuesSeen: [],
  arcsInProgress: [],
  arcsCompleted: [],
  interstitialShown: false,
  loadSessionFromLocal() {
    this.currentIssueQueue = JSON.parse(
      localStorage.IssueQueueStore
    ).currentIssueQueue
    this.unprocessedFollowUps = JSON.parse(
      localStorage.IssueQueueStore
    ).unprocessedFollowUps
    this.genericIssuesSeen = JSON.parse(
      localStorage.IssueQueueStore
    ).genericIssuesSeen
    this.arcsInProgress = JSON.parse(
      localStorage.IssueQueueStore
    ).arcsInProgress
    this.arcsCompleted = JSON.parse(localStorage.IssueQueueStore).arcsCompleted
    this.interstitialShown = JSON.parse(
      localStorage.IssueQueueStore
    ).interstitialShown
  },
  saveSessionToLocal() {
    localStorage.IssueQueueStore = JSON.stringify({
      currentIssueQueue: this.currentIssueQueue,
      unprocessedFollowUps: this.unprocessedFollowUps,
      genericIssuesSeen: this.genericIssuesSeen,
      arcsInProgress: this.arcsInProgress,
      arcsCompleted: this.arcsCompleted,
      interstitialShown: this.interstitialShown,
    })
  },
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
  addIssueToCurrentQueue(issue) {
    this.currentIssueQueue.push(issue)
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
    let actionConsequences =
      action === 'keepUp'
        ? issueData.keepUpConsequences
        : issueData.takeDownConsequences

    if (actionConsequences) {
      if (actionConsequences.followUpID) {
        this.insertIssueInQueue(
          GenericFollowUps.getIssueByID(actionConsequences.followUpID),
          actionConsequences.followUpTimeDelay,
          actionConsequences.followUpPosition
        )
      }

      if (actionConsequences.postIssueInterstitial) {
        issueData.postIssueInterstitial =
          actionConsequences.postIssueInterstitial
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
      issueObject: issueObject,
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
    // for (let i = 0; i < Object.keys(GenericsFromGoogleSheet).length; i++) {
    //   let newIssue = JSON.parse(
    //     JSON.stringify(
    //       GenericsFromGoogleSheet[Object.keys(GenericsFromGoogleSheet)[i]]
    //     )
    //   )
    //   newIssue.uniqueKey = Math.floor(Math.random() * 10000)
    //   newQueue.push(newIssue)
    // }

    /*
    for (let i = 0; i < Object.keys(GenericIssues).length; i++) {
      let newIssue = JSON.parse(
        JSON.stringify(GenericIssues[Object.keys(GenericIssues)[i]])
      )
      newIssue.uniqueKey = Math.floor(Math.random() * 10000)
      newQueue.push(newIssue)
    }*/

    // SELECT ARC
    // TODO newQueue.push(ArcIssues.startNewArc)

    // TEMP: Add 5 random generics, excluding those already seen
    newQueue.push(...GenericIssues.getRandomIssues(5, this.genericIssuesSeen))

    this.currentIssueQueue = newQueue

    GameSessionStore.betweenRounds = false
    this.startNextCard()
  },
  addRandomIssue() {
    // pass genericIssuesSeen as argument to exclude them
    this.currentIssueQueue.push(GenericIssues.getRandomIssue())
  },
})
