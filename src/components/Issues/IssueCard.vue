<script setup>
import { ContentRules } from '../../issueData/ContentRules.js'

const Props = defineProps({
  IssueData: Object,
})

console.log(ContentRules[Props.IssueData.reportedFor])
const ContentRule = ContentRules[Props.IssueData.reportedFor]
</script>

<template>
  <div class="issue-card">
    <div v-if="ContentRule" class="reported-for">
      {{ ContentRule.ruleName }}
    </div>
    <p>{{ IssueData.issueText }}</p>
  </div>
</template>

<style scoped>
.issue-card {
  background-color: var(--card-bg-color);
  box-shadow: 0 -2px 0 var(--card-outershadow-color),
    1px 0 0 var(--card-outershadow-color),
    -1px 0 0 var(--card-outershadow-color),
    0 1px 0 var(--card-outershadow-color);
  border: 1.6rem solid var(--card-innershadow-color);
  border-radius: 3.6rem;
  box-sizing: border-box;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  touch-action: none;
}
</style>
