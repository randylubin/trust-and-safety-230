<script setup>
import {
  ref,
  toRefs,
  reactive,
  readonly,
  computed,
  watch,
  watchEffect,
  onMounted
} from 'vue'
import { useArrayFilter, useElementSize } from '@vueuse/core'
import interact from 'interactjs'
import { IssueQueueStore } from './../../stores/IssueQueueStore.js'
import { GameSessionStore } from '../../stores/GameSessionStore'
import IssueCard from './IssueCard.vue'
import { GameDefaults } from '../../GameDefaults'

const props = defineProps({
  isActive: Boolean,
})
const { isActive } = toRefs(props)

const CardQueue = useArrayFilter(
  IssueQueueStore.currentIssueQueue,
  (issue) => !issue.interstitialOnly
)

const StackAreaElement = ref(null)
const StackAreaSize = useElementSize(StackAreaElement)
const StackTopElement = ref(null)
const ControlAreaElement = ref(null)
const ControlAreaSize = useElementSize(
  ControlAreaElement,
  { width: 0, height: 0 },
  { box: 'content-box' }
)
const buttonFrameSize = ref(ControlAreaSize.height)
const StackTopSize = useElementSize(StackTopElement)
const swipeIndicatorSize = computed(() => StackTopSize.width.value * 0.2 + 'px')

// Pairs for positioning cards in stack depending on stack size: [ Max Number Of Cards, Pixel Offset For Each Card ]
const stackOffsetsBig = [
  [5, 12],
  [9, 7],
  [15, 4],
  [Infinity, 3],
]
const stackOffsetsSmall = [
  [3, 12],
  [4, 8],
  [7, 4],
  [Infinity, 3],
]
const stackAreaHeight = computed(() =>
  StackAreaSize.height.value <= 510 ? '24px' : '65px'
)
const Options = reactive({
  stackOffsets: computed(() =>
    StackAreaSize.height.value <= 510 ? stackOffsetsSmall : stackOffsetsBig
  ),
  stackTopZ: 300, // z-index of top card in stack
  stackOffsetZ: 3, // z-index to subtract from each subsequent card
  stackVisibleLimit: computed(() =>
    StackAreaSize.height.value <= 510 ? 8 : 20
  ), // max number of cards visible in stack
  swipeRotateFactor: 0.05, // how much cards tilt as dragged left or right (degrees per pixel)
  swipeExitRange: 0.5, // how far towards container edge card must be dragged to approve/block
  swipeLabelRange: 0.3, // how far towards container edge card must be to display action label
  swipeExitDistance: '200%', // translate value for destination of card flying off screen
  swipeExitRotate: '45deg', // rotate value for destination of card flying off screen
  examineDelay: GameDefaults.lookCloserExamineDelay, // time on card before look closer is available, in 200ms ticks
  examineTime: GameDefaults.lookCloserExamineTime, // time it takes to Look Closer, in 200ms ticks
})

const stackLoadingKey = ref('unloaded-stack')

onMounted(() => setTimeout(() => (stackLoadingKey.value = 'loaded-stack'), 100))

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

const isReviewing = ref(false)

const flipCard = function () {
  isReviewing.value = !isReviewing.value
}

const swipeCard = function (dir) {
  // process card as swiped left or right
  interact('.top-card').unset()
  examineDone.value = false
  if (dir === 'left') {
    isLeaving.value = 'left'
    document
      .getElementById('frame-takedown')
      .animate(
        [
          { filter: 'drop-shadow(0 0 0 rgba(255, 112, 112, 0.7))' },
          { filter: 'drop-shadow(0 0 4rem rgba(255, 112, 112, 0))' },
          { filter: 'drop-shadow(0 0 0 rgba(255, 112, 112, 0))' },
        ],
        { duration: 600, iterations: 1 }
      )
    IssueQueueStore.takeAction('takeDown', ActiveCard.value)
  } else if (dir === 'right') {
    isLeaving.value = 'right'
    document
      .getElementById('frame-leaveup')
      .animate(
        [
          { filter: 'drop-shadow(0 0 0 rgba(187, 236, 106, 0.7))' },
          { filter: 'drop-shadow(0 0 4rem rgba(187, 236, 106, 0))' },
          { filter: 'drop-shadow(0 0 0 rgba(187, 236, 106, 0))' },
        ],
        { duration: 600, iterations: 1 }
      )
    IssueQueueStore.takeAction('keepUp', ActiveCard.value)
  }
}

const examineTime = ref(0)
let examineClock
const examineDone = ref(false)

const cardTime = ref(
  /* Make look closer always available when reviewing appeals */
  ActiveCard.value?.issueType?.startsWith('appeal') ? Options.examineDelay : 0
)

const examineDisabled = computed(
  () =>
    !ActiveCard.value ||
    isDragging.value ||
    isLeaving.value ||
    CardQueue.length === 0 ||
    !isActive.value ||
    cardTime.value < Options.examineDelay ||
    (ActiveCard.value?.issueType.startsWith('appeal') &&
      !isReviewing.value &&
      !examineDone.value)
)

setInterval(() => {
  if (isActive.value) cardTime.value++
}, 200)

