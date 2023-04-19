export const GameDefaults = {
  // Rounds
  roundLength: 100, // default seconds for a round
  slowModeTick: 0.5, // time change per tick for slow mode (regular mode is 1 second per tick)
  extraTimeForLastCard: -5, // seconds after round clock hits 0
  minimumStartingQueueLength: 5, // min number of cards at start of a round
  maxCarryoverLength: 5, // max number of cards at start of a round (arcs might push this over)
  genericDrawLikelihood: 1, // odds of drawing a generic card each second
  startingGrabBagCardCount: 3,
  timeBetweenArcCards: 3, // seconds between arc cards being added (for grab bags)

  // Appeals
  appealLikelihood: 0.5, // percent chance of appeal
  appealDelay: 2, // seconds before appeal is added to queue

  // Interactions
  // Wait to unlock 'learn more'
  // 'learn more' hold time

  // Feedback
  oddsOfFeedbackInterstitial: 0.25,
}
