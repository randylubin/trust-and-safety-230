<script setup>
import { ref } from 'vue'
import { GameSessionStore } from '../../stores/GameSessionStore'
import { IssueQueueStore } from '../../stores/IssueQueueStore'
import { MetaGameStore } from '../../stores/MetaGameStore'
import { PossibleAchievementsList } from './AchievementLogic'

const achSelect = ref('')
</script>

<template>
  <div class="dev-tools">
    <h1>Dev Tools</h1>
    <button @click="GameSessionStore.timesUp(true)">Set Timer to Zero</button><br>
    <select v-model="achSelect">
      <option
        v-for="achievement in PossibleAchievementsList"
        :key="achievement.id"
      >
        {{ achievement.id }}
      </option>
    </select>
    <button @click="GameSessionStore.registerAchievement(achSelect)">Achieve!</button><br>
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
