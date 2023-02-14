<script setup>
const emits = defineEmits(['unpauseGame'])
</script>

<template>
  <div class="pause-menu">The Pause Menu</div>
  <button @click="$emit('unpauseGame')">Resume</button>
</template>

<style scoped></style>
