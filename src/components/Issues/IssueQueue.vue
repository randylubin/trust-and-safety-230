<script setup>
// import { ref } from "vue";
import IssueCard from "./IssueCard.vue";
import { IssueQueueStore } from "./../../stores/IssueQueueStore.js";
</script>

<template>
  <IssueCard
    v-for="(issue, index) in IssueQueueStore.currentIssueQueue"
    :key="issue.issueID"
    :queueIndex="index"
    :issue-data="issue"
  ></IssueCard>
</template>

<style scoped></style>
