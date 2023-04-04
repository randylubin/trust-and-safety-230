<script setup>
import { ContentRules } from '../../issueData/ContentRules.js'

const Props = defineProps({
  IssueData: Object,
})

const ContentRule = ContentRules[Props.IssueData.reportedFor]
</script>

<template>
  <div class="issue-card">
    <!-- TODO remove appeal placeholder -->
    <h1
      style="color: red"
      v-if="IssueData.issueType && IssueData.issueType.slice(0, 6) == 'appeal'"
    >
      APPEAL
    </h1>
    <div v-if="ContentRule" class="card-section section-rule">
      <div class="section-label">
        <span>Reported For:</span>
      </div>
      <div class="rule-text" :class="'rule-' + ContentRule.ruleID">
        {{ ContentRule.ruleName }}
      </div>
    </div>
    <div class="card-section section-issue">
      <div class="section-label">
        <span>Description:</span>
      </div>
      <div class="issue-text">
        {{ IssueData.issueText }}
      </div>
    </div>
    <div
      v-if="IssueData.issueIncludesTags"
      class="card-section section-includes"
    >
      <div class="section-label">
        <span>Content Includes:</span>
      </div>
      <div class="includes-text">
        {{ IssueData.issueIncludesTags }}
      </div>
    </div>
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
  padding: 3rem 2rem;
  box-sizing: border-box;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  touch-action: none;
  text-align: left;
}

.card-section {
  margin-bottom: 2rem;
}

.section-label {
  height: 1.8rem;
  margin-bottom: 0.8rem;
}

.section-label > span {
  background-color: #333;
  color: white;
  padding: 0.4rem 0.6rem;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  line-height: 1;
}

.section-rule .section-label > span {
  background-color: #791414;
}

.rule-text {
  font-weight: 300;
  font-size: 3.5rem;
}

.issue-text,
.includes-text {
  font-weight: 300;
  font-size: 2.5rem;
}
</style>
