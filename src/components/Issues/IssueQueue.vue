<script setup>
import { computed } from "vue";
import { IssueQueueStore } from "./../../stores/IssueQueueStore.js";
import IssueCard from "./IssueCard.vue";

import InterstitialScreen from "./InterstitialScreen.vue";

function filterInterstitials() {
  let filteredArray = [];
  for (let i = 0; i < IssueQueueStore.currentIssueQueue.length; i++) {
    let issue = JSON.parse(JSON.stringify(IssueQueueStore.currentIssueQueue[i]));
    if (!issue.interstitialOnly) {
      filteredArray.push(issue);
    }
  }
  return filteredArray;
}

const cardQueue = computed(() => filterInterstitials());
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
