<script setup>
// Placeholder de una nota editorial (imagen, fecha y titular).
defineProps({
  image: { type: Boolean, default: true },
  lines: { type: Number, default: 2 },
  date: { type: Boolean, default: true },
})
</script>

<template>
  <div class="site-note">
    <div v-if="image" class="site-img" />
    <div v-if="date" class="site-date" />
    <div
      v-for="n in lines"
      :key="n"
      class="site-line is-title"
      :class="{ 'is-mid': n === lines && lines > 1 }"
    />
  </div>
</template>
