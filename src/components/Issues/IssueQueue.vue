<script setup>
import { computed } from "vue";
import { IssueQueueStore } from "./../../stores/IssueQueueStore.js";
import IssueCard from "./IssueCard.vue";

import InterstitialScreen from "./InterstitialScreen.vue";

const cardQueue = computed(() =>
  IssueQueueStore.currentIssueQueue.filter((issue) => !issue.interstitialOnly)
);
</script>

<template>
  <InterstitialScreen
    v-if="IssueQueueStore.interstitialShown"
  ></InterstitialScreen>
  <div v-if="!IssueQueueStore.interstitialShown">
    <IssueCard
      v-for="(issue, index) in cardQueue"
      :key="issue.issueID"
      :queueIndex="index"
      :issue-data="issue"
    ></IssueCard>
  </div>
</template>

<style scoped></style>
