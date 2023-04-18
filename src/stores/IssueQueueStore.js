import { reactive } from 'vue'
import { GameDefaults } from '../GameDefaults.js'
import { GenericIssues } from '../issueData/GenericIssues.js'
// import { MetaGameStore } from '../stores/MetaGameStore'
import { GenericFollowUps } from '../issueData/GenericFollowUps.js'
import { TutorialIssues } from '../issueData/TutorialIssues.js'
import { ArcIssues, ArcLookup } from '../issueData/ArcIssues.js'
import { GameSessionStore } from './GameSessionStore'
import { MetaGameStore } from './MetaGameStore.js'
// import { ArcIssues } from '../issueData/ArcIssues.js'

const minimumStartingQueueLength = GameDefaults.minimumStartingQueueLength
const appealLikelihood = GameDefaults.appealLikelihood
const AppealDelay = GameDefaults.appealDelay

export const IssueQueueStore = reactive({
  currentIssueQueue: [],
  unprocessedFollowUps: [],
  genericIssuesSeen: [],
  forcedNextArc: [],
  exclusionGroupIDList: [],
  arcsInProgress: [],
  arcsCompleted: [],
  interstitialShown: false,
  loadSessionFromLocal() {
    const saveData = JSON.parse(localStorage.IssueQueueStore)
    for (const [key, value] of Object.entries(saveData)) {
      this[key] = value
    }
    GenericIssues.setExcludionIDs(
      localStorage.IssueQueueStore.exclusionGroupIDList
    )
  },
  saveSessionToLocal() {
    let exclusionGroupIDList = GenericIssues.getExclusionIDList()

    localStorage.IssueQueueStore = JSON.stringify({
      currentIssueQueue: this.currentIssueQueue,
      unprocessedFollowUps: this.unprocessedFollowUps,
      genericIssuesSeen: this.genericIssuesSeen,
      forcedNextArc: this.forcedNextArc,
      exclusionGroupIDList: exclusionGroupIDList,
      arcsInProgress: this.arcsInProgress,
      arcsCompleted: this.arcsCompleted,
      interstitialShown: this.interstitialShown,
    })
  },
  processEndedArc(arcName) {
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

    // TODO specific arc logic (e.g. ending of election 1 triggers election 2)
    // TODO arc acheivement
    console.log('arc over')
  },
  startNextCard() {
    if (
      GameSessionStore.timeRemaining > 0 &&
      IssueQueueStore.currentIssueQueue.length
    ) {
      let isAppeal = this.currentIssueQueue[0].issueType.slice(0, 6) == 'appeal'
      if (this.genericIssuesSeen.includes(this.currentIssueQueue[0].issueID) && !isAppeal) {
        console.log('ALREADY SEEN!')
      }
      if (this.currentIssueQueue[0].preIssueInterstitial && !isAppeal) {
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
    } else if (GameSessionStore.timeRemaining <= 0) {
      this.endRound()
    } else if (this.currentIssueQueue.length == 0) {
      // Currently - do nothing
      // Option 2: draw new card
      // this.currentIssueQueue.push(
      //   GenericIssues.getRandomIssue(this.genericIssuesSeen)
      // )
      // this.startNextCard()
      // OLD: this.endRound()
    }
  },
  addIssueToCurrentQueue(issue) {
    this.currentIssueQueue.push(issue)
  },
  takeAction(action, issueData) {
    if (action === 'closeInterstitial') action = 'keepUp'
    let actionConsequences =
      action === 'keepUp'
        ? issueData.keepUpConsequences
        : issueData.takeDownConsequences
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
        if (key === 'disagreeWithManager') {
          GameSessionStore.disagreeWithManagerThisRound +=
            responseObject[action][key]
        }
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
      ((action === 'takeDown' && issueData.appealIfTakeDown) ||
        (action === 'keepUp' && issueData.appealIfKeepUp)) &&
      (Math.random() <= appealLikelihood || actionConsequences?.instantAppeal)
    ) {
      let appealData = JSON.parse(JSON.stringify(issueData))
      if (action === 'takeDown' && issueData.appealIfTakeDown) {
        appealData.issueType = 'appealTakeDown'
      } else if (action === 'keepUp' && issueData.appealIfKeepUp) {
        appealData.issueType = 'appealKeepUp'
      }
      if (actionConsequences?.instantAppeal) {
        this.insertIssueInQueue(appealData, 0)
      } else {
        this.insertIssueInQueue(appealData, AppealDelay)
        // console.log('adding appeal to queue', this.unprocessedFollowUps)
      }
    }

    // Handle consequences

    if (actionConsequences) {
      // Follow up
      if (actionConsequences.followUpID && !isAppeal) {
        if (issueData.issueType == 'arc') {
          this.insertIssueInQueue(
            ArcIssues.getIssueByID(actionConsequences.followUpID),
            actionConsequences.followUpTimeDelay
          )
        } else {
          this.insertIssueInQueue(
            GenericFollowUps.getIssueByID(actionConsequences.followUpID),
            actionConsequences.followUpTimeDelay
          )
        }
      }

      // Post Interstitial
      if (actionConsequences.postIssueInterstitial) {
        issueData.postIssueInterstitial =
          actionConsequences.postIssueInterstitial
      } else if (
        !issueData.postIssueInterstitial &&
        !isAppeal &&
        Math.random() < GameDefaults.oddsOfFeedbackInterstitial
      ) {
        // feedback post-interstitial
        if (responseObject[action].disagreeWithManager) {
          issueData.postIssueInterstitial =
            'Hmm... Not the decision I would have made. -Manager'
        } else if (responseObject[action].publicSafety < 0) {
          issueData.postIssueInterstitial =
            "Some users are leaving the platform, saying it's not safe for them."
        } else if (responseObject[action].publicFreeSpeech < 0) {
          issueData.postIssueInterstitial =
            'Some users are angry about us "censoring" them.'
        }
      }
    }

    let arcName =
      issueData.issueType === 'arc'
        ? issueData.issueID.slice(0, issueData.issueID.indexOf('-'))
        : null

    // TODO maybe refactor to happen immediately
    if (actionConsequences?.forcedNextArc) {
      this.forcedNextArc.push(actionConsequences?.forcedNextArc)
    }

    // check for game ending
    if (actionConsequences?.endGame) {
      GameSessionStore.endGame(actionConsequences.endGame)
    }

    if (actionConsequences?.endGameAtEndOfRound) {
      GameSessionStore.endGameAtEndOfRound =
        actionConsequences?.endGameAtEndOfRound
    }

    // check for arc ending
    // check for arc ending from consequence
    if (actionConsequences?.endArc) {
      this.processEndedArc(arcName)

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
            ) && !issueInsert.processed
      ).length

      // update metadata
      if (arcCardsRemaining <= 1) {
        this.processEndedArc(arcName)
      }
    }
    // CHECK FOR INTERSTITIAL AND REMOVE CARD FROM QUEUE
    if (issueData.postIssueInterstitial && !isAppeal) {
      GameSessionStore.gameIsPaused = true
      this.interstitialShown = issueData.postIssueInterstitial
      this.interstitialType = 'post'
      this.currentIssueQueue.shift()
    } else if (!actionConsequences?.endGame) {
      this.currentIssueQueue.shift()
      if (actionConsequences?.endRound) {
        this.endRound()
      } else if (GameSessionStore.timeRemaining > 0) {
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
  insertIssueInQueue(issueObject, insertDelay = 1) {
    // console.log(issueObject, insertDelay, insertPosition)
    this.unprocessedFollowUps.push({
      issueObject: issueObject,
      insertTime: GameSessionStore.timeRemaining - insertDelay,
    })
  },
  interleaveDecks(deckOne, deckTwo) {
    const result = []
    const maxLength = Math.max(deckOne.length, deckTwo.length)
    for (let i = 0; i < maxLength; i++) {
      if (i < deckOne.length) {
        result.push(deckOne[i])
      }
      if (i < deckTwo.length) {
        result.push(deckTwo[i])
      }
    }
    return result
  },
  closeInterstitial() {
    console.log('closing interstitial')
    GameSessionStore.gameIsPaused = false
    this.interstitialShown = false
    if (this.interstitialType !== 'pre') {
      if (this.interstitialType === 'interstitialOnly') {
        this.takeAction('closeInterstitial', this.currentIssueQueue[0])
      }
      if (!GameSessionStore.showGameOver && this.currentIssueQueue.length) {
        this.startNextCard()
      }
    }
  },
  startTutorial() {
    let newQueue = TutorialIssues.getAllIssues()

    this.currentIssueQueue = newQueue
    GameSessionStore.betweenRounds = false
    this.startNextCard()
  },
  startNewRound() {
    let newQueue = []
    // REMOVE GENERICS FROM OLD QUEUE
    for (let i = 0; i < this.currentIssueQueue.length; i++) {
      let issue = JSON.parse(JSON.stringify(this.currentIssueQueue[i]))
      if (issue.issueType !== 'generic') {
        newQueue.push(issue)
      }
    }

    // ADD UNPROCESSED QUEUE ISSUES
    let leftOverArcCards = []
    let leftOverAppeals = []
    let carryoverQueue = []
    for (let i = 0; i < this.unprocessedFollowUps.length; i++) {
      if (!this.unprocessedFollowUps[i].processed) {
        let issue = JSON.parse(
          JSON.stringify(this.unprocessedFollowUps[i].issueObject)
        )
        if (issue.issueType.slice(0, 6) == 'appeal') {
          leftOverAppeals.push(issue)
        } else {
          leftOverArcCards.push(issue)
        }
      }
    }
    // create new queue under max size
    carryoverQueue.push(...leftOverArcCards)
    let roomForAppeals =
      GameDefaults.maxCarryoverLength - leftOverArcCards.length
    if (roomForAppeals > 0) {
      for (let i = 0; i < roomForAppeals; i++) {
        if (leftOverAppeals.length) {
          carryoverQueue.splice(
            Math.random() * carryoverQueue.length,
            0,
            ...leftOverAppeals.splice(Math.random() * leftOverAppeals.length, 1)
          )
        }
      }
    }
    newQueue.push(...carryoverQueue)
    this.unprocessedFollowUps = []

    // SELECT ARC
    let filteredArcOptions = Object.keys(ArcLookup).filter(
      (arc) =>
        ArcLookup[arc].earliestRound <= GameSessionStore.currentRound &&
        // check session
        !this.arcsInProgress.includes(arc) &&
        !this.arcsCompleted.includes(arc) &&
        // check meta
        !MetaGameStore.arcsSeenButNotCompleted.includes(arc) &&
        !MetaGameStore.arcsCompleted.includes(arc)
    )

    // fallback if player has seen all arcs across sessions
    if (!filteredArcOptions.length) {
      filteredArcOptions = Object.keys(ArcLookup).filter(
        (arc) =>
          ArcLookup[arc].earliestRound <= GameSessionStore.currentRound &&
          // check session
          !this.arcsInProgress.includes(arc) &&
          !this.arcsCompleted.includes(arc)
      )
    }

    console.log('filtered arcs: ', filteredArcOptions)

    if (filteredArcOptions.length || this.forcedNextArc.length) {
      let selectedArcName =
        filteredArcOptions[
          Math.floor(Math.random() * filteredArcOptions.length)
        ]

      // check for forced next arc
      if (this.forcedNextArc.length) {
        selectedArcName = this.forcedNextArc.shift()
      }

      let selectedArc = ArcLookup[selectedArcName]

      this.arcsInProgress.push(selectedArcName)
      MetaGameStore.arcsSeenButNotCompleted.push(selectedArcName)
      console.log('in progress', this.arcsInProgress)

      let initialArcCards = ArcIssues.getIssuesByID(selectedArc.initialIssues)

      // Check for initial interstitial for grab bag arcs
      if (initialArcCards.length > 1) {
        let arcIntroInterstitial = initialArcCards.shift()
        newQueue.unshift(arcIntroInterstitial)
      }

      if (initialArcCards.length > GameDefaults.startingGrabBagCardCount) {
        // Grab random cards
        let firstCards = []
        for (let i = 0; i < GameDefaults.startingGrabBagCardCount; i++) {
          let randomIndex = Math.floor(Math.random() * initialArcCards.length)
          firstCards.push(...initialArcCards.splice(randomIndex, 1))
        }
        console.log(newQueue)
        newQueue = this.interleaveDecks(newQueue, firstCards)
        console.log(newQueue)

        // add other cards to queue
        let cardsRemaining = initialArcCards.length
        for (let i = 0; i < cardsRemaining; i++) {
          let randomIndex = Math.floor(Math.random() * initialArcCards.length)
          let issue = initialArcCards.splice(randomIndex, 1)

          // space issues out
          this.insertIssueInQueue(
            issue[0],
            GameDefaults.timeBetweenArcCards * (i + 1)
          )
        }
      } else {
        newQueue = this.interleaveDecks(newQueue, initialArcCards)
      }
    }

    // TEMP: Add random generics to bring up to min queue size, excluding those already seen
    if (newQueue.length < minimumStartingQueueLength) {
      let genericsToAdd = minimumStartingQueueLength - newQueue.length
      newQueue = this.interleaveDecks(
        newQueue,
        GenericIssues.getRandomIssues(genericsToAdd, this.genericIssuesSeen)
      )
    }

    this.currentIssueQueue = newQueue

    GameSessionStore.betweenRounds = false
    this.startNextCard()
  },
  addRandomIssue() {
    let excludeArray = this.genericIssuesSeen.concat(
      this.currentIssueQueue,
      GenericIssues.getIDsOfBotIssues()
    )

    this.currentIssueQueue.push(GenericIssues.getRandomIssue(excludeArray))
  },
})
