<script setup>
import {
  ref,
  toRefs,
  reactive,
  readonly,
  computed,
  watch,
  watchEffect,
} from 'vue'
import { useArrayFilter } from '@vueuse/core'
import interact from 'interactjs'
import { IssueQueueStore } from './../../stores/IssueQueueStore.js'
import IssueCard from './IssueCard.vue'
import InterstitialScreen from './InterstitialScreen.vue'

const props = defineProps({
  isActive: Boolean,
})
const { isActive } = toRefs(props)

const CardQueue = useArrayFilter(
  IssueQueueStore.currentIssueQueue,
  (issue) => !issue.interstitialOnly
)

const StackAreaElement = ref(null)

const Options = readonly({
  stackOffsets: [
    // Pairs for positioning cards in stack depending on stack size: [ Max Number Of Cards, Pixel Offset For Each Card ]
    [5, 12],
    [9, 7],
    [15, 4],
    [Infinity, 3],
  ],
  stackTopZ: 300, // z-index of top card in stack
  stackOffsetZ: 3, // z-index to subtract from each subsequent card
  stackVisibleLimit: 20, // max number of cards visible in stack
  swipeRotateFactor: 0.05, // how much cards tilt as dragged left or right (degrees per pixel)
  swipeExitRange: 0.5, // how far towards container edge card must be dragged to approve/block
  swipeLabelRange: 0.4, // how far towards container edge card must be to display action label
  swipeExitDistance: '200%', // translate value for destination of card flying off screen
  swipeExitRotate: '45deg', // rotate value for destination of card flying off screen
  examineDelay: 25, // time on card before look closer is available, in 200ms ticks
  examineTime: 15, // time it takes to Look Closer, in 200ms ticks
})

const stackOffsetIncrement = computed(() => {
  // get current stack offset increment based on stack size
  for (const tier of Options.stackOffsets) {
    if (CardQueue.value.length <= tier[0]) {
      return tier[1]
    }
  }
  return Options.stackOffsets.slice(-1)[1]
})

const ActiveCard = computed(() => {
  // Required for watcher to trigger when stack changes
  return CardQueue.value[0]
})

const isDragging = ref(false)
const isLeaving = ref(false)
const DragOffset = reactive({
  x: 0,
  y: 0,
})

const dragTransform = computed(() => {
  // css transform property string for card being dragged
  return `translate(${DragOffset.x}px, ${DragOffset.y}px) rotate(${
    DragOffset.x * Options.swipeRotateFactor
  }deg)`
})

const leaveTransform = computed(() => {
  // css transform property string for card leaving screen
  if (isLeaving.value === 'left') {
    return `translateX(-${Options.swipeExitDistance}) rotate(-${Options.swipeExitRotate})`
  } else if (isLeaving.value === 'right') {
    return `translateX(${Options.swipeExitDistance}) rotate(${Options.swipeExitRotate})`
  } else {
    return ''
  }
})

const swipeIndicatorThreshold = computed(() => {
  return StackAreaElement.value
    ? parseInt(window.getComputedStyle(StackAreaElement.value).width) *
        0.5 *
        Options.swipeLabelRange
    : Infinity
})

const getStackOffsetTransform = function (index) {
  // build css transform property for offset card in stack based on position
  const xindex = Math.min(index, Options.stackVisibleLimit)
  return `translate(0,${-xindex * stackOffsetIncrement.value}px)`
}

const getStackOffsetZ = function (index) {
  // calculate z-index for offset card in stack based on position
  return Options.stackTopZ - index * Options.stackOffsetZ
}

const swipeCard = function (dir) {
  // process card as swiped left or right
  interact('.top-card').unset()
  examineDone.value = false
  if (dir === 'left') {
    isLeaving.value = 'left'
    IssueQueueStore.takeAction('takeDown', ActiveCard.value)
  } else if (dir === 'right') {
    isLeaving.value = 'right'
    IssueQueueStore.takeAction('keepUp', ActiveCard.value)
  }
}

const examineTime = ref(0)
let examineClock
const examineDone = ref(false)

const cardTime = ref(0)
setInterval(() => {
  if (isActive.value) cardTime.value++
}, 200)

const startExamine = function () {
  console.log('examining')
  examineClock = window.setInterval(() => {
    if (++examineTime.value > Options.examineTime) examineDone.value = true
  }, 200)
}

const stopExamine = function () {
  console.log('done examining')
  window.clearInterval(examineClock)
  examineTime.value = 0
}

watch(ActiveCard, () => {
  cardTime.value = 0
})

watchEffect(() => {
  // manage draggable functionality
  if (
    !interact.isSet('top-card') &&
    !isLeaving.value &&
    isActive.value &&
    ActiveCard.value
  ) {
    interact('.top-card').draggable({
      listeners: {
        move(e) {
          DragOffset.x = (parseFloat(DragOffset.x) || 0) + e.dx
          DragOffset.y = (parseFloat(DragOffset.y) || 0) + e.dy
        },
        start() {
          isDragging.value = true
        },
        end() {
          isDragging.value = false
          const threshold =
            parseInt(window.getComputedStyle(StackAreaElement.value).width) *
            0.5 *
            Options.swipeExitRange
          if (DragOffset.x < -threshold) {
            swipeCard('left')
          } else if (DragOffset.x > threshold) {
            swipeCard('right')
          }
          DragOffset.x = 0
          DragOffset.y = 0
        },
      },
    })
  }
})
</script>

