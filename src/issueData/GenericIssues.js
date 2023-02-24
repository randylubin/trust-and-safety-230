import axios from 'axios'

let issueSheet =
  'https://sheets.googleapis.com/v4/spreadsheets/' +
  '1AfJezLhw9YMFTXbqdlmT_edHpxYo6Z4k2-13UCW4fzA' +
  '/?includeGridData=true&ranges=a1:aa400&key=' +
  import.meta.env.VITE_APP_FIREBASE_API_KEY

let genericsFromGoogleSheet = {}

axios
  .get(issueSheet)
  .then((response) => {
    // CLEAN UP DATA
    let rawSheetData = response.data.sheets[0].data[0].rowData
    let cleanData = []
    rawSheetData.forEach((item, i) => {
      cleanData.push([])
      if (item.values && item.values[0]) {
        for (let v = 0; v < item.values.length; v++) {
          if (item.values[v] && item.values[v].formattedValue) {
            cleanData[i].push(item.values[v].formattedValue)
          } else {
            cleanData[i].push(null)
          }
        }
      }
    })

    // REMOVE HEADER ROW
    let sheetHeaders = cleanData.shift()
    let keepUpConsequencesColumnIndex =
      sheetHeaders.indexOf('keepUpConsequences')
    let takeDownConsequencesColumnIndex = sheetHeaders.indexOf(
      'takeDownConsequences'
    )

    // GENERATE ISSUES FROM CLEAN DATA
    cleanData.forEach((issue) => {
      let newIssue = {}

      for (let i = 0; i < issue.length; i++) {
        newIssue[sheetHeaders[i]] = issue[i]
      }

      newIssue.issueType = 'generic'

      console.log(issue[keepUpConsequencesColumnIndex])
      newIssue['keepUpConsequences'] = issue[keepUpConsequencesColumnIndex]
        ? JSON.parse(issue[keepUpConsequencesColumnIndex])
        : null
      newIssue['takeDownConsequences'] = issue[takeDownConsequencesColumnIndex]
        ? JSON.parse(issue[takeDownConsequencesColumnIndex])
        : null

      genericsFromGoogleSheet[newIssue.issueID] = newIssue

      // genericsFromGoogleSheet[issue[0]] = {
      //   issueID: issue[0],
      //   reportedFor: issue[1],
      //   issueText: issue[2],
      //   issueIncludesTags: issue[3],
      //   learnMoreText: issue[4],
      //   correctResponse: 'keepUp',
      //   keepUpConsequences: keepUpConsequences,
      //   takeDownConsequences: takeDownConsequences,
      //   preIssueInterstitial: null,
      //   postIssueInterstitial: null,
      //   interstitialOnly: null,

      //   issueType: 'generic',
      // }
    })

    console.log(genericsFromGoogleSheet)
  })
  .catch((error) => {
    console.log(error.message, error)
  })

export const GenericIssues = genericsFromGoogleSheet

// export const oldGenericIssues = {
//   G101: {
//     issueText: 'issue text and then some more issue text',
//     learnMoreText: 'here is some learn more text',
//     issueID: '101',
//     correctResponse: 'keepUp',
//     issueType: 'generic',
//   },
//   G102: {
//     issueText: 'issue text and then some more issue text',
//     learnMoreText: 'here is some learn more text',
//     issueID: '102',
//     correctResponse: 'keepUp',
//     issueType: 'generic',
//   },
//   G103: {
//     issueText: 'issue text and then some more issue text',
//     learnMoreText: 'here is some learn more text',
//     issueID: '103',
//     correctResponse: 'keepUp',
//     issueType: 'generic',
//   },
//   G104: {
//     issueText: 'issue text and then some more issue text',
//     learnMoreText: 'here is some learn more text',
//     issueID: '104',
//     correctResponse: 'keepUp',
//     issueType: 'generic',
//   },
//   G105: {
//     issueText: 'issue text and then some more issue text',
//     learnMoreText: 'here is some learn more text',
//     issueID: '105',
//     correctResponse: 'keepUp',
//     issueType: 'generic',
//   },
//   G106: {
//     issueText: 'issue text and then some more issue text',
//     learnMoreText: 'here is some learn more text',
//     issueID: '106',
//     correctResponse: 'keepUp',
//     issueType: 'generic',
//   },
//   G1000: {
//     issueText: 'example issue text 1',
//     learnMoreText: 'learn more text',
//     issueID: '1',
//     correctResponse: 'keepUp',
//     postIssueInterstitial: "here's a post-interstitial",
//     keepUpConsequences: {
//       followUpID: 'F1000',
//       followUpTimeDelay: 2,
//       followUpPosition: null,
//     },
//     issueType: 'generic',
//   },
//   G1001: {
//     issueText: 'example issue text 2',
//     learnMoreText: 'learn more text',
//     issueID: '2',
//     correctResponse: 'keepUp',
//     issueType: 'generic',
//   },
//   G1002: {
//     interstitialOnly: "this is an interstitial that isn't attached to a card",
//     issueType: 'generic',
//   },
//   G1003: {
//     issueText: 'example issue text 3',
//     learnMoreText: 'learn more text',
//     issueID: '3',
//     correctResponse: 'keepUp',
//     preIssueInterstitial: "here's a pre-interstitial",
//     issueType: 'generic',
//   },
// }
