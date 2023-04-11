export const GameDefaults = {
  // Rounds
  roundLength: 100, // default seconds for a round
  extraTimeForLastCard: -5, // seconds after round clock hits 0
  minimumStartingQueueLength: 5, // min number of cards at start of a round
  maxCarryoverLength: 5, // max number of cards at start of a round (arcs might push this over)
  genericDrawLikelihood: 0.33, // odds of drawing a generic card each second

  // Appeals
  appealLikelihood: 0.5, // percent chance of appeal
  appealDelay: 2, // seconds before appeal is added to queue

  // Interactions
  // Wait to unlock 'learn more'
  // 'learn more' hold time

  // Feedback
  oddsOfFeedbackInterstitial: 0.25,
}
