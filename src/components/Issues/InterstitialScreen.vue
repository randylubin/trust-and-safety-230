<script setup>
// import { GameSessionStore } from "../../stores/GameSessionStore";
import { ref, computed, onMounted, onUpdated } from 'vue'
import { IssueQueueStore } from '../../stores/IssueQueueStore'

const textSize = ref(2.2)
const cssTextSize = computed(() => textSize.value + 'rem')
const textElement = ref(null)
const textInnerElement = ref(null)
const textSpace = computed(() => {
  return textElement.value?.clientHeight
})

const shrinkText = function () {
  /* Be careful around this code. Mistakes could cause infinite loop. */
  if (
    textInnerElement.value?.getBoundingClientRect().height > textSpace.value &&
    textSize.value > 1.4 // <-- necessary to prevent infinite loop
  ) {
    textSize.value -= 0.2
  }
}

onMounted(shrinkText)
onUpdated(shrinkText)
</script>

<template>
  <div class="interstitial-screen">
    <div class="interstitial-header-image manager">
      <img src="@/assets/svg/image-manager.svg" />
    </div>
    <div
      class="interstitial-header"
      v-if="
        IssueQueueStore.interstitialType === 'interstitialOnly' &&
        IssueQueueStore.currentIssueQueue[0]?.issueID.startsWith('TEAM')
      "
    >
      Team Building
    </div>
    <div class="interstitial-text" ref="textElement">
      <div
        class="interstitial-text-sizer"
        ref="textInnerElement"
        :style="{ 'font-size': cssTextSize }"
        v-html="IssueQueueStore.interstitialShown"
      ></div>
    </div>
    <button
      class="btn-basic shine"
      @click="IssueQueueStore.closeInterstitial()"
    >
      Continue
    </button>
  </div>
</template>

<style scoped>
.interstitial-screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;

  box-sizing: border-box;
  padding: 3rem 3rem 5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;

  background: var(--modal-bg-color);
}

.interstitial-header-image {
  width: 80%;
  height: 27vh;
  min-height: 180px;
  max-height: 230px;
  overflow: hidden;
  margin: 0 auto 1.5rem;
  position: relative;
  border-bottom: 0.2rem solid var(--card-outershadow-color);
}

.interstitial-header-image > img {
  display: block;
  margin: 0 auto;
  height: 100%;
  position: relative;
  z-index: 50;
}

.interstitial-header {
  position: relative;
  z-index: 200;
  font-family: var(--font-2);
  font-size: 2rem;
  line-height: 2rem;
  height: 2rem;
  width: 100%;
  font-weight: 700;
  text-transform: uppercase;
  background-color: var(--en-2d);
  background-image: var(--fade-bg-gradient);
  box-shadow: 0 -0.5rem 3rem rgba(0, 0, 0, 0.5);
  padding: 1rem 0;
  margin: 0 auto 2rem;
}

.interstitial-header-image + .interstitial-header {
  position: relative;
  top: -2rem;
  margin-bottom: 0;
}

.interstitial-text {
  flex-shrink: 1;
  font-weight: 300;
  font-size: 2.2rem;
  margin-bottom: 5rem;
  overflow: hidden;
}
</style>
