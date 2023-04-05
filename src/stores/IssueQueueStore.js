import { reactive } from 'vue'
import { GenericIssues } from '../issueData/GenericIssues.js'
// import { MetaGameStore } from '../stores/MetaGameStore'
import { GenericFollowUps } from '../issueData/GenericFollowUps.js'
import { TutorialIssues } from '../issueData/TutorialIssues.js'
import { ArcIssues, ArcLookup } from '../issueData/ArcIssues.js'
import { GameSessionStore } from './GameSessionStore'
import { MetaGameStore } from './MetaGameStore.js'
// import { ArcIssues } from '../issueData/ArcIssues.js'

const minimumStartingQueueLength = 5
const appealLikelihood = 0.5

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
    GenericIssues.setExcludionIDs(localStorage.exclusionGroupIDList)
  },
  saveSessionToLocal() {
    let exclusionGroupIDList = GenericIssues.getExclusionIDList()

    localStorage.IssueQueueStore = JSON.stringify({
      currentIssueQueue: this.currentIssueQueue,
      unprocessedFollowUps: this.unprocessedFollowUps,
      genericIssuesSeen: this.genericIssuesSeen,
      exclusionGroupIDList: exclusionGroupIDList,
      arcsInProgress: this.arcsInProgress,
      arcsCompleted: this.arcsCompleted,
      interstitialShown: this.interstitialShown,
    })
  },
  updatedArcMetadataForCompletedArc(arcName) {
    MetaGameStore.arcsCompleted.push(arcName)

    MetaGameStore.arcsSeenButNotCompleted.splice(
      MetaGameStore.arcsSeenButNotCompleted.indexOf(arcName),
      1
    )

    IssueQueueStore.arcsCompleted.push(arcName)

    IssueQueueStore.arcsInProgress.splice(
      IssueQueueStore.arcsInProgress.indexOf(arcName),
      1
    )

    // TODO arc acheivement
    console.log('arc over')
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
    let isAppeal = issueData.issueType.slice(0, 6) == 'appeal'
    GameSessionStore.issuesCompletedThisRound += 1 // TODO - do appeals count toward this?
    GameSessionStore.issuesCompletedThisGame += 1

    // Manager and Public Response
    let responseObject = {
      takeDown: {
        agreeWithManager: 0,
        disagreeWithManager: 0,
        publicSafety: 0,
        publicFreeSpeech: 0,
      },
      keepUp: {
        agreeWithManager: 0,
        disagreeWithManager: 0,
        publicSafety: 0,
        publicFreeSpeech: 0,
      },
    }

    if (action === 'takeDown') {
      if (issueData.managerRespose) {
        if (issueData.managerRespose === 'takeDown') {
          responseObject.takeDown.agreeWithManager += 1
        } else {
          responseObject.takeDown.disagreeWithManager += 1
        }
      }

      if (issueData.publicResponse) {
        if (issueData.publicResponse === 'takeDown') {
          responseObject.takeDown.publicSafety += 1
        } else if (issueData.publicResponse === 'both') {
          responseObject.takeDown.publicSafety += 1
          responseObject.takeDown.publicFreeSpeech -= 1
        } else {
          responseObject.takeDown.publicFreeSpeech -= 1
        }
      }
    } else {
      // Keep Up
      if (issueData.managerRespose) {
        if (issueData.managerRespose === 'keepUp') {
          responseObject.keepUp.agreeWithManager += 1
        } else {
          responseObject.keepUp.disagreeWithManager += 1
        }
      }

      if (issueData.publicResponse) {
        if (issueData.publicResponse === 'keepUp') {
          responseObject.keepUp.publicFreeSpeech += 1
        } else if (issueData.publicResponse === 'both') {
          responseObject.keepUp.publicFreeSpeech += 1
          responseObject.keepUp.publicSafety -= 1
        } else {
          responseObject.keepUp.publicSafety -= 1
        }
      }
    }
    this.genericIssuesSeen.push(this.currentIssueQueue[0].issueID)

    if (!isAppeal) {
      // if not an appeal
      Object.keys(responseObject[action]).forEach((key) => {
        GameSessionStore[key] += responseObject[action][key]
      })
    } else {
      // if appeal, unwind previous game state change
      if (issueData.issueType == 'appealTakeDown') {
        if (action == 'takeDown') {
          // TODO - maybe something around tracking conviction?
          // do nothing
        } else if (action == 'keepUp') {
          // TODO - maybe something around tracking change on appeal?
          // revert prior state change
          Object.keys(responseObject['takeDown']).forEach((key) => {
            GameSessionStore[key] -= responseObject['takeDown'][key]
          })
          // apply new change
          Object.keys(responseObject['keepUp']).forEach((key) => {
            GameSessionStore[key] += responseObject['keepUp'][key]
          })
        }
      } else if (issueData.issueType == 'appealKeepUp') {
        if (action == 'keepUp') {
          // TODO - maybe something around tracking conviction?
          // do nothing
        } else if (action == 'takeDown') {
          // TODO - maybe something around tracking change on appeal?
          // revert prior state change
          Object.keys(responseObject['keepUp']).forEach((key) => {
            GameSessionStore[key] -= responseObject['keepUp'][key]
          })
          // apply new change
          Object.keys(responseObject['takeDown']).forEach((key) => {
            GameSessionStore[key] += responseObject['takeDown'][key]
          })
        }
      }
    }

    // Check for appeal
    if (
      !isAppeal && // not already an appeal
      Math.random() <= appealLikelihood // chance of appeal
    ) {
      if (action === 'takeDown' && issueData.appealIfTakeDown) {
        let appealData = JSON.parse(JSON.stringify(issueData))
        appealData.issueType = 'appealTakeDown'

        this.insertIssueInQueue(appealData, 2, 3)
      } else if (action === 'keepUp' && issueData.appealIfKeepUp) {
        let appealData = JSON.parse(JSON.stringify(issueData))
        appealData.issueType = 'appealKeepUp'

        this.insertIssueInQueue(appealData, 2, 3)
      }
      // console.log('adding appeal to queue', this.unprocessedFollowUps)
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
    let arcName =
      issueData.issueType === 'arc'
        ? issueData.issueID.slice(0, issueData.issueID.indexOf('-'))
        : null

    // check for arc ending

    // check for arc ending from consequence
    if (actionConsequences && actionConsequences.endArc) {
      this.updatedArcMetadataForCompletedArc(arcName)

      // remove any remaining arc cards from current queue
      let currentCard = this.currentIssueQueue.shift()
      this.currentIssueQueue = this.currentIssueQueue.filter(
        (issue) => arcName != issue.issueID.slice(0, issue.issueID.indexOf('-'))
      )
      this.currentIssueQueue.unshift(currentCard)

      // remove any remaining arc cards from unprocessed queue
      this.unprocessedFollowUps = this.unprocessedFollowUps.filter(
        (issueInsert) =>
          arcName !=
          issueInsert.issueObject.issueID.slice(
            0,
            issueInsert.issueObject.issueID.indexOf('-')
          )
      )
    }

    // check for arc ending from no more arc cards remaining
    if (arcName) {
      let arcCardsRemaining = 0
      // check current queue
      arcCardsRemaining += this.currentIssueQueue.filter(
        (issue) =>
          arcName === issue.issueID.slice(0, issue.issueID.indexOf('-'))
      ).length
      // check unprocessed followups
      arcCardsRemaining += this.unprocessedFollowUps.filter(
        (issueInsert) =>
          arcName ===
          issueInsert.issueObject.issueID.slice(
            0,
            issueInsert.issueObject.issueID.indexOf('-')
          )
      ).length

      // update metadata
      if (arcCardsRemaining <= 1) {
        this.updatedArcMetadataForCompletedArc(arcName)
      }
    }

    // CHECK FOR INTERSTITIAL AND REMOVE CARD FROM QUEUE
    if (issueData.postIssueInterstitial) {
      GameSessionStore.gameIsPaused = true
      this.interstitialShown = issueData.postIssueInterstitial
      this.interstitialType = 'post'
      this.currentIssueQueue.shift()
    } else {
      this.currentIssueQueue.shift()
      if (GameSessionStore.timeRemaining != 0) {
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
    // console.log(issueObject, insertDelay, insertPosition)
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
      if (!this.unprocessedFollowUps[i].processed) {
        newQueue.push(this.unprocessedFollowUps[i].issueObject)
      }
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

      // Check for initial interstitial for grab bag arcs
      if (initialArcCards.length > 1) {
        let arcIntroInterstitial = initialArcCards.shift()
        newQueue.unshift(arcIntroInterstitial)
      }

      // TODO: add logic for having only a subset of initial cards and placing the rest in a queue
      if (initialArcCards.length > 3) {
        // Grab three random cards
        let firstCards = []
        for (let i = 0; i < 3; i++) {
          let randomIndex = Math.floor(Math.random() * initialArcCards.length)
          firstCards.push(...initialArcCards.splice(randomIndex, 1))
        }
        newQueue.push(...firstCards)

        // add other cards to queue
        let cardsRemaining = initialArcCards.length
        for (let i = 0; i < cardsRemaining; i++) {
          let randomIndex = Math.floor(Math.random() * initialArcCards.length)
          let issue = initialArcCards.splice(randomIndex, 1)

          // space issues out by 3 seconds
          this.insertIssueInQueue(issue[0], 3 * (i + 1))
        }
      } else {
        newQueue.push(...initialArcCards)
      }
    }

    // TEMP: Add random generics to bring up to min queue size, excluding those already seen
    if (newQueue.length < minimumStartingQueueLength) {
      let genericsToAdd = minimumStartingQueueLength - newQueue.length
      newQueue.push(
        ...GenericIssues.getRandomIssues(genericsToAdd, this.genericIssuesSeen)
      )
    }

    // TODO: Add logic for shuffling arcs and generics

    this.currentIssueQueue = newQueue

    GameSessionStore.betweenRounds = false
    this.startNextCard()
  },
  addRandomIssue() {
    let excludeArray = this.genericIssuesSeen.concat(this.currentIssueQueue)

    this.currentIssueQueue.push(GenericIssues.getRandomIssue(excludeArray))
  },
})