<template>
  <div class="stack-area" ref="StackAreaElement">
    <InterstitialScreen
      v-if="IssueQueueStore.interstitialShown && !isLeaving"
    />
    <div class="stack-top">
      <transition-group name="cards" @after-leave="isLeaving = false">
        <div
          v-for="(issue, index) in CardQueue"
          class="card-container"
          :key="'container-' + issue.uniqueKey"
          :id="'container-' + issue.uniqueKey"
          :class="{
            'bottom-card': index === CardQueue.length - 1,
            'top-card': index === 0,
            'middle-card': !(index === CardQueue.length - 1 || index === 0),
            dragging: index === 0 && isDragging,
          }"
          :style="
            index === 0 || index === CardQueue.length - 1
              ? {}
              : {
                  transform: getStackOffsetTransform(index),
                  'z-index': getStackOffsetZ(index),
                }
          "
        >
          <IssueCard :IssueData="issue" />
          <div
            v-if="index === 0 && !isLeaving"
            class="swipe-indicator takedown"
            :class="{
              active:
                DragOffset.x < -swipeIndicatorThreshold || isLeaving === 'left',
            }"
          ></div>
          <div
            v-if="index === 0 && !isLeaving"
            class="swipe-indicator leaveup"
            :class="{
              active:
                DragOffset.x > swipeIndicatorThreshold || isLeaving === 'right',
            }"
          ></div>
        </div>
      </transition-group>
    </div>
  </div>
  <div class="control-area">
    <transition name="examine-frame">
      <div
        v-if="(examineTime || examineDone) && !isLeaving"
        class="examine-popup"
        :class="{
          done: examineDone,
          active: examineTime,
          minimized: examineDone && !examineTime,
        }"
      >
        <transition name="examine-contents" mode="out-in">
          <div v-if="examineTime && !examineDone" class="examine-working">
            Let's give this a closer look...
          </div>
          <div v-else-if="examineTime" class="examine-done">
            {{ ActiveCard.learnMoreText }}
          </div>
        </transition>
      </div>
    </transition>
    <div class="button-frame">
      <button
        type="button"
        class="button-takedown"
        :class="{
          'show-disabled':
            (isDragging && DragOffset.x > 0) || CardQueue.length === 0,
        }"
        :disabled="isDragging || isLeaving || CardQueue.length === 0"
        @click="swipeCard('left')"
      ></button>
    </div>
    <div class="button-frame small">
      <transition name="button-pop">
        <button
          v-if="cardTime >= Options.examineDelay && ActiveCard"
          type="button"
          class="button-examine"
          :class="{
            'show-disabled': isDragging || CardQueue.length === 0,
          }"
          :disabled="isDragging || isLeaving || CardQueue.length === 0"
          @pointerdown="startExamine"
          @pointerup="stopExamine"
          @pointerout="stopExamine"
        ></button>
      </transition>
    </div>
    <div class="button-frame">
      <button
        type="button"
        class="button-leaveup"
        :class="{
          'show-disabled':
            (isDragging && DragOffset.x < 0) || CardQueue.length === 0,
        }"
        :disabled="isDragging || isLeaving || CardQueue.length === 0"
        @click="swipeCard('right')"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.control-area {
  display: flex;
  flex-direction: row;
  justify-content: center;

  position: relative;
  z-index: 1000;
  height: 15%;
  min-height: 95px;
  background-image: linear-gradient(
    to bottom,
    transparent 40%,
    var(--controls-bg-color) 40%
  );
}

.examine-popup {
  font-size: 1.6rem;

  box-sizing: border-box;
  width: 25rem;
  height: 12rem;
  padding: 1.5rem;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  position: absolute;
  bottom: 110%;

  background-color: var(--examine-popup-incomplete-bg-color);
  background-image: linear-gradient(
    to top,
    var(--examine-popup-complete-bg-color) 50%,
    transparent 50%
  );
  background-size: 100% 200%;
  background-position: center 100%;
  border-radius: 3rem;

  filter: drop-shadow(0 0 0.3rem rgba(0, 0, 0, 0.5));
  transform-origin: center bottom;

  transition: width 0.2s ease-out, height 0.2s ease-out,
    border-radius 0.2s ease-out, transform 0.2s ease-out;
}

.examine-popup::after {
  content: '';
  position: absolute;
  bottom: 1px;
  left: 50%;
  width: 0;
  height: 0;
  border: solid transparent;
  border-top-color: var(--examine-popup-complete-bg-color);
  border-bottom: 0;
  border-width: 1.5rem;
  margin-left: -1.5rem;
  margin-bottom: -1.5rem;
  transition: all 0.2s;
}

.examine-popup::before {
  opacity: 0;
  content: url('./../../assets/svg/icon-more.svg');
  position: absolute;

  aspect-ratio: 1 / 0.26;
  transition: opacity 0.2s linear;
}

