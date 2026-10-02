<script setup>
import { computed } from 'vue'
import { useAdTooltip } from '@/composables/useAdTooltip'

const props = defineProps({
  slot: { type: Object, required: true },
  compact: { type: Boolean, default: false },
  dimmed: { type: Boolean, default: false },
})

const isSold = computed(() => props.slot.status === 'vendido')
const isShared = computed(() => props.slot.status === 'compartido')

// Miniatura proporcional al tamaño real del aviso (si se conoce), acotada
// a una caja de 44x32 — el mismo recurso visual que usa el media kit
// impreso para mostrar la forma de cada formato junto a su medida.
const swatchStyle = computed(() => {
  const dims = props.slot.dims
  if (!dims) return { width: '20px', height: '20px' }
  const boxW = 44
  const boxH = 32
  const scale = Math.min(boxW / dims.w, boxH / dims.h)
  const w = Math.max(4, Math.round(dims.w * scale))
  const h = Math.max(4, Math.round(dims.h * scale))
  return { width: `${w}px`, height: `${h}px` }
})

const { active, show, hide } = useAdTooltip()
const isActive = computed(() => active.value?.slot === props.slot)

function formatUbicacion(u) {
  if (/^\d+$/.test(String(u))) return `Posición ${u}`
  return u
}
</script>

<template>
  <article
    class="slot"
    :class="{ 'is-sold': isSold, 'is-shared': isShared, 'is-bonus': slot.isBonus, 'is-compact': compact, 'is-dimmed': dimmed }"
    :aria-describedby="isActive ? 'ad-tooltip' : undefined"
    tabindex="0"
    @mouseenter="show(slot, $event.currentTarget)"
    @mouseleave="hide(slot)"
    @focus="show(slot, $event.currentTarget)"
    @blur="hide(slot)"
  >
    <header class="slot-head">
      <span class="slot-formato">{{ slot.formato }}</span>
      <span v-if="slot.isBonus" class="slot-bonus-tag">Bonificación</span>
      <span v-else-if="isShared" class="slot-shared-tag">Compartido 50%</span>
    </header>

    <div class="slot-body">
      <div class="swatch" :style="swatchStyle" aria-hidden="true" />

      <div class="slot-info">
        <template v-if="isShared">
          <div v-for="(cli, idx) in slot.clientes" :key="idx" class="slot-shared-client">
            <p class="slot-empresa">
              {{ cli.empresa }}
              <span class="slot-pct-tag">{{ cli.porcentaje ?? 50 }}%</span>
            </p>
            <p v-if="cli.ejecutivo" class="slot-ejecutivo">{{ cli.ejecutivo }}</p>
          </div>
        </template>
        <template v-else-if="isSold">
          <p class="slot-empresa">{{ slot.empresa }}</p>
          <p class="slot-ejecutivo">{{ slot.ejecutivo }}</p>
        </template>
        <template v-else>
          <p class="slot-disponible">Disponible</p>
        </template>
      </div>
    </div>

    <footer class="slot-foot">
      <span>{{ formatUbicacion(slot.ubicacion) }}</span>
      <span v-if="slot.dims" class="slot-dims">{{ slot.dims.w }}&times;{{ slot.dims.h }}px</span>
    </footer>
  </article>
</template>

<style scoped>
.slot {
  display: flex;
  flex-direction: column;
  background: var(--paper-raised);
  border: 1px solid var(--line);
  min-height: 132px;
}

.slot.is-sold,
.slot.is-shared {
  border-color: transparent;
}

.slot:not(.is-sold):not(.is-shared) {
  border-style: dashed;
}

.slot.is-dimmed {
  opacity: 0.35;
}

.slot.is-compact {
  min-height: 0;
}

.slot.is-compact .slot-formato {
  font-size: 12px;
}

.slot.is-compact .slot-body {
  padding: var(--space-2);
  gap: var(--space-2);
}

.slot.is-compact .slot-empresa {
  font-size: 12px;
}

.slot.is-compact .slot-foot {
  padding: var(--space-1) var(--space-2);
}

.slot-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  color: #fff;
  background: var(--portal-accent);
}

.slot.is-shared .slot-head {
  background: var(--color-shared, #15803d);
}

.slot:not(.is-sold):not(.is-shared) .slot-head {
  background: var(--portal-accent-soft);
  color: var(--portal-accent-ink);
}

.slot-formato {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.01em;
  line-height: 1.2;
}

.slot-bonus-tag,
.slot-shared-tag {
  flex-shrink: 0;
  font-size: 10px;
  font-family: var(--font-mono);
  opacity: 0.95;
  background: rgba(255, 255, 255, 0.25);
  padding: 1px 4px;
  border-radius: 2px;
}

.slot-body {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
}

.swatch {
  flex-shrink: 0;
  background: var(--portal-accent-soft);
  border: 1px solid var(--portal-accent);
}

.is-sold .swatch {
  background: var(--portal-accent);
  border-color: var(--portal-accent);
}

.is-shared .swatch {
  background: var(--color-shared, #15803d);
  border-color: var(--color-shared, #15803d);
}

.slot-info {
  min-width: 0;
}

.slot-empresa {
  font-weight: 600;
  font-size: 14px;
  line-height: 1.3;
  overflow-wrap: break-word;
}

.slot-ejecutivo {
  margin-top: 2px;
  font-size: 12px;
  color: var(--ink-soft);
}

.slot-shared-client:not(:first-child) {
  margin-top: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px dashed var(--line);
}

.slot-pct-tag {
  display: inline-block;
  font-size: 10px;
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--color-shared, #15803d);
  background: var(--color-shared-soft, #dcfce7);
  padding: 0 4px;
  border-radius: 2px;
  margin-left: 4px;
}

.slot-disponible {
  font-size: 13px;
  color: var(--ink-faint);
}

.slot-foot {
  display: flex;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-top: 1px solid var(--line);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-faint);
}
</style>
