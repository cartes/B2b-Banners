<script setup>
import { computed } from 'vue'
import { useAdTooltip } from '@/composables/useAdTooltip'

// Un aviso dibujado en su posición y a su medida real dentro de la
// maqueta: lleno con el color del portal si está vendido, rayado si está
// disponible.
const props = defineProps({
  slot: { type: Object, required: true },
  dimmed: { type: Boolean, default: false },
  note: { type: String, default: '' },
})

const isSold = computed(() => props.slot.status === 'vendido')
const isShared = computed(() => props.slot.status === 'compartido')
const dims = computed(() => props.slot.dims ?? { w: 300, h: 250 })

const shape = computed(() => {
  const ratio = dims.value.w / dims.value.h
  if (dims.value.h <= 60) return 'strip'
  if (ratio >= 3) return 'wide'
  if (ratio <= 0.5) return 'tall'
  return 'box'
})

const label = computed(() => props.slot.label ?? props.slot.formato)

const summary = computed(() => {
  if (isShared.value) {
    const nombres = props.slot.clientes?.map((c) => `${c.empresa} (${c.porcentaje}%)`).join(' y ')
    return `${label.value}, ${dims.value.w}×${dims.value.h}px, compartido al 50%: ${nombres}`
  }
  const estado = isSold.value ? `vendido a ${props.slot.empresa}` : 'disponible'
  return `${label.value}, ${dims.value.w}×${dims.value.h}px, ${estado}`
})

const { active, show, hide } = useAdTooltip()
const isActive = computed(() => active.value?.slot === props.slot)
</script>

<template>
  <div
    class="ad"
    :class="[`ad--${shape}`, isShared ? 'is-shared' : isSold ? 'is-sold' : 'is-free', { 'is-dimmed': dimmed }]"
    :style="{ width: `${dims.w}px`, aspectRatio: `${dims.w} / ${dims.h}` }"
    :aria-label="summary"
    :aria-describedby="isActive ? 'ad-tooltip' : undefined"
    role="img"
    tabindex="0"
    @mouseenter="show(slot, $event.currentTarget, note)"
    @mouseleave="hide(slot)"
    @focus="show(slot, $event.currentTarget, note)"
    @blur="hide(slot)"
  >
    <span class="ad-label">
      {{ label }}
      <template v-if="slot.isBonus"> · Bonificación</template>
      <span v-if="isShared" class="ad-shared-badge">50% / 50%</span>
    </span>

    <!-- Si es compartido (2 clientes): división 50/50 -->
    <div v-if="isShared" class="ad-shared-split" :class="`ad-shared-split--${shape}`">
      <div v-for="(cli, idx) in slot.clientes" :key="idx" class="ad-shared-client">
        <div class="ad-shared-top">
          <span class="ad-company">{{ cli.empresa }}</span>
          <span v-if="shape !== 'strip'" class="ad-pct-pill">{{ cli.porcentaje ?? 50 }}%</span>
        </div>
        <span v-if="shape !== 'strip' && cli.ejecutivo" class="ad-exec">{{ cli.ejecutivo }}</span>
      </div>
    </div>

    <!-- Si no es compartido (vendido 100% o disponible) -->
    <span v-else class="ad-main">
      <span class="ad-company">{{ isSold ? slot.empresa : 'Disponible' }}</span>
      <span v-if="isSold && shape !== 'strip'" class="ad-exec">{{ slot.ejecutivo }}</span>
    </span>

    <span class="ad-dims">{{ dims.w }}×{{ dims.h }}<template v-if="note"> · {{ note }}</template></span>
  </div>
</template>

<style scoped>
.ad {
  position: relative;
  flex-shrink: 0;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 4px;
  padding: 8px 10px;
  overflow: hidden;
  font-family: 'Montserrat', system-ui, sans-serif;
  text-align: left;
  transition: opacity 120ms ease;
}

.ad.is-sold {
  background: var(--portal-accent);
  color: #fff;
}

