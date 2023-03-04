import IssueDatabase from './_IssueDatabase.js'

export const TutorialIssues = new IssueDatabase([
  {
    issueID: 'T0001',
    issueText: 'Welcome to TK. Swipe to the right or left to continue',
    issueType: 'tutorial',
  },
  {
    issueID: 'T0002',
    issueText:
      'As content moderator, you will decide what content to keep up and what content to take down. Keep up by swiping right and take down by swiping left. Swipe right now to keep this content up.',
    learnMoreText: 'learn more text',
    keepUpConsequences: { postIssueInterstitial: 'Good Job' },
    takeDownConsequences: { postIssueInterstitial: 'Wrong' },
    issueType: 'tutorial',
  },
  {
    issueID: 'F1002',
    interstitialOnly:
      "Sometimes you'll see messages like this. The timer stops while the message is on screen.",
    issueType: 'genericFollowUp',
  },
])
