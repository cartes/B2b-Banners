<script setup>
defineProps({
  sections: { type: Array, required: true }, // [{ id, label, count }]
  active: { type: String, required: true },
})

defineEmits(['update:active'])
</script>

<template>
  <nav class="section-tabs" aria-label="Zonas del portal">
    <button
      type="button"
      class="tab"
      :class="{ 'is-active': active === 'todas' }"
      @click="$emit('update:active', 'todas')"
    >
      Todas
    </button>
    <button
      v-for="section in sections"
      :key="section.id"
      type="button"
      class="tab"
      :class="{ 'is-active': active === section.id }"
      @click="$emit('update:active', section.id)"
    >
      {{ section.label }}
      <span class="tab-count">{{ section.count }}</span>
    </button>
  </nav>
</template>

<style scoped>
.section-tabs {
  display: flex;
  gap: var(--space-1);
  overflow-x: auto;
  padding-bottom: 2px;
}

.tab {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--space-2) var(--space-3);
  background: transparent;
  border: 1px solid var(--line);
  color: var(--ink-soft);
  font-size: 13px;
  white-space: nowrap;
}

.tab.is-active {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--paper);
}

.tab-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-faint);
}

.tab.is-active .tab-count {
  color: var(--paper);
  opacity: 0.7;
}
</style>
