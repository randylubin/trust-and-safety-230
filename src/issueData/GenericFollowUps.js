import IssueDatabase from './_IssueDatabase.js'

export const GenericFollowUps = new IssueDatabase([
  {
    issueID: 'F1000',
    issueText: 'this is a follow-up to the first issue',
    learnMoreText: 'learn more text',
    correctResponse: 'keepUp',
    issueType: 'genericFollowUp',
  },
  {
    issueID: 'F1001',
    issueText: 'example issue text 2',
    learnMoreText: 'learn more text',
    correctResponse: 'keepUp',
    issueType: 'genericFollowUp',
  },
  {
    issueID: 'F1002',
    interstitialOnly: 'this is an interstitial followup',
    issueType: 'genericFollowUp',
  },
  {
    issueID: 'F1003',
    issueText: 'example issue text 3',
    learnMoreText: 'learn more text',
    correctResponse: 'keepUp',
    preIssueInterstitial: "here's a pre-interstitial",
    issueType: 'genericFollowUp',
  },
])
