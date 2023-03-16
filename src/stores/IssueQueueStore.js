import { reactive } from 'vue'
import { GenericIssues } from '../issueData/GenericIssues.js'
// import { MetaGameStore } from '../stores/MetaGameStore'
import { GenericFollowUps } from '../issueData/GenericFollowUps.js'
import { TutorialIssues } from '../issueData/TutorialIssues.js'
import { ArcIssues, ArcLookup } from '../issueData/ArcIssues.js'
import { GameSessionStore } from './GameSessionStore'
import { MetaGameStore } from './MetaGameStore.js'
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
    if (action === 'takeDown') {
      if (issueData.managerRespose) {
        if (issueData.managerRespose === 'takeDown') {
          GameSessionStore.agreeWithManager += 1
        } else {
          GameSessionStore.disagreeWithManager += 1
        }
      }

      if (issueData.publicResponse) {
        if (issueData.publicResponse === 'takeDown') {
          GameSessionStore.publicSafety += 1
        } else if (issueData.publicResponse === 'both') {
          GameSessionStore.publicSafety += 1
          GameSessionStore.publicFreeSpeech -= 1
        } else {
          GameSessionStore.publicFreeSpeech -= 1
        }
      }
    } else {
      // Keep Up
      if (issueData.managerRespose) {
        if (issueData.managerRespose === 'keepUp') {
          GameSessionStore.agreeWithManager += 1
        } else {
          GameSessionStore.disagreeWithManager += 1
        }
      }

      if (issueData.publicResponse) {
        if (issueData.publicResponse === 'keepUp') {
          GameSessionStore.publicFreeSpeech += 1
        } else if (issueData.publicResponse === 'both') {
          GameSessionStore.publicFreeSpeech += 1
          GameSessionStore.publicSafety -= 1
        } else {
          GameSessionStore.publicSafety -= 1
        }
      }
    }
    this.genericIssuesSeen.push(this.currentIssueQueue[0].issueID)

    // Appeals
    if (action === 'takeDown' && issueData.appealIfTakeDown) {
      let appealData = JSON.parse(JSON.stringify(issueData))
      appealData.issueType = 'appealTakeDown'

      this.insertIssueInQueue(appealData, 2, 3)
    } else if (action === 'keepUp' && issueData.appealIfKeepUp) {
      let appealData = JSON.parse(JSON.stringify(issueData))
      appealData.issueType = 'appealKeepUp'

      this.insertIssueInQueue(appealData, 2, 3)
    }

    // Handle consequences
    let actionConsequences =
      action === 'keepUp'
        ? issueData.keepUpConsequences
        : issueData.takeDownConsequences

    if (actionConsequences) {
      // Follow up
      if (actionConsequences.followUpID) {
        this.insertIssueInQueue(
          GenericFollowUps.getIssueByID(actionConsequences.followUpID),
          actionConsequences.followUpTimeDelay,
          actionConsequences.followUpPosition
        )
      }

      // Post Interstitial
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
  startTutorial() {
    let newQueue = TutorialIssues.getAllIssues()

    this.currentIssueQueue = newQueue
    GameSessionStore.betweenRounds = false
    this.startNextCard()
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

    // SELECT ARC
    let filteredArcOptions = Object.keys(ArcLookup).filter(
      (arc) =>
        ArcLookup[arc].earliestRound <= GameSessionStore.currentRound &&
        !this.arcsInProgress.includes(arc) &&
        !this.arcsCompleted.includes(arc)
    )

    console.log('filtered arcs: ', filteredArcOptions)

    if (filteredArcOptions.length) {
      let selectedArcName =
        filteredArcOptions[
          Math.floor(Math.random() * filteredArcOptions.length)
        ]

      let selectedArc = ArcLookup[selectedArcName]

      this.arcsInProgress.push(selectedArcName)
      console.log('in progress', this.arcsInProgress)
      MetaGameStore.arcsSeenButNotCompleted.push(selectedArcName) // TODO set logic for arc completion

      let initialArcCards = ArcIssues.getIssuesByID(selectedArc.initialIssues)

      // TODO: add logic for having only a subset of initial cards and placing the rest in a queue
      newQueue.push(...initialArcCards)
    }

    // TEMP: Add 5 random generics, excluding those already seen
    newQueue.push(...GenericIssues.getRandomIssues(5, this.genericIssuesSeen))

    // TODO: Add logic for shuffling arcs and generics

    this.currentIssueQueue = newQueue

    GameSessionStore.betweenRounds = false
    this.startNextCard()
  },
  addRandomIssue() {
    // pass genericIssuesSeen as argument to exclude them
    this.currentIssueQueue.push(GenericIssues.getRandomIssue())
  },
})
