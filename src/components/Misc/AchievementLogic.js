import axios from 'axios'
import { reactive } from 'vue'
import { GameDefaults } from '../../GameDefaults.js'
import ModeratorMayhemIssueData from '../../issueData/ModeratorMayhemIssueData.js'

let issueSheet =
  'https://sheets.googleapis.com/v4/spreadsheets/' +
  '1AfJezLhw9YMFTXbqdlmT_edHpxYo6Z4k2-13UCW4fzA' +
  '/?includeGridData=true&ranges=Achievements!a1:aa400&key=' +
  import.meta.env.VITE_APP_FIREBASE_API_KEY

let PossibleAchievementsList

if (!GameDefaults.useLocalIssueData) {
  axios
    .get(issueSheet)
    .then((response) => {
      // CLEAN UP DATA
      // console.log(response.data.sheets)
      let rawSheetData = response.data.sheets[0].data[0].rowData
      let cleanData = {}
      rawSheetData.forEach((item,i) => {
        if (item.values && item.values[0] && i > 0) {
          cleanData[item.values[0].formattedValue] = {
            id: item.values[0].formattedValue,
            title: item.values[1].formattedValue,
            description: item.values[2].formattedValue,
          }
        }
      })

      PossibleAchievementsList = reactive(cleanData)
    })
    .catch((error) => {
      console.log(error.message, error)
    })
} else {
  PossibleAchievementsList = ModeratorMayhemIssueData.PossibleAchievementsList
}
export { PossibleAchievementsList as PossibleAchievementsList }
