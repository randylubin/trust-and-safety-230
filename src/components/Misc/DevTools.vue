<script setup>
import { GameSessionStore } from '../../stores/GameSessionStore'
import { IssueQueueStore } from '../../stores/IssueQueueStore'
</script>

<template>
  <div class="dev-tools">
    <h1>Dev Tools</h1>
    <button @click="GameSessionStore.timesUp(true)">Set Timer to Zero</button>
    <div>Current Round: {{ GameSessionStore.currentRound }}</div>
    <div>Time Remaining: {{ GameSessionStore.timeRemaining }}</div>
    <div>Current Queue: {{ IssueQueueStore.currentIssueQueue.length }}</div>
    <div>
      Unprocessed Queue: {{ IssueQueueStore.unprocessedFollowUps.length }}
    </div>
    <div>Manager Disagreements {{ GameSessionStore.disagreeWithManager }}</div>
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
      {{ issue.issueText }}
    </div>
    <h2>Unprocessed Queue</h2>
    <div
      v-for="(issue, key) in IssueQueueStore.unprocessedFollowUps"
      v-bind:key="key"
      style="margin-bottom: 5px"
    >
      {{ issue.issueObject.issueText }}
    </div>
  </div>
</template>

<style scoped>
.dev-tools {
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
