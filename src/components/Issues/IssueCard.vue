<script setup>
import { ref, computed, onMounted, onUpdated } from 'vue'
import { ContentRules } from '../../issueData/ContentRules.js'

const Props = defineProps({
  IssueData: Object,
  isTutorial: Boolean,
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

const ruleTooltipActive = ref(false)
let ruleTimeout = null

function showRuleTooltip() {
  clearTimeout(ruleTimeout)
  ruleTooltipActive.value = true
}

function hideRuleTooltip() {
  ruleTimeout = setTimeout(() => (ruleTooltipActive.value = false), 2000)
}

const rootTextSize = ref(1)
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
    rootTextSize.value > 0.6 // <-- necessary to prevent infinite loop
  ) {
    rootTextSize.value -= 0.05
  }

  if (
    appealTextInnerElement.value?.getBoundingClientRect().height >
      appealTextSpace.value &&
    rootTextSize.value > 0.6 // <-- necessary to prevent infinite loop
  ) {
    rootTextSize.value -= 0.05
  }
}
onMounted(shrinkText)
onUpdated(shrinkText)
</script>

<template>
  <div class="flip-container" :style="{ 'font-size': rootTextSize + 'rem' }">
    <Transition name="rule-tooltip">
      <div class="rule-info" v-if="ruleTooltipActive">
        <div>{{ ContentRule?.ruleDescription }}</div>
      </div>
    </Transition>
    <div
      class="issue-card"
      :class="{ 'bot-flagged': IssueData.botFlagged }"
      ref="cardElement"
    >
      <div v-if="ContentRule" class="card-section section-rule">
        <div class="section-label">
          <span>
            {{ IssueData.botFlagged ? 'Violation Detected:' : 'Reported For:' }}
          </span>
        </div>
        <div class="rule-text" :class="'rule-' + ContentRule.ruleID">
          <span
            class="rule-tip"
            @pointerdown="showRuleTooltip"
            @pointerup="hideRuleTooltip"
            @pointerout="hideRuleTooltip"
            >{{ ContentRule.ruleName }}</span
          >
        </div>
      </div>
      <div class="issue-text-sizer" ref="issueTextElement">
        <div class="issue-text-inner" ref="issueTextInnerElement">
          <div class="card-section section-issue">
            <div class="section-label">
              <span>{{ isTutorial ? 'Tutorial:' : 'Description:' }}</span>
            </div>
            <div class="issue-text" v-html="IssueData.issueText"></div>
          </div>
          <div
            v-if="IssueData.issueIncludesTags"
            class="card-section section-includes"
          >
            <div class="section-label">
              <span>
                {{
                  IssueData.botFlagged
                    ? 'Auto-Flagged Content:'
                    : 'Content Includes:'
                }}
              </span>
            </div>
            <div class="includes-text">
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
          <span class="tag-rule">{{ ContentRule.ruleName }}</span
          >.
        </div>
      </div>
      <div class="appeal-text-sizer" ref="appealTextElement">
        <div class="appeal-text-inner" ref="appealTextInnerElement">
          <div class="card-section section-appeal">
            <div class="section-label">
              <span>User Appeal:</span>
            </div>
            <div class="appeal-text">&ldquo;{{ appealText }}&rdquo;</div>
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
  padding: 2.5rem 2rem 2rem;
  box-sizing: border-box;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  touch-action: none;
  text-align: left;
  color: var(--card-text-color);
}

.issue-card {
  border: 1.6rem solid var(--card-innershadow-color);
  box-shadow: 0 -2px 0 var(--card-outershadow-color),
    1px 0 0 var(--card-outershadow-color),
    -1px 0 0 var(--card-outershadow-color),
    0 1px 0 var(--card-outershadow-color);
}
.appeal-card,
.appeal .issue-card {
  border: 1.6rem solid var(--card-appeal-innershadow-color);
  box-shadow: 0 -2px 0 var(--card-appeal-outershadow-color),
    1px 0 0 var(--card-appeal-outershadow-color),
    -1px 0 0 var(--card-appeal-outershadow-color),
    0 1px 0 var(--card-appeal-outershadow-color);
}

.issue-card.bot-flagged {
  border: 1.6rem solid var(--card-bot-innershadow-color);
  box-shadow: 0 -2px 0 var(--card-bot-outershadow-color),
    1px 0 0 var(--card-bot-outershadow-color),
    -1px 0 0 var(--card-bot-outershadow-color),
    0 1px 0 var(--card-bot-outershadow-color);
  background-image: url('@/assets/svg/icon-ai.svg');
  background-origin: padding-box;
  background-position: top 1rem right 1rem;
  background-repeat: no-repeat;
  background-size: 4.2rem 4.2rem;
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
  transition: transform 0.5s;
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
  margin-bottom: 0.8rem;
}

.section-label > span {
  display: inline-block;
  background-color: #333;
  color: white;
  padding: 0.4rem 0.6rem;
  font-size: 1rem;
  box-sizing: border-box;
  font-weight: 700;
  text-transform: uppercase;
  line-height: 1.1;
  vertical-align: middle;
}

.section-rule .section-label > span {
  background-color: #791414;
}

.bot-flagged .section-rule .section-label > span {
  background-color: rgb(56, 108, 143);
}

.issue-text-sizer,
.appeal-text-sizer {
  flex-shrink: 1;
  flex-grow: 1;
  margin-bottom: 2rem;
  overflow: hidden;
}

.issue-text-sizer:last-child,
.appeal-text-sizer:last-child {
  margin-bottom: 0;
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
  font-size: 3.5em;
}

.appeal-header-text {
  font-weight: 300;
  font-size: 2.5em;
}

.issue-text,
.includes-text,
.appeal-text {
  font-weight: 300;
  font-size: 2.5em;
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

.rule-info {
  position: absolute;
  left: 2.6rem;
  right: 2.6rem;
  top: calc(-65px - 5rem);
  box-sizing: border-box;
  height: calc(65px + 8.5rem);
  padding: 1.8rem 2.5rem;
  z-index: 10000;
  background: var(--card-bg-color);
  filter: drop-shadow(0 0 0.3rem rgba(0, 0, 0, 0.5));
  border-radius: 2rem;
  color: var(--examine-popup-text-color);

  display: flex;
  flex-direction: column;
  justify-content: center;

  font-size: 1.7rem;
}

.rule-tip {
  cursor: pointer;
  padding-right: 0.85em;
  background-image: url('@/assets/svg/icon-information.svg');
  background-position: center right;
  background-repeat: no-repeat;
  background-size: auto 50%;
}

/* Vue Transitions */

.rule-tooltip-enter-from,
.rule-tooltip-leave-to {
  opacity: 0;
  transform: translateY(2rem);
}

.rule-tooltip-enter-active,
.rule-tooltip-leave-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}
</style>
