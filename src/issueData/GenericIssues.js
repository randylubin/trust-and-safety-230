export const GenericIssues = {
  G1000: {
    issueText: 'example issue text 1',
    learnMoreText: 'learn more text',
    issueID: '1',
    correctResponse: 'keepUp',
    postIssueInterstitial: "here's a post-interstitial",
    keepUpConsequences: {
      followUpID: 'F1000',
      followUpTimeDelay: 2,
      followUpPosition: null,
    },
    issueType: 'generic',
  },
  G1001: {
    issueText: 'example issue text 2',
    learnMoreText: 'learn more text',
    issueID: '2',
    correctResponse: 'keepUp',
    issueType: 'generic',
  },
  G1002: {
    interstitialOnly: "this is an interstitial that isn't attached to a card",
    issueType: 'generic',
  },
  G1003: {
    issueText: 'example issue text 3',
    learnMoreText: 'learn more text',
    issueID: '3',
    correctResponse: 'keepUp',
    preIssueInterstitial: "here's a pre-interstitial",
    issueType: 'generic',
  },
}

export const GenericIssuesIDArray = ['G1000', 'G1001', 'G1002', 'G1003']
