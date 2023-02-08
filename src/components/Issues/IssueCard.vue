<script setup>
import { ref } from "vue";
import { IssueQueueStore } from "./../../stores/IssueQueueStore.js";

const props = defineProps({
  issueData: Object,
  queueIndex: Number,
});

const learnMoreVisible = ref(false);

function learnMore() {
  learnMoreVisible.value = true;
}
</script>

<template>
  <div class="issue-card" :class="{ 'active-issue': queueIndex === 0 }">
    <p>{{ issueData.issueText }}</p>
    <p v-if="learnMoreVisible">{{ issueData.learnMoreText }}</p>
    <button @click="IssueQueueStore.takeAction('keepUp', issueData)">
      Keep Up
    </button>
    <button @click="IssueQueueStore.takeAction('takeDown', issueData)">
      Take Down
    </button>
    <button @click="learnMore()">Learn More</button>
  </div>
</template>

<style scoped>
.issue-card {
  border: 1px solid;
  border-color: grey;
}

.active-issue {
  background-color: darkblue;
}
</style>
