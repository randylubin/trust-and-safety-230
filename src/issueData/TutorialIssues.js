import axios from 'axios'
import IssueDatabase from './_IssueDatabase.js'

let issueSheet =
  'https://sheets.googleapis.com/v4/spreadsheets/' +
  '1AfJezLhw9YMFTXbqdlmT_edHpxYo6Z4k2-13UCW4fzA' +
  '/?includeGridData=true&ranges=Tutorial!a1:aa400&key=' +
  import.meta.env.VITE_APP_FIREBASE_API_KEY

let tutorialFromGoogleSheet = []

const TutorialIssues = new IssueDatabase()

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

      newIssue.issueType = 'tutorial'

      // console.log(issue[keepUpConsequencesColumnIndex])
      newIssue['keepUpConsequences'] = issue[keepUpConsequencesColumnIndex]
        ? JSON.parse(issue[keepUpConsequencesColumnIndex])
        : null
      newIssue['takeDownConsequences'] = issue[takeDownConsequencesColumnIndex]
        ? JSON.parse(issue[takeDownConsequencesColumnIndex])
        : null

      tutorialFromGoogleSheet.push(newIssue)
    })

    console.log('tutorial issues:', tutorialFromGoogleSheet)
    TutorialIssues.importIssues(tutorialFromGoogleSheet)
  })
  .catch((error) => {
    console.log(error.message, error)
  })

export { TutorialIssues as TutorialIssues }
