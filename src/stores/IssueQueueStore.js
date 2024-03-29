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

Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)]
}

const minimumStartingQueueLength = GameDefaults.minimumStartingQueueLength
const appealLikelihood = GameDefaults.appealLikelihood
const AppealDelay = GameDefaults.appealDelay
const FallbackLearnMore = [
  "You don't learn anything more",
  'Nothing else to see here',
]

export const IssueQueueStore = reactive({
  currentIssueQueue: [],
  unprocessedFollowUps: [],
  genericIssuesSeen: [],
  forcedNextArc: [],
  exclusionGroupIDList: [],
  arcsInProgress: [],
  arcsCompleted: [],
  interstitialShown: false,
  upcomingArcs: [],
  interstitialKey: 1,
  loadSessionFromLocal() {
    const saveData = JSON.parse(localStorage.IssueQueueStore)
    for (const [key, value] of Object.entries(saveData)) {
      this[key] = value
    }
    GenericIssues.setExcludionIDs(saveData.exclusionGroupIDList)
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
      upcomingArcs: this.upcomingArcs,
    })
  },
  getIssueIDsInCurrentQueue() {
    let issueIDArray = []
    this.currentIssueQueue.forEach((issue) => {
      issueIDArray.push(issue.issueID)
    })

    return issueIDArray
  },
  processEndedArc(arcName) {
    if (!MetaGameStore.arcsCompleted.includes(arcName)) {
      MetaGameStore.arcsCompleted.push(arcName)

      switch (arcName) {
        case 'ELECTION':
          GameSessionStore.registerAchievement('hailtothechief')
          break
        case 'HEALTHCARE':
          GameSessionStore.registerAchievement('bigpharma')
          break
        case 'NUDITY':
          GameSessionStore.registerAchievement('modestmeans')
          break
        case 'NUDE_ART':
          GameSessionStore.registerAchievement('modelbehavior')
          break
        case 'POSTELEC':
          GameSessionStore.registerAchievement('transitionteam')
          break
        case 'BETAAI':
          GameSessionStore.registerAchievement('robotuprising')
          break
        case 'COPYRIGHT':
          GameSessionStore.registerAchievement('culturewar')
          break
        case 'ETHICSIN':
          GameSessionStore.registerAchievement('piercegate')
          break
        case 'ANGRYGOV':
          GameSessionStore.registerAchievement('bullypulpit')
          break
        case 'WORLDCUP':
          GameSessionStore.registerAchievement('goal')
          break
      }
    }

    MetaGameStore.arcsSeenButNotCompleted.splice(
      MetaGameStore.arcsSeenButNotCompleted.indexOf(arcName),
      1
    )

    IssueQueueStore.arcsCompleted.push(arcName)

    IssueQueueStore.arcsInProgress.splice(
      IssueQueueStore.arcsInProgress.indexOf(arcName),
      1
    )

    // specific arc logic (e.g. ending of election 1 triggers election 2)
    if (arcName === 'ELECTION') {
      this.upcomingArcs.push({
        round: GameSessionStore.currentRound + 1,
        arcName: 'POSTELECT',
      })
    }
  },
  resetAllData() {
    this.currentIssueQueue = []
    this.unprocessedFollowUps = []
    this.genericIssuesSeen = []
    this.forcedNextArc = []
    this.exclusionGroupIDList = []
    this.arcsInProgress = []
    this.arcsCompleted = []
    this.interstitialShown = false
    this.upcomingArcs = []
  },
  startNextCard() {
    if (
      (GameSessionStore.timeRemaining > 0 ||
        GameSessionStore.currentRound == 0) &&
      IssueQueueStore.currentIssueQueue.length
    ) {
      let isAppeal = this.currentIssueQueue[0].issueType.slice(0, 6) == 'appeal'
      if (!this.currentIssueQueue[0].learnMoreText) {
        this.currentIssueQueue[0].learnMoreText =
          FallbackLearnMore[
            Math.floor(Math.random() * FallbackLearnMore.length)
          ]
      }
      if (
        this.genericIssuesSeen.includes(this.currentIssueQueue[0].issueID) &&
        !isAppeal
      ) {
        console.log('ALREADY SEEN!', this.currentIssueQueue[0].issueID)
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
    } else if (
      GameSessionStore.timeRemaining <= 0 &&
      GameSessionStore.currentRound != 0
    ) {
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
    if (!issueData.interstitialOnly) {
      GameSessionStore.issuesCompletedThisRound++
      if (GameSessionStore.currentRound != 0) {
        GameSessionStore.issuesCompletedThisGame++
        MetaGameStore.PlayerStatistics.issuesProcessed++
        if (MetaGameStore.PlayerStatistics.issuesProcessed >= 250) {
          GameSessionStore.registerAchievement('expertmod')
        } else if (MetaGameStore.PlayerStatistics.issuesProcessed >= 100) {
          GameSessionStore.registerAchievement('intermediatemod')
        } else if (MetaGameStore.PlayerStatistics.issuesProcessed >= 25) {
          GameSessionStore.registerAchievement('novicemod')
        }
      }
    }

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
      if (issueData.managerResponse) {
        if (issueData.managerResponse === 'takeDown') {
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
      if (issueData.managerResponse) {
        if (issueData.managerResponse === 'keepUp') {
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

    if (!isAppeal) {
      this.genericIssuesSeen.push(this.currentIssueQueue[0].issueID)
      // if not an appeal
      Object.keys(responseObject[action]).forEach((key) => {
        // console.log(key, responseObject[action][key])
        GameSessionStore[key] += responseObject[action][key]
        if (key === 'disagreeWithManager') {
          GameSessionStore.disagreeWithManagerThisRound +=
            responseObject[action][key]
        }
      })
    } else {
      MetaGameStore.PlayerStatistics.appealsProcessed++
      if (MetaGameStore.PlayerStatistics.appealsProcessed >= 50) {
        GameSessionStore.registerAchievement('foryourreconsideration')
      }
      // if appeal, unwind previous game state change
      if (issueData.issueType == 'appealTakeDown') {
        if (action == 'takeDown') {
          MetaGameStore.PlayerStatistics.appealsDenied++
          if (MetaGameStore.PlayerStatistics.appealsDenied >= 50) {
            GameSessionStore.registerAchievement('requestdenied')
          }
        } else if (action == 'keepUp') {
          MetaGameStore.PlayerStatistics.appealsAccepted++
          if (MetaGameStore.PlayerStatistics.appealsAccepted >= 50) {
            GameSessionStore.registerAchievement('onsecondthought')
          }
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
          MetaGameStore.PlayerStatistics.appealsDenied++
          if (MetaGameStore.PlayerStatistics.appealsDenied >= 50) {
            GameSessionStore.registerAchievement('requestdenied')
          }
        } else if (action == 'takeDown') {
          MetaGameStore.PlayerStatistics.appealsAccepted++
          if (MetaGameStore.PlayerStatistics.appealsAccepted >= 50) {
            GameSessionStore.registerAchievement('onsecondthought')
          }
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
          issueData.postIssueInterstitial = [
            'Hmm... Not the decision I would have made.',
            "I don't think that aligns with our policies...",
          ].sample()
        } else if (responseObject[action].publicSafety < 0) {
          issueData.postIssueInterstitial = [
            "Some users are leaving the platform, saying it's not safe for them.",
            'Users are happy with that content staying up...',
          ].sample()
        } else if (responseObject[action].publicFreeSpeech < 0) {
          issueData.postIssueInterstitial = [
            'Some users are angry about us "censoring" them.',
            'Some users are quitting TrustHive and moving to platforms that have more relaxed policies.',
          ].sample()
        }
      }
    }

    let arcName =
      issueData.issueType === 'arc'
        ? issueData.issueID.slice(0, issueData.issueID.indexOf('-'))
        : null

    if (actionConsequences?.forcedNextArc) {
      this.forcedNextArc.push(actionConsequences?.forcedNextArc)
    }

    // check for game ending
    if (actionConsequences?.endGame) {
      GameSessionStore.endGame(actionConsequences.endGame, 'BAD')
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
      } else if (
        GameSessionStore.timeRemaining > 0 ||
        GameSessionStore.currentRound == 0
      ) {
        this.startNextCard()
      } else if (!issueData.postIssueInterstitial) {
        this.endRound()
      }
    }
  },
  endRound() {
    MetaGameStore.PlayerStatistics.highestRoundCompleted = Math.max(
      GameSessionStore.currentRound,
      MetaGameStore.PlayerStatistics.highestRoundCompleted
    )

    if (MetaGameStore.PlayerStatistics.highestRoundCompleted >= 8) {
      GameSessionStore.registerAchievement('thelonghaul')
    } else if (MetaGameStore.PlayerStatistics.highestRoundCompleted >= 5) {
      GameSessionStore.registerAchievement('hanginginthere')
    } else if (MetaGameStore.PlayerStatistics.highestRoundCompleted >= 3) {
      GameSessionStore.registerAchievement('knowtheropes')
    }

    GameSessionStore.betweenRounds = true
    GameSessionStore.triggerPostRound()

    // check for START
    if (GameSessionStore.currentRound == 2) {
      // remove any remaining START cards from current queue
      IssueQueueStore.currentIssueQueue =
        IssueQueueStore.currentIssueQueue.filter(
          (issue) =>
            issue.issueID.slice(0, issue.issueID.indexOf('-')) !== 'START'
        )

      // remove any remaining START cards from unprocessed queue
      IssueQueueStore.unprocessedFollowUps =
        IssueQueueStore.unprocessedFollowUps.filter(
          (issueInsert) =>
            issueInsert.issueObject.issueID.slice(
              0,
              issueInsert.issueObject.issueID.indexOf('-')
            ) !== 'START'
        )
      this.processEndedArc('START')
    }

    // check for BETAAI
    if (GameSessionStore.currentRound == GameDefaults.betaAIRound) {
      // remove any remaining BETAAI cards from current queue
      IssueQueueStore.currentIssueQueue =
        IssueQueueStore.currentIssueQueue.filter(
          (issue) =>
            issue.issueID.slice(0, issue.issueID.indexOf('-')) !== 'BETAAI'
        )

      // remove any remaining BETAAI cards from unprocessed queue
      IssueQueueStore.unprocessedFollowUps =
        IssueQueueStore.unprocessedFollowUps.filter(
          (issueInsert) =>
            issueInsert.issueObject.issueID.slice(
              0,
              issueInsert.issueObject.issueID.indexOf('-')
            ) !== 'BETAAI'
        )
      this.processEndedArc('BETAAI')
    }
  },
  insertIssueInQueue(issueObject, insertDelay = 1) {
    // console.log(issueObject, insertDelay, insertPosition)
    if (GameSessionStore.timeRemaining <= 0) insertDelay = 0
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
    // console.log('closing interstitial')
    GameSessionStore.gameIsPaused = false
    this.interstitialShown = false
    this.interstitialKey++
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
  selectArcsForSession() {
    let dedicatedArcs = [
      {
        arcName: 'START',
        round: 1,
      },
      {
        arcName: 'BETAAI',
        round: GameDefaults.betaAIRound,
      },
      {
        arcName: 'BETTERAI',
        round: GameDefaults.betterAIRound,
      },
    ]
    this.upcomingArcs.push(...dedicatedArcs)
  },
  startNewRound() {
    if (GameSessionStore.currentRound == 1) {
      this.selectArcsForSession()
    }
    let newQueue = []
    let initialInterstitials = []
    // REMOVE GENERICS FROM OLD QUEUE
    for (let i = 0; i < this.currentIssueQueue.length; i++) {
      let issue = JSON.parse(JSON.stringify(this.currentIssueQueue[i]))
      if (issue.issueType !== 'generic') {
        newQueue.push(issue)
      }
    }

    // sort unprocessed queue issues
    let leftOverArcCards = []
    let leftOverAppeals = []
    let betterAICards = []
    let carryoverQueue = []
    for (let i = 0; i < this.unprocessedFollowUps.length; i++) {
      if (!this.unprocessedFollowUps[i].processed) {
        let issue = JSON.parse(
          JSON.stringify(this.unprocessedFollowUps[i].issueObject)
        )
        if (issue.issueType.slice(0, 6) == 'appeal') {
          leftOverAppeals.push(issue)
        } else if (issue.issueType.startsWith('BETTERAI')) {
          betterAICards.push(issue)
        } else {
          leftOverArcCards.push(issue)
        }
      }
    }

    // check for room for unprocessed appeals and mix them into unprocessed arcs
    carryoverQueue.push(...leftOverArcCards)
    let roomForAppeals =
      GameDefaults.maxCarryoverLength -
      leftOverArcCards.length -
      newQueue.length
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

    this.unprocessedFollowUps = []

    // add unprocessed carryover queue to old current queue
    newQueue = newQueue.concat(carryoverQueue)

    // for (let i = 0; i < carryoverQueue.length; i++) {
    //   let issue = carryoverQueue[i]

    //   if (newQueue.length < GameDefaults.maxCarryoverLength) {
    //     newQueue.push(issue)
    //   } else {
    //     // space issues out
    //     let insertDelay = GameDefaults.timeBetweenArcCards
    //     if (issue.issueType.startsWith('BETTERAI')) {
    //       insertDelay = GameDefaults.timeBetweenBetterAICards
    //     }
    //     this.insertIssueInQueue(issue, insertDelay * (i + 1))
    //   }
    // }

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

    // fallback if player has seen all arcs across sessions, look at this on a round by round basis
    if (!filteredArcOptions.length) {
      filteredArcOptions = Object.keys(ArcLookup).filter(
        (arc) =>
          ArcLookup[arc].earliestRound <= GameSessionStore.currentRound &&
          // check session
          !this.arcsInProgress.includes(arc) &&
          !this.arcsCompleted.includes(arc)
      )
    }

    // console.log('filtered arcs: ', filteredArcOptions)

    if (this.upcomingArcs.length) {
      this.upcomingArcs.forEach((arc) => {
        if (arc.round == GameSessionStore.currentRound) {
          this.forcedNextArc.unshift(arc.arcName)
        }
      })
    }

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
      // console.log('in progress', this.arcsInProgress)

      let initialArcCards = ArcIssues.getIssuesByID(selectedArc.initialIssues)

      // Check for initial interstitial for grab bag arcs
      if (initialArcCards.length > 1) {
        let arcIntroInterstitial = initialArcCards.shift()
        initialInterstitials.unshift(arcIntroInterstitial)
      }

      // shuffle cards initial cards for new arc
      for (var i = initialArcCards.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1))
        var temp = initialArcCards[i]
        initialArcCards[i] = initialArcCards[j]
        initialArcCards[j] = temp
      }

      // interleave old round cards and new arc
      newQueue = this.interleaveDecks(newQueue, initialArcCards)
    }

    // Add at least two generics and maybe more to bring up to min queue size
    let excludeArray = this.genericIssuesSeen.concat(
      this.getIssueIDsInCurrentQueue(),
      GenericIssues.getIDsOfBotIssues()
    )
    let numberOfGenericsToAdd = Math.max(
      minimumStartingQueueLength - newQueue.length,
      2
    )
    newQueue = this.interleaveDecks(
      newQueue,
      GenericIssues.getRandomIssues(numberOfGenericsToAdd, excludeArray)
    )

    // SPECIAL NOTIFICATIONS
    // First round judgement message
    if (GameSessionStore.currentRound == 1) {
      let startIntroduction = initialInterstitials.shift()
      initialInterstitials.unshift(GenericFollowUps.getIssueByID('M-JUDGE'))
      initialInterstitials.unshift(startIntroduction)
    }

    // BETAAI over interstitial
    if (GameSessionStore.currentRound == GameDefaults.betaAIRound + 1) {
      initialInterstitials.unshift(
        GenericFollowUps.getIssueByID('F-BETAAI-END')
      )
    }

    // Foreshadow promotion
    if (GameSessionStore.currentRound == GameDefaults.finalRound) {
      if (
        GameSessionStore.overallPerformance >
        GameDefaults.overallPerformanceWarn
      ) {
        initialInterstitials.unshift(
          GenericFollowUps.getIssueByID('F-PROMOTION-FORESHADOW-GOOD')
        )
      } else {
        initialInterstitials.unshift(
          GenericFollowUps.getIssueByID('F-PROMOTION-FORESHADOW-BAD')
        )
      }
    }

    let startingQueue = initialInterstitials.concat(
      newQueue.slice(0, minimumStartingQueueLength)
    )
    let laterQueue = newQueue.slice(minimumStartingQueueLength)

    this.currentIssueQueue = startingQueue

    // add later queue to unprocessed queue
    for (let i = 0; i < laterQueue.length; i++) {
      let issue = laterQueue[i]

      // space issues out
      let insertDelay = GameDefaults.timeBetweenArcCards
      if (GameSessionStore.currentRound <= 2) {
        insertDelay = GameDefaults.timeBetweenStartCards
      }
      this.insertIssueInQueue(issue, insertDelay * (i + 1))
    }

    // add betterai to upcoming queue
    if (betterAICards.length) {
      for (let i = 0; i < laterQueue.length; i++) {
        let issue = betterAICards[i]

        // space issues out
        let insertDelay = GameDefaults.timeBetweenBetterAICards
        this.insertIssueInQueue(issue, insertDelay * (i + 1))
      }
    }

    GameSessionStore.betweenRounds = false
    this.startNextCard()
  },
  addRandomIssue(numberOfIssues = 1) {
    let excludeArray = this.genericIssuesSeen.concat(
      this.getIssueIDsInCurrentQueue(),
      GenericIssues.getIDsOfBotIssues()
    )

    // console.log('queue IDs', this.getIssueIDsInCurrentQueue())

    if (numberOfIssues == 1) {
      let newIssue = GenericIssues.getRandomIssue(excludeArray)
      if (excludeArray.includes(newIssue.issueID)) {
        console.log('DUPLICATE ADDED', newIssue.issueID)
      }
      this.currentIssueQueue.push(newIssue)
    } else {
      this.currentIssueQueue.push(
        ...GenericIssues.getRandomIssues(numberOfIssues, excludeArray)
      )
    }
  },
})
