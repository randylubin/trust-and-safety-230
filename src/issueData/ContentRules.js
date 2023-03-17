import axios from 'axios'

let issueSheet =
  'https://sheets.googleapis.com/v4/spreadsheets/' +
  '1AfJezLhw9YMFTXbqdlmT_edHpxYo6Z4k2-13UCW4fzA' +
  '/?includeGridData=true&ranges=ContentRules!a1:aa400&key=' +
  import.meta.env.VITE_APP_FIREBASE_API_KEY

const ContentRules = {}

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

    // GENERATE ISSUES FROM CLEAN DATA
    cleanData.forEach((rule) => {
      let newRule = {}

      for (let i = 0; i < rule.length; i++) {
        newRule[sheetHeaders[i]] = rule[i]
      }
      ContentRules[newRule.ruleID] = newRule
    })
  })
  .catch((error) => {
    console.log(error.message, error)
  })

export { ContentRules as ContentRules }