.examine-popup.minimized {
  width: 6rem;
  height: 4rem;
  border-radius: 1rem;
  transform: translateY(0.5rem);
  transition-delay: 0.2s;
}

.examine-popup.minimized::after {
  border-width: 1rem;
  margin-left: -1rem;
  margin-bottom: -1rem;
  transition-delay: 0.2s;
}

.examine-popup.minimized::before {
  opacity: 1;
  left: 0.75rem;
  top: 1.1rem;
  width: 4.5rem;
  transition-delay: 0.4s;
}
.examine-popup > .examine-working,
.examine-popup > .examine-done {
  width: 22rem;
  margin: 0 auto;
}

.button-frame {
  aspect-ratio: 1 / 1;
  box-sizing: border-box;
  height: 100%;
  width: auto;
  margin-left: -1%;
  padding: 3%;

  background-color: var(--controls-bg-color);
  border-radius: 100%;
}

.button-frame.small {
  position: relative;
  height: 70%;
  top: 15%;
}

.button-frame > button {
  aspect-ratio: 1 / 1;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 25%;
  border-radius: 100%;
  border: none;
  background-origin: content-box;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-blend-mode: luminosity;
  transition: background-color 0.1s linear;
}

.button-frame > button:active:not(:disabled) {
  box-shadow: inset 0 0.3rem rgba(0, 0, 0, 0.25);
  background-position: 0 0.3rem;
}

.button-frame > button.show-disabled {
  background-color: var(--button-disabled-bg-color);
  cursor: default;
}

.button-frame.small > button {
  padding: 17%;
}
button:hover {
  cursor: pointer;
}

.button-takedown {
  background-color: var(--takedown-bg-color);
  background-image: url('./../../assets/svg/icon-takedown.svg');
}

.button-leaveup {
  background-color: var(--leaveup-bg-color);
  background-image: url('./../../assets/svg/icon-leaveup.svg');
}

.button-examine {
  background-color: var(--examine-bg-color);
  background-image: url('./../../assets/svg/icon-examine.svg');
}

.stack-area {
  position: relative;
  flex-grow: 1;
}

.stack-top {
  position: absolute;
  left: 8%;
  right: 8%;
  top: 65px;
  bottom: 3%;
}

.card-container {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  transition: transform 0.25s ease-out;
  touch-action: none;
}

.card-container.dragging {
  transition: none;
  transform: v-bind('dragTransform');
}

.swipe-indicator {
  position: absolute;
  top: -2rem;

  aspect-ratio: 1 / 1;
  box-sizing: border-box;
  width: 20%;
  height: auto;
  padding: 1.5rem;
  border-radius: 100%;
  background-origin: content-box;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-blend-mode: luminosity;

  opacity: 0;
  transform: scale(0.1);

  transition: opacity 0.2s linear, transform 0.2s linear;
}

.swipe-indicator.active {
  opacity: 1;
  transform: scale(1);
}

.swipe-indicator.takedown {
  background-color: var(--takedown-bg-color);
  background-image: url('./../../assets/svg/icon-takedown.svg');
  right: -2rem;
}

.swipe-indicator.leaveup {
  background-color: var(--leaveup-bg-color);
  background-image: url('./../../assets/svg/icon-leaveup.svg');
  left: -2rem;
}

.top-card {
  z-index: v-bind('Options.stackTopZ');
}

.bottom-card {
  z-index: v-bind('getStackOffsetZ(CardQueue.length-1)');
  transform: v-bind('getStackOffsetTransform(CardQueue.length-1)');
}

/* Vue Transitions */

.card-container.cards-enter-active {
  transition: transform 0.35s ease-out, opacity 0.5s ease-out;
}

.card-container.cards-leave-active {
  transition: transform 0.25s linear;
  z-index: v-bind('Options.stackTopZ+10');
}

.cards-enter-from {
  transform: translateY(-30%);
  opacity: 0;
}
.card-container.cards-leave-to {
  transform: v-bind('leaveTransform');
}

.examine-frame-enter-from {
  transform: scale(20%);
  background-position: center 2%;
}

.examine-frame-leave-to {
  transform: scale(20%);
  opacity: 0;
}

.examine-popup.minimized.examine-frame-leave-to {
  transition-delay: 0;
}

.examine-frame-enter-active {
  transition: transform, background-position linear;
  transition-duration: v-bind('".2s, " + Options.examineTime * 200 + "ms"');
}

.examine-frame-leave-active {
  transition: transform 0.2s, opacity 0.2s ease-out;
}

.examine-contents-enter-from,
.examine-contents-leave-to {
  opacity: 0;
}

.examine-contents-enter-active,
.examine-contents-leave-active {
  transition: opacity 0.2s ease-out;
}

.done .examine-contents-enter-active {
  transition-delay: 0.2s;
}

.button-pop-enter-from,
.button-pop-leave-to {
  transform: scale(20%);
  opacity: 0;
}

button.button-pop-enter-active,
button.button-pop-leave-active {
  transition: transform 0.2s linear, opacity 0.2s linear;
}
</style>
