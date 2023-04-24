export const GameDefaults = {
  // META
  useLocalIssueData: false,
  enableSavingIssuesLocally: true,
  finalRound: 7,

  // ROUNDS
  // Round timing
  roundLength: 120, // default seconds for a round
  slowModeTick: 0.5, // time change per tick for slow mode (regular mode is 1 second per tick)
  extraTimeForLastCard: -5, // seconds after round clock hits 0
  genericDrawLikelihood: 0.33, // odds of drawing a generic card each second
  // Round setup
  minimumStartingQueueLength: 5, // min number of cards at start of a round
  maxCarryoverLength: 5, // max number of cards at start of a round (arcs might push this over)
  startingGrabBagCardCount: 3,
  timeBetweenArcCards: 3, // seconds between arc cards being added (for grab bags)

  // CARD ACTIONS
  // Appeals
  appealLikelihood: 0.5, // percent chance of appeal
  appealDelay: 2, // seconds before appeal is added to queue
  // Immediate Feedback
  oddsOfFeedbackInterstitial: 0.25,
  // Interactions
  lookCloserExamineDelay: 0, // time on card before look closer is available, in 200ms ticks
  lookCloserExamineTime: 7, // time it takes to Look Closer, in 200ms ticks

  // GAME STATE
  // Initial state and round updates
  overallPerformanceStartingState: 5,
  roundQualityStartingState: 10,
  // Post-round feedback thresholds
  overallPerformancePromote: 10,
  overallPerformancePraise: 7,
  overallPerformanceWarn: 3,
  roundQualityPraise: 10,
  roundQualityWarn: 5,
  cardsPerRoundPraise: 25,
  cardsPerRoundWarn: 15,
  cardsPerRoundFire: 2,
  publicWarnLevel: 3,
  publicPraiseLevel: 8,

  // ARC SELECTION
  betaAIRound: 4,
  betterAIRound: 6,
}
