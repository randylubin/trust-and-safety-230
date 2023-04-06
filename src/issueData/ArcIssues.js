import axios from 'axios'
import IssueDatabase from './_IssueDatabase.js'

let issueSheet =
  'https://sheets.googleapis.com/v4/spreadsheets/' +
  '1AfJezLhw9YMFTXbqdlmT_edHpxYo6Z4k2-13UCW4fzA' +
  '/?includeGridData=true&ranges=Arcs!a1:aa400&key=' +
  import.meta.env.VITE_APP_FIREBASE_API_KEY

let arcsFromGoogleSheet = []

const ArcIssues = new IssueDatabase()

let ArcLookup = {
  NUDITY: { earliestRound: 1 },
  HEALTHCARE: { earliestRound: 2 },
  ELECTION: { earliestRound: 3 },
}

axios
  .get(issueSheet)
  .then((response) => {
    // CLEAN UP DATA
    // console.log(response.data.sheets)
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
      let keepUpConsequences = issue[keepUpConsequencesColumnIndex]
      let takeDownConsequences = issue[takeDownConsequencesColumnIndex]

      if (keepUpConsequences) {
        if (keepUpConsequences.slice(0, 1) == '{') {
          newIssue['keepUpConsequences'] = JSON.parse(keepUpConsequences)
        } else {
          newIssue['keepUpConsequences'] = {
            followUpID: keepUpConsequences,
            followUpTimeDelay: 2, // TODO tie to variable
          }
        }
      }

      if (takeDownConsequences) {
        if (takeDownConsequences.slice(0, 1) == '{') {
          newIssue['takeDownConsequences'] = JSON.parse(takeDownConsequences)
        } else {
          newIssue['takeDownConsequences'] = {
            followUpID: takeDownConsequences,
            followUpTimeDelay: 2,
          }
        }
      }

      arcsFromGoogleSheet.push(newIssue)

      // Process arcs for ArcLookup
      if (newIssue.initialIssue === 'TRUE') {
        let arcName = newIssue.issueID.slice(0, newIssue.issueID.indexOf('-'))

        if (ArcLookup[arcName].initialIssues) {
          ArcLookup[arcName].initialIssues.push(newIssue.issueID)
        } else {
          ArcLookup[arcName].initialIssues = [newIssue.issueID]
        }
      }
    })

    // console.log(arcsFromGoogleSheet)

    // Add arcs to Issue Database
    ArcIssues.importIssues(arcsFromGoogleSheet)
  })
  .catch((error) => {
    console.log(error.message, error)
  })

export { ArcIssues as ArcIssues, ArcLookup as ArcLookup }
