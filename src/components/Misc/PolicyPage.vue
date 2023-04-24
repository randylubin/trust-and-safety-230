<script setup>
import { GameSessionStore } from '../../stores/GameSessionStore'
import { ContentRules } from '../../issueData/ContentRules';
</script>

<template>
  <div class="policy-page">
    <div class="policy-intro">
      TrustHive has multiple policies covering various kinds of content that are
      not allowed on the platform. As a moderator, it is your job to enforce
      these policies.
    </div>
    <div class="overflow-wrapper">
      <div class="policy-frame">
        <div class="policy-label"><span>Content Policies</span></div>
        <div class="policy-scrollbox">
          <div
            class="policy-card"
            v-for="policy in ContentRules"
            :key="policy.ruleID"
          >
            <div class="policy-name">{{ policy.ruleName }}</div>
            <div class="policy-text">{{ policy.ruleDescription }}</div>
          </div>
        </div>
      </div>
    </div>
    <button class="btn-basic" @click="GameSessionStore.showPolicies = false">Close</button>
  </div>
</template>

<style scoped>
.policy-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1005;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 4rem 2.5rem;

  background: var(--modal-bg-color);
}

.policy-title {
  color: var(--card-innershadow-color);
  font-family: var(--font-2);
  font-size: 3rem;
  text-transform: uppercase;
  margin-bottom: 2rem;
}

.policy-intro {
  font-weight: 300;
  font-size: 1.8rem;
}

.policy-frame {
  display: flex;
  flex-direction: column;
  padding: 0 0 2rem 2rem;
  border: 0.3rem solid var(--card-outershadow-color);
  border-radius: 2rem;
  max-height: calc(100% - 4rem);
}

.overflow-wrapper {
  flex-grow: 1;
  padding-top: 3rem;
  margin-bottom: 3rem;
  overflow: hidden;
}
.policy-scrollbox {
  padding-right: 2rem;
  overflow-y: scroll;
}

.policy-label {
  color: var(--card-outershadow-color);
  font-family: var(--font-2);
  text-transform: uppercase;
  position: relative;
  top: -1rem;
  right: 1rem;
  font-size: 1.3rem;
}

.policy-label > span {
  padding: 0 1rem;
  background: var(--modal-bg-color);
}

.policy-card {
  text-align: left;
  padding-bottom: 1rem;
  border-bottom: 1px dotted;
  margin-bottom: 1rem;
}

.policy-name {
  font-weight: 700;
  color: var(--card-innershadow-color);
  margin-bottom: 0.3rem;
}

.policy-text {
  font-style: italic;
  color: rgba(255, 255, 255, 0.65);
}
</style>