const startExamine = function () {
  if (!examineDisabled.value) {
    if (!isReviewing.value) isReviewing.value = true
    examineClock = window.setInterval(() => {
      if (++examineTime.value > Options.examineTime) examineDone.value = true
    }, 200)
  }
}

const stopExamine = function () {
  window.clearInterval(examineClock)
  examineTime.value = 0
}

const timelockGradientAngle = computed(() => {
  return `${360 * (cardTime.value / Options.examineDelay)}deg`
})

watch(ActiveCard, () => {
  isReviewing.value = false
  cardTime.value = ActiveCard.value?.issueType?.startsWith('appeal')
    ? Options.examineDelay
    : 0
})

watchEffect(() => {
  // manage draggable functionality
  if (!isActive.value && ActiveCard.value) {
    interact('.top-card').unset()
  } else if (
    !interact.isSet('top-card') &&
    !isLeaving.value &&
    isActive.value &&
    ActiveCard.value
  ) {
    interact('.top-card').draggable({
      listeners: {
        move(e) {
          if (
            !ActiveCard.value?.issueType.startsWith('appeal') ||
            isReviewing.value
          ) {
            DragOffset.x = (parseFloat(DragOffset.x) || 0) + e.dx
            DragOffset.y = (parseFloat(DragOffset.y) || 0) + e.dy
          }
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
  <div
    class="stack-area"
    :class="{ backdrop: GameSessionStore.currentRound > 0 }"
    ref="StackAreaElement"
  >
    <div class="stack-top" ref="StackTopElement" :key="stackLoadingKey">
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
            appeal: issue.issueType.startsWith('appeal'),
            flipped:
              issue.issueType.startsWith('appeal') &&
              (index != 0 || !isReviewing),
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
          <IssueCard
            :IssueData="issue"
            :isTutorial="GameSessionStore.currentRound == 0 ? true : false"
            @flipCard="flipCard"
          />
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
  <div class="control-area" ref="ControlAreaElement">
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
            Keep holding the button to take a closer look at the content
          </div>
          <div v-else-if="examineTime" class="examine-done">
            {{
              ActiveCard.learnMoreText
                ? ActiveCard.learnMoreText
                : 'Nothing else to see.'
            }}
          </div>
        </transition>
      </div>
    </transition>
    <div class="button-frame" id="frame-takedown">
      <button
        type="button"
        class="button-takedown"
        :class="{
          'show-disabled':
            (isDragging && DragOffset.x > 0) ||
            CardQueue.length === 0 ||
            !isActive ||
            (ActiveCard?.issueType.startsWith('appeal') && !isReviewing),
        }"
        :disabled="
          isDragging ||
          isLeaving ||
          CardQueue.length === 0 ||
          !isActive ||
          (ActiveCard?.issueType.startsWith('appeal') && !isReviewing)
        "
        @click="swipeCard('left')"
      ></button>
    </div>
    <div class="button-frame small" id="frame-examine">
      <button
        type="button"
        class="button-examine"
        :class="{
          'show-disabled':
            !ActiveCard ||
            isDragging ||
            CardQueue.length === 0 ||
            !isActive ||
            cardTime < Options.examineDelay ||
            (ActiveCard?.issueType.startsWith('appeal') &&
              !isReviewing &&
              !examineDone),
          'show-timelocked': cardTime < Options.examineDelay,
        }"
        :disabled="examineDisabled"
        @pointerdown="startExamine"
        @pointerup="stopExamine"
        @pointerout="stopExamine"
      ></button>
    </div>
    <div class="button-frame" id="frame-leaveup">
      <button
        type="button"
        class="button-leaveup"
        :class="{
          'show-disabled':
            (isDragging && DragOffset.x < 0) ||
            CardQueue.length === 0 ||
            !isActive ||
            (ActiveCard?.issueType.startsWith('appeal') && !isReviewing),
        }"
        :disabled="
          isDragging ||
          isLeaving ||
          CardQueue.length === 0 ||
          !isActive ||
          (ActiveCard?.issueType.startsWith('appeal') && !isReviewing)
        "
        @click="swipeCard('right')"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.control-area {
  --btn-frame-diameter: v-bind('buttonFrameSize + "px"');
  --btn-frame-small-diameter: v-bind('buttonFrameSize * 0.7 + "px"');
  --btn-frame-small-top: v-bind('buttonFrameSize * 0.15 + "px"');

  display: flex;
  flex-direction: row;
  justify-content: center;

  position: relative;
  z-index: 900;
  height: 12vh;
  min-height: 80px;
  max-height: 100px;
  padding-bottom: max(calc(env(safe-area-inset-bottom) + 0.5rem), 1.5rem);
}

.examine-popup {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--examine-popup-text-color);

  box-sizing: border-box;
  width: 25rem;
  max-height: 25rem;
  min-height: 12rem;
  padding: 1.5rem;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  position: absolute;
  bottom: 107%;

  background-color: var(--examine-popup-incomplete-bg-color);
  background-image: linear-gradient(
    to top,
    var(--examine-popup-complete-bg-color) 50%,
    transparent 50%
  );
  background-size: 100% 200%;
  background-position: center 100%;
  border-radius: 2rem;

  filter: drop-shadow(0 0 0.3rem rgba(0, 0, 0, 0.5));
  transform-origin: center bottom;

  transition: width 0.2s ease-out, max-height 0.2s ease-out,
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
  max-height: 4rem;
  min-height: 4rem;
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
  box-sizing: border-box;
  height: var(--btn-frame-diameter);
  width: var(--btn-frame-diameter);
  margin-left: -1%;
  padding: 0.3rem;
  background-color: var(--stack-bg-color);
  border: 1rem solid var(--controls-bg-color);
  border-radius: 100%;
  box-shadow: 0 0.2rem 0 var(--controls-shadow-color);
  position: relative;
  z-index: 100;
}

#frame-examine {
  z-index: 200;
}

.button-frame.small {
  position: relative;
  height: var(--btn-frame-small-diameter);
  width: var(--btn-frame-small-diameter);
  min-height: 62px;
  min-width: 62px;
  top: min(var(--btn-frame-small-top), 9px);
}

.button-frame > button {
  box-sizing: border-box;
  width: calc(var(--btn-frame-diameter) - 2.6rem);
  height: calc(var(--btn-frame-diameter) - 2.6rem);
  padding: 25%;
  position: relative;
  top: -0.4rem;
  border-radius: 100%;
  border: none;
  background-origin: content-box, border-box;
  background-size: 100% 100%, 100% 100%;
  background-repeat: no-repeat;
  background-blend-mode: luminosity, normal;
  transition: background-color 0.1s linear;
}

.button-frame > button:active:not(:disabled) {
  box-shadow: none;
  top: 0;
}

.button-frame > button.show-disabled {
  background-color: var(--button-disabled-bg-color);
  box-shadow: 0 0.4rem var(--button-disabled-shadow-color);
  cursor: default;
}

button.button-examine.show-timelocked {
  --gradient-angle: v-bind(timelockGradientAngle);
  background-image: conic-gradient(
      rgba(255, 255, 255, 0.25) var(--gradient-angle),
      transparent var(--gradient-angle)
    ),
    url('./../../assets/svg/icon-examine.svg');
  background-origin: border-box, content-box;
}

.button-frame.small > button {
  width: calc(var(--btn-frame-small-diameter) - 2.6rem);
  height: calc(var(--btn-frame-small-diameter) - 2.6rem);
  min-height: calc(62px - 2.6rem);
  min-width: calc(62px - 2.6rem);
  padding: 17%;
}
button:hover {
  cursor: pointer;
}

.button-takedown {
  background-color: var(--takedown-bg-color);
  box-shadow: 0 0.4rem var(--takedown-shadow-color);
  background-image: url('./../../assets/svg/icon-takedown.svg'),
    var(--fade-bg-gradient);
}

.button-leaveup {
  background-color: var(--leaveup-bg-color);
  box-shadow: 0 0.4rem var(--leaveup-shadow-color);
  background-image: url('./../../assets/svg/icon-leaveup.svg'),
    var(--fade-bg-gradient);
}

.button-examine {
  background-color: var(--examine-bg-color);
  box-shadow: 0 0.4rem var(--examine-shadow-color);
  background-image: url('./../../assets/svg/icon-examine.svg'),
    var(--fade-bg-gradient);
}

.stack-area {
  position: relative;
  flex-grow: 1;
}

.stack-area.backdrop {
  background-image: url('@/assets/svg/image-hanginthere.svg');
  background-size: auto 50%;
  background-position: center center;
  background-repeat: no-repeat;
}

.stack-top {
  --swipe-indicator-size: v-bind('swipeIndicatorSize');
  position: absolute;
  left: 8%;
  right: 8%;
  top: v-bind('stackAreaHeight');
  bottom: 2.5%;
}

.card-container {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  transition: transform 0.25s ease-out;
  touch-action: none;
  perspective: 200rem;
}

.card-container.dragging {
  transition: none;
  transform: v-bind('dragTransform');
}

.swipe-indicator {
  position: absolute;
  top: -2rem;
  box-sizing: border-box;
  width: var(--swipe-indicator-size);
  height: var(--swipe-indicator-size);
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

.swipe-indicator::after {
  display: block;
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0.5rem;
  width: 8rem;
  font-family: var(--font-2);
  text-transform: uppercase;
  font-size: 2rem;
  line-height: 1.1;
  font-weight: 900;
  filter: stroke(1px black);
}

.swipe-indicator.takedown::after {
  color: var(--takedown-bg-color);
  text-shadow: 0.2rem 0.2rem 0 var(--takedown-shadow-color);
  content: 'Take It Down';
  left: 101%;
  text-align: left;
}

.swipe-indicator.leaveup::after {
  color: var(--leaveup-bg-color);
  text-shadow: 0.2rem 0.2rem 0 var(--leaveup-shadow-color);
  content: 'Keep It Up';
  right: 101%;
  width: 6rem;
  text-align: right;
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
  transition: transform 0.35s ease-out, opacity 0.25s ease-out;
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
