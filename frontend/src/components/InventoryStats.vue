<script setup>
import { computed } from 'vue'

const props = defineProps({
  summary: { type: Object, required: true },
})

const pctVendido = computed(() => {
  if (!props.summary.total) return 0
  return Math.round((props.summary.vendidos / props.summary.total) * 100)
})
</script>

<template>
  <div class="stats">
    <dl class="stats-numbers">
      <div class="stat">
        <dt>Avisos</dt>
        <dd>{{ summary.total }}</dd>
      </div>
      <div class="stat stat-sold">
        <dt>Vendidos</dt>
        <dd>{{ summary.vendidos }}</dd>
      </div>
      <div v-if="summary.compartidos" class="stat stat-shared">
        <dt>Compartidos</dt>
        <dd>{{ summary.compartidos }}</dd>
      </div>
      <div class="stat">
        <dt>Disponibles</dt>
        <dd>{{ summary.disponibles }}</dd>
      </div>
    </dl>

    <div
      class="meter"
      role="img"
      :aria-label="`${pctVendido}% de los avisos vendidos: ${summary.vendidos} de ${summary.total}`"
    >
      <div class="meter-fill" :style="{ width: pctVendido + '%' }" />
    </div>
  </div>
</template>

<style scoped>
.stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 220px;
}

.stats-numbers {
  display: flex;
  gap: var(--space-5);
  margin: 0;
}

.stat dt {
  font-size: 11px;
  text-transform: none;
  color: var(--ink-faint);
}

.stat dd {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 28px;
  line-height: 1.1;
}

.stat-sold dd {
  color: var(--portal-accent);
}

.stat-shared dd {
  color: var(--color-shared, #15803d);
}

.meter {
  height: 6px;
  background: var(--line);
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  background: var(--portal-accent);
}
</style>
