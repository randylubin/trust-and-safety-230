<script setup>
import { ref } from 'vue'
import { GameSessionStore } from '../../stores/GameSessionStore'
import { IssueQueueStore } from '../../stores/IssueQueueStore'
import { MetaGameStore } from '../../stores/MetaGameStore'
import { PossibleAchievementsList } from './AchievementLogic'
import { ArcIssues } from '../../issueData/ArcIssues'
import { ContentRules } from '../../issueData/ContentRules'
import { GenericIssues } from '../../issueData/GenericIssues'
import { GenericFollowUps } from '../../issueData/GenericFollowUps'
import { TutorialIssues } from '../../issueData/TutorialIssues'
import { GameDefaults } from '../../GameDefaults.js'

const achSelect = ref('')
const newPerformance = ref(0)

const updatePerformance = function (newPerformance) {
  GameSessionStore.overallPerformance = parseInt(newPerformance)
}

const saveIssueDataToFile = function () {
  // Convert the array to a JSON string
  const objectString =
    'export default ' +
    JSON.stringify({
      ArcIssues: ArcIssues.getAllIssues(),
      GenericIssues: GenericIssues.getAllIssues(),
      GenericFollowUps: GenericFollowUps.getAllIssues(),
      TutorialIssues: TutorialIssues.getAllIssues(),
      ContentRules: ContentRules,
      PossibleAchievementsList: PossibleAchievementsList,
    })
  console.log('downloading', objectString)

  // Create a Blob object from the JSON data
  const blob = new Blob([objectString], { type: 'text/javascript' })

  // Create a link element to download the file
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'ModeratorMayhemIssueData.js'
  link.click()
}
</script>

<template>
  <div class="dev-tools">
    <h1>Dev Tools</h1>
    <button @click="GameSessionStore.timesUp(true)">Set Timer to Zero</button>
    <button
      v-if="GameDefaults.enableSavingIssuesLocally"
      @click="saveIssueDataToFile()"
    >
      Save Issues to File
    </button>
    <br />
    <select v-model="achSelect">
      <option
        v-for="achievement in PossibleAchievementsList"
        :key="achievement.id"
      >
        {{ achievement.id }}
      </option>
    </select>
    <button @click="GameSessionStore.registerAchievement(achSelect)">
      Achieve!</button
    ><br />
    <input v-model="newPerformance" />
    <button @click="updatePerformance(newPerformance)">
      Update performance</button
    ><br />
    <button @click="MetaGameStore.clearAchievements">Clear Achievements</button>
    <div>Current Round: {{ GameSessionStore.currentRound }}</div>
    <div>Time Remaining: {{ GameSessionStore.timeRemaining }}</div>
    <div>Current Queue: {{ IssueQueueStore.currentIssueQueue.length }}</div>
    <div>
      Unprocessed Queue: {{ IssueQueueStore.unprocessedFollowUps.length }}
    </div>
    <div>Overall Performance {{ GameSessionStore.overallPerformance }}</div>
    <div>Round Quality {{ GameSessionStore.roundQuality }}</div>
    <div>
      Manager Disagreements {{ GameSessionStore.disagreeWithManagerThisRound }}
    </div>
    <div>Public Free Speech {{ GameSessionStore.publicFreeSpeech }}</div>
    <div>Public Safety {{ GameSessionStore.publicSafety }}</div>
    <h2>Generics Seen</h2>
    <div>{{ IssueQueueStore.genericIssuesSeen }}</div>
    <h2>Current Queue</h2>
    <div
      v-for="(issue, key) in IssueQueueStore.currentIssueQueue"
      v-bind:key="key"
      style="margin-bottom: 5px"
    >
      {{ issue.issueID }} {{ issue.issueText }}
    </div>
    <h2>Unprocessed Queue</h2>
    <div
      v-for="(issue, key) in IssueQueueStore.unprocessedFollowUps"
      v-bind:key="key"
      style="margin-bottom: 5px"
    >
      <div v-if="!issue.processed">
        {{ issue.issueObject.issueID }} {{ issue.issueObject.issueText }}
      </div>
    </div>
    <h2>Achievements</h2>
    <div
      v-for="achievement in MetaGameStore.achievements"
      v-bind:key="achievement"
      style="margin-bottom: 5px"
    >
      {{ achievement }}
    </div>
  </div>
</template>

<style scoped>
.dev-tools {
  color: black;
  position: fixed;
  top: 0;
  left: 0;
  border: 1px darkgrey solid;
  background-color: white;
  margin: 1rem;
  padding: 1rem;
  max-width: 300px;
  max-height: 90%;
  overflow-y: auto;
}
</style>
