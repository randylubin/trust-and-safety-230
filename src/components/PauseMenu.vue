<script setup>
import { GameSessionStore } from '../stores/GameSessionStore'

const emits = defineEmits(['unpauseGame'])
</script>

<template>
  <div class="pause-screen">
    <div class="big-label">Paused</div>
    <button class="btn-basic highlight shine" @click="$emit('unpauseGame')">
      Resume
    </button>
    <button class="btn-basic" @click="GameSessionStore.showPolicies = true">
      Content Policies
    </button>
    <button class="btn-basic" @click="GameSessionStore.showAchievements = true">
      Achievements
    </button>
    <div class="option-frame">
      <div class="option-label"><span>Accessibility</span></div>
      <div class="option-item">
        <label class="switch">
          <input
            type="checkbox"
            :checked="GameSessionStore.slowMode"
            @change="GameSessionStore.toggleSlowMode"
          />
          <span class="slider"></span>
        </label>
        <label class="switch-label">Reduced Speed Mode</label>
      </div>
    </div>
    <button
      class="btn-basic btn-about"
      @click="GameSessionStore.showAbout = true"
    >
      About The Game
    </button>
  </div>
</template>

<style scoped>
.pause-screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;

  box-sizing: border-box;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;

  background: var(--modal-bg-color);
}

.big-label {
  position: relative;
  font-family: var(--font-2);
  font-size: 6rem;
  line-height: 6rem;
  height: 6rem;
  margin-bottom: 3rem;
  text-transform: uppercase;
  font-weight: 900;
}

.pause-text {
  font-size: 2.8rem;
  font-weight: 400;
  margin-bottom: 2rem;
}

button {
  margin-bottom: 1.5rem;
}

.btn-about {
  margin-top: 1.5rem;
}

.option-frame {
  display: flex;
  flex-direction: column;
  margin-top: 0.5em;
  padding: 0 0 1.7rem 2rem;
  border: 0.3rem solid var(--card-outershadow-color);
  border-radius: 2rem;
  max-height: calc(100% - 4rem);
}

.option-label {
  color: var(--card-outershadow-color);
  font-family: var(--font-2);
  text-transform: uppercase;
  position: relative;
  top: -1rem;
  right: 1rem;
  font-size: 1.3rem;
}

.option-label > span {
  padding: 0 1rem;
  background: var(--modal-bg-color);
}

div.option-item {
  display: flex;
  justify-content: left;
  align-items: center;
}

div.option-item .switch {
  margin-right: 1.5rem;
}

label.switch-label {
  font-size: 1.8rem;
  line-height: 1;
  color: var(--card-innershadow-color);
}
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  display: none;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #777;
  border-radius: 34px;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: '';
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  border-radius: 50%;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: var(--en-2d);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--en-2d);
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

</style>
