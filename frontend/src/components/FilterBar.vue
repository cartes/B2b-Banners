<script setup>
defineProps({
  query: { type: String, required: true },
  statusFilter: { type: String, required: true },
})

defineEmits(['update:query', 'update:statusFilter'])

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'vendido', label: 'Vendidos' },
  { value: 'compartido', label: 'Compartidos (50%)' },
  { value: 'disponible', label: 'Disponibles' },
]
</script>

<template>
  <div class="filter-bar">
    <input
      class="search"
      type="search"
      :value="query"
      placeholder="Buscar por empresa, ejecutivo o formato"
      @input="$emit('update:query', $event.target.value)"
    />

    <div class="segmented" role="group" aria-label="Filtrar por estado">
      <button
        v-for="opt in STATUS_OPTIONS"
        :key="opt.value"
        type="button"
        class="segment"
        :class="{ 'is-active': statusFilter === opt.value }"
        @click="$emit('update:statusFilter', opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
}

.search {
  flex: 1;
  min-width: 220px;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--line-strong);
  background: var(--paper-raised);
  font-size: 14px;
}

.search::placeholder {
  color: var(--ink-faint);
}

.segmented {
  display: flex;
  border: 1px solid var(--line-strong);
}

.segment {
  padding: var(--space-2) var(--space-3);
  background: var(--paper-raised);
  border: none;
  border-right: 1px solid var(--line-strong);
  font-size: 13px;
  color: var(--ink-soft);
}

.segment:last-child {
  border-right: none;
}

.segment.is-active {
  background: var(--ink);
  color: var(--paper);
}
</style>
