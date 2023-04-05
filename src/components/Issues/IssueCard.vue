<script setup>
import { ref, computed, onMounted, onUpdated } from 'vue'
import { ContentRules } from '../../issueData/ContentRules.js'

const Props = defineProps({
  IssueData: Object,
})

const ContentRule = ContentRules[Props.IssueData.reportedFor]
const isAppeal = Props.IssueData.issueType.startsWith('appeal')
let appealText = null
const originalDecision = ref(null)
if (Props.IssueData.issueType === 'appealTakeDown') {
  appealText = ref(Props.IssueData.appealIfTakeDown)
  originalDecision.value = 'take down'
} else if (Props.IssueData.issueType === 'appealKeepUp') {
  appealText = ref(Props.IssueData.appealIfKeepUp)
  originalDecision.value = 'keep up'
}

const issueTextSize = ref(2.5)
const appealTextSize = ref(2.5)
const issueTextElement = ref(null)
const issueTextInnerElement = ref(null)
const appealTextElement = ref(null)
const appealTextInnerElement = ref(null)
const issueTextSpace = computed(() => {
  return issueTextElement.value?.clientHeight
})
const appealTextSpace = computed(() => {
  return appealTextElement.value?.clientHeight
})

const shrinkText = function () {
  /* Be careful around this code. Mistakes could cause infinite loop. */
  if (
    issueTextInnerElement.value?.getBoundingClientRect().height >
      issueTextSpace.value &&
    issueTextSize.value > 1.5 // <-- necessary to prevent infinite loop
  ) {
    issueTextSize.value -= 0.1
  }

  if (
    appealTextInnerElement.value?.getBoundingClientRect().height >
      appealTextSpace.value &&
    appealTextSize.value > 1.5 // <-- necessary to prevent infinite loop
  ) {
    appealTextSize.value -= 0.1
  }
}
onMounted(shrinkText)
onUpdated(shrinkText)
</script>

<template>
  <div class="flip-container">
    <div class="issue-card" ref="cardElement">
      <div v-if="ContentRule" class="card-section section-rule">
        <div class="section-label">
          <span>Reported For:</span>
        </div>
        <div class="rule-text" :class="'rule-' + ContentRule.ruleID">
          {{ ContentRule.ruleName }}
        </div>
      </div>
      <div class="issue-text-sizer" ref="issueTextElement">
        <div class="issue-text-inner" ref="issueTextInnerElement">
          <div class="card-section section-issue">
            <div class="section-label">
              <span>Description:</span>
            </div>
            <div
              class="issue-text"
              :style="{ 'font-size': issueTextSize + 'rem' }"
            >
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
            <div
              class="includes-text"
              :style="{ 'font-size': issueTextSize + 'rem' }"
            >
              {{ IssueData.issueIncludesTags }}
            </div>
          </div>
        </div>
      </div>
      <div class="card-section section-button" v-if="isAppeal">
        <button class="btn-basic" @pointerdown="$emit('flip-card')">
          &larr; Review Appeal
        </button>
      </div>
    </div>
    <div class="appeal-card" v-if="isAppeal" @pointerdown="$emit('flip-card')">
      <div v-if="ContentRule" class="card-section section-appeal-header">
        <div class="appeal-header-text" :class="'rule-' + ContentRule.ruleID">
          A user has appealed your decision to
          <span
            class="tag-decision"
            :class="{
              takedown: IssueData.issueType === 'appealTakeDown',
              keepup: IssueData.issueType === 'appealKeepUp',
            }"
          >
            {{ originalDecision }}
          </span>
          content that was reported as
          <span class="tag-rule">{{ ContentRule.ruleName }}</span>.
        </div>
      </div>
      <div class="appeal-text-sizer" ref="appealTextElement">
        <div class="appeal-text-inner" ref="appealTextInnerElement">
          <div class="card-section section-appeal">
            <div class="section-label">
              <span>User Appeal:</span>
            </div>
            <div
              class="appeal-text"
              :style="{ 'font-size': appealTextSize + 'rem' }"
            >
              &ldquo;{{ appealText }}&rdquo;
            </div>
          </div>
        </div>
      </div>
      <div
        class="card-section section-button"
        v-if="isAppeal"
        ref="cardButtonElement"
      >
        <button class="btn-basic">Review Content &rarr;</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.issue-card,
.appeal-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: var(--card-bg-color);
  border-radius: 3.6rem;
  padding: 3rem 2rem 2rem;
  box-sizing: border-box;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  backface-visibility: hidden;
  touch-action: none;
  text-align: left;
}

.issue-card {
  border: 1.6rem solid var(--card-innershadow-color);
  box-shadow: 0 -2px 0 var(--card-outershadow-color),
    1px 0 0 var(--card-outershadow-color),
    -1px 0 0 var(--card-outershadow-color),
    0 1px 0 var(--card-outershadow-color);
}
.appeal-card, .appeal .issue-card {
  border: 1.6rem solid var(--card-appeal-innershadow-color);
  box-shadow: 0 -2px 0 var(--card-appeal-outershadow-color),
    1px 0 0 var(--card-appeal-outershadow-color),
    -1px 0 0 var(--card-appeal-outershadow-color),
    0 1px 0 var(--card-appeal-outershadow-color);
}

.appeal-card {
  transform: rotateY(180deg);
}

.flip-container {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  transform-style: preserve-3d;
  transition: transform .5s;
}

.appeal.flipped .flip-container {
  transform: rotateY(180deg);
}

.card-section {
  flex-grow: 0;
  flex-shrink: 0;
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

.issue-text-sizer,
.appeal-text-sizer {
  flex-shrink: 1;
  flex-grow: 1;
  margin-bottom: 2rem;
  overflow: hidden;
}

.section-button {
  margin: 0;
}
.section-button button {
  display: block;
  width: 100%;
}

.rule-text {
  font-weight: 300;
  font-size: 3.5rem;
}

.appeal-header-text {
  font-weight: 300;
  font-size: 2rem;
}

.issue-text,
.includes-text,
.appeal-text {
  font-weight: 300;
  font-size: 2.5rem;
}

.appeal-text {
  font-style: italic;
}

.tag-decision,
.tag-rule {
  font-weight: 600;
  color: rgb(90, 90, 90);
  white-space: nowrap;
}

.tag-decision.takedown {
  color: var(--takedown-text-color);
}

.tag-decision.keepup {
  color: var(--keepup-text-color);
}
</style>
