<script setup>
import { GameSessionStore } from '../stores/GameSessionStore'
import { IssueQueueStore } from '../stores/IssueQueueStore'
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
  </div>
</template>

<style scoped>
.dev-tools {
  border: 1px darkgrey solid;
  margin-top: 1rem;
}
</style>
