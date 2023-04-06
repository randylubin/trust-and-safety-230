import axios from 'axios'

let issueSheet =
  'https://sheets.googleapis.com/v4/spreadsheets/' +
  '1AfJezLhw9YMFTXbqdlmT_edHpxYo6Z4k2-13UCW4fzA' +
  '/?includeGridData=true&ranges=Achievements!a1:aa400&key=' +
  import.meta.env.VITE_APP_FIREBASE_API_KEY

let PossibleAchievementsList = []

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
        cleanData[i] = {
          title: item.values[0],
          description: item.values[1],
        }
      }
    })

    cleanData.shift()

    PossibleAchievementsList = cleanData
  })
  .catch((error) => {
    console.log(error.message, error)
  })

export { PossibleAchievementsList as PossibleAchievementsList }
