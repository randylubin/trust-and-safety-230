import axios from 'axios'
import IssueDatabase from './_IssueDatabase.js'

let issueSheet =
  'https://sheets.googleapis.com/v4/spreadsheets/' +
  '1AfJezLhw9YMFTXbqdlmT_edHpxYo6Z4k2-13UCW4fzA' +
  '/?includeGridData=true&ranges=Arcs!a1:aa400&key=' +
  import.meta.env.VITE_APP_FIREBASE_API_KEY

let arcsFromGoogleSheet = []

const ArcIssues = new IssueDatabase()

axios
  .get(issueSheet)
  .then((response) => {
    // CLEAN UP DATA
    console.log(response.data.sheets)
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

      newIssue.issueType = 'arc'

      // console.log(issue[keepUpConsequencesColumnIndex])
      newIssue['keepUpConsequences'] = issue[keepUpConsequencesColumnIndex]
        ? JSON.parse(issue[keepUpConsequencesColumnIndex])
        : null
      newIssue['takeDownConsequences'] = issue[takeDownConsequencesColumnIndex]
        ? JSON.parse(issue[takeDownConsequencesColumnIndex])
        : null

      arcsFromGoogleSheet.push(newIssue)
    })

    console.log(arcsFromGoogleSheet)
    ArcIssues.importIssues(arcsFromGoogleSheet)
  })
  .catch((error) => {
    console.log(error.message, error)
  })

export { ArcIssues as ArcIssues }

// export const ArcIssues = [
//   {
//     issueText: 'example issue text 1',
//     issueID: '1',
//     correctResponse: 'keepUp',
//     postIssueInterstitial: "here's a post-interstitial",
//   },
//   {
//     issueText: 'example issue text 2',
//     issueID: '2',
//     correctResponse: 'keepUp',
//   },
//   {
//     interstitialOnly: "this is an interstitial that isn't attached to a card",
//   },
//   {
//     issueText: 'example issue text 3',
//     issueID: '3',
//     correctResponse: 'keepUp',
//     preIssueInterstitial: "here's a pre-interstitial",
//   },
// ]