/* Aviso compartido: color verde distintivo solicitado */
.ad.is-shared {
  background: var(--color-shared, #15803d);
  color: #fff;
}

.ad.is-free {
  color: var(--portal-accent-ink);
  background: repeating-linear-gradient(
    -45deg,
    var(--portal-accent-soft) 0 10px,
    color-mix(in srgb, var(--portal-accent-soft) 55%, #fff) 10px 20px
  );
  outline: 2px dashed var(--portal-accent);
  outline-offset: -2px;
}

.ad:hover,
.ad:focus-visible {
  outline: 3px solid var(--portal-accent-ink);
  outline-offset: 2px;
  cursor: default;
}

.ad.is-shared:hover,
.ad.is-shared:focus-visible {
  outline: 3px solid var(--color-shared-ink, #14532d);
  outline-offset: 2px;
}

.ad.is-dimmed {
  opacity: 0.22;
}

.ad-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.85;
  line-height: 1.2;
}

.ad-shared-badge {
  display: inline-block;
  margin-left: 4px;
  padding: 1px 4px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 2px;
  font-size: 8px;
  letter-spacing: 0.05em;
  font-family: var(--font-mono);
}

.ad-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.ad-company {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.is-free .ad-company {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 13px;
}

.ad-exec {
  font-size: 11px;
  opacity: 0.85;
}

.ad-dims {
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  opacity: 0.75;
}

/* Distribución compartida (50% / 50%) */
.ad-shared-split {
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
}

.ad-shared-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 4px;
}

.ad-pct-pill {
  font-size: 9px;
  font-weight: 700;
  font-family: var(--font-mono);
  background: rgba(255, 255, 255, 0.25);
  padding: 1px 4px;
  border-radius: 2px;
  white-space: nowrap;
}

/* Skyscraper vertical (120x600): división vertical 50% / 50% */
.ad-shared-split--tall {
  flex-direction: column;
  justify-content: space-between;
}

.ad-shared-split--tall .ad-shared-client {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  padding: 10px 0;
  gap: 3px;
}

.ad-shared-split--tall .ad-shared-client:not(:first-child) {
  border-top: 1px dashed rgba(255, 255, 255, 0.4);
}

.ad-shared-split--tall .ad-company {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
}

/* Banners apaisados: todo en una fila. */
.ad--wide {
  flex-direction: row;
  align-items: center;
  padding: 10px 18px;
  gap: 16px;
}

.ad--wide .ad-label {
  flex: 0 0 150px;
}

.ad--wide .ad-main {
  flex: 1;
}

.ad--wide .ad-company {
  font-size: 20px;
}

.ad--wide.is-free .ad-company {
  font-size: 15px;
}

.ad-shared-split--wide {
  flex-direction: row;
  align-items: center;
  gap: 16px;
}

.ad-shared-split--wide .ad-shared-client {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ad-shared-split--wide .ad-shared-client:not(:first-child) {
  border-left: 1px dashed rgba(255, 255, 255, 0.4);
  padding-left: 16px;
}

/* Formatos tipo caja (Medium Rectangle) */
.ad-shared-split--box {
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.ad-shared-split--box .ad-shared-client {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ad-shared-split--box .ad-shared-client:not(:first-child) {
  border-top: 1px dashed rgba(255, 255, 255, 0.4);
  padding-top: 8px;
}

/* Leaderboard móvil 350×50 y similares: una sola línea. */
.ad--strip {
  flex-direction: row;
  align-items: center;
  padding: 4px 10px;
  gap: 10px;
}

.ad--strip .ad-main {
  flex: 1;
}

.ad--strip .ad-company {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ad--strip .ad-label {
  font-size: 9px;
  max-width: 110px;
}

.ad-shared-split--strip {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.ad-shared-split--strip .ad-shared-client {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.ad-shared-split--strip .ad-company {
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ad-shared-split--strip .ad-shared-client:not(:first-child) {
  border-left: 1px dashed rgba(255, 255, 255, 0.4);
  padding-left: 8px;
}

.ad--tall {
  padding: 10px 8px;
}

.ad--tall .ad-company {
  font-size: 13px;
}
</style>
