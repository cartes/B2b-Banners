<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAdTooltip } from '@/composables/useAdTooltip'
import { sectionMeta } from '@/config/formats'

const { active, hide } = useAdTooltip()

const bubble = ref(null)
const pos = ref({ top: 0, left: 0, placement: 'top', arrow: 0 })

const slot = computed(() => active.value?.slot ?? null)
const isSold = computed(() => slot.value?.status === 'vendido')
const isShared = computed(() => slot.value?.status === 'compartido')

const ubicacion = computed(() => {
  const u = String(slot.value?.ubicacion ?? '')
  return /^\d+$/.test(u) ? `Posición ${u}` : u
})

const historial = computed(() => {
  const s = slot.value
  if (!s) return ''
  if (!s.edicionesVendidas) return 'Sin ventas registradas en el histórico'
  const n = s.edicionesVendidas
  return `Vendido en ${n} ${n === 1 ? 'edición' : 'ediciones'} del histórico`
})

// Miniatura con la forma del aviso, acotada a 56×40.
const swatch = computed(() => {
  const d = slot.value?.dims
  if (!d) return null
  const scale = Math.min(56 / d.w, 40 / d.h)
  return { width: `${Math.max(4, Math.round(d.w * scale))}px`, height: `${Math.max(4, Math.round(d.h * scale))}px` }
})

const GAP = 10
const MARGIN = 8

function place() {
  if (!active.value || !bubble.value) return
  const r = active.value.el.getBoundingClientRect()
  const b = bubble.value.getBoundingClientRect()
  const vw = document.documentElement.clientWidth
  const vh = window.innerHeight

  // Ubica el globo junto al aviso. Si no cabe ni arriba ni abajo, lo centra
  // verticalmente en la pantalla para mantenerlo completo y legible.
  let placement = 'top'
  let top = r.top - b.height - GAP
  const fitsAbove = top >= MARGIN
  const belowTop = r.bottom + GAP
  const fitsBelow = belowTop + b.height <= vh - MARGIN

  if (!fitsAbove && fitsBelow) {
    placement = 'bottom'
    top = belowTop
  } else if (!fitsAbove && !fitsBelow) {
    placement = r.top + r.height / 2 > vh / 2 ? 'top' : 'bottom'
    top = Math.max(MARGIN, (vh - b.height) / 2)
  }

  const center = r.left + r.width / 2
  const left = Math.min(Math.max(MARGIN, center - b.width / 2), vw - b.width - MARGIN)
  const arrow = Math.min(Math.max(14, center - left), b.width - 14)
  pos.value = { top, left, placement, arrow }
}

watch(active, async (value) => {
  if (!value) return
  await nextTick()
  place()
})

function onViewportChange() {
  if (active.value) hide()
}

onMounted(() => {
  window.addEventListener('scroll', onViewportChange, { capture: true, passive: true })
  window.addEventListener('resize', onViewportChange)
})

onBeforeUnmount(() => {
  hide()
  window.removeEventListener('scroll', onViewportChange, { capture: true })
  window.removeEventListener('resize', onViewportChange)
})
</script>

<template>
  <div
    v-if="slot"
    id="ad-tooltip"
    ref="bubble"
    class="tip"
    :class="[`tip--${pos.placement}`, isShared ? 'is-shared' : isSold ? 'is-sold' : 'is-free']"
    :style="{ top: `${pos.top}px`, left: `${pos.left}px`, '--arrow-x': `${pos.arrow}px` }"
    role="tooltip"
  >
    <header class="tip-head">
      <span v-if="swatch" class="tip-swatch" :style="swatch" aria-hidden="true" />
      <div class="tip-title">
        <strong>{{ slot.label ?? slot.formato }}</strong>
        <span>{{ sectionMeta(slot.section)?.label }}</span>
      </div>
      <span class="tip-status">{{ isShared ? 'Compartido (50%)' : isSold ? 'Vendido' : 'Disponible' }}</span>
    </header>

    <div class="tip-body">
      <!-- Aviso compartido: dos clientes al 50% -->
      <div v-if="isShared" class="tip-sale tip-shared">
        <div v-for="(cli, idx) in slot.clientes" :key="idx" class="tip-shared-client">
          <div class="tip-shared-header">
            <span class="tip-company">{{ cli.empresa }}</span>
            <span class="tip-pct-badge">{{ cli.porcentaje ?? 50 }}%</span>
          </div>
          <p v-if="cli.ejecutivo" class="tip-muted">Ejecutivo: {{ cli.ejecutivo }} · Edición {{ slot.edicion }}</p>
        </div>
      </div>
      <!-- Aviso vendido 100% a un cliente -->
      <div v-else-if="isSold" class="tip-sale">
        <p class="tip-company">{{ slot.empresa }}</p>
        <p class="tip-muted">Ejecutivo: {{ slot.ejecutivo }} · Edición {{ slot.edicion }}</p>
      </div>
      <!-- Aviso libre -->
      <p v-else class="tip-sale tip-free">Libre en la edición {{ slot.edicion }}</p>

      <dl class="tip-facts">
        <div>
          <dt>Formato ERP</dt>
          <dd>{{ slot.formato }}</dd>
        </div>
        <div>
          <dt>Ubicación</dt>
          <dd>{{ ubicacion }}</dd>
        </div>
        <div v-if="slot.dims">
          <dt>Medida</dt>
          <dd>{{ slot.dims.w }} × {{ slot.dims.h }} px</dd>
        </div>
        <div v-if="slot.isBonus">
          <dt>Tipo</dt>
          <dd>Bonificación</dd>
        </div>
        <div v-if="isShared">
          <dt>Modalidad</dt>
          <dd>Compartido (50% / 50%)</dd>
        </div>
      </dl>

      <div class="tip-history">
        <p>{{ historial }}</p>
        <p v-if="slot.ventaPosterior" class="tip-next">
          Ya vendido en la Ed. {{ slot.ventaPosterior.edicion }} a {{ slot.ventaPosterior.empresa }}
          <template v-if="slot.ventaPosterior.compartido"> (compartido)</template>
        </p>
        <p v-if="slot.ventaAnterior" class="tip-muted">
          Venta anterior: {{ slot.ventaAnterior.empresa }} · Ed. {{ slot.ventaAnterior.edicion }}
          <template v-if="slot.ventaAnterior.compartido"> (compartido)</template>
          <template v-if="slot.ventaAnterior.ejecutivo"> ({{ slot.ventaAnterior.ejecutivo }})</template>
        </p>
      </div>

      <p v-if="active.note" class="tip-note">{{ active.note }}</p>
    </div>
  </div>
</template>

<style scoped>
.tip {
  position: fixed;
  z-index: 50;
  width: 300px;
  max-width: calc(100vw - 16px);
  max-height: calc(100vh - 16px);
  overflow-y: auto;
  pointer-events: none;
  background: var(--paper-raised);
  color: var(--ink);
  border: 1px solid var(--line-strong);
  box-shadow: 0 10px 28px rgb(0 0 0 / 0.22);
  font-size: 13px;
  line-height: 1.4;
  animation: tip-in 90ms ease-out;
}

@keyframes tip-in {
  from {
    opacity: 0;
    transform: translateY(3px);
  }
}

/* Flecha apuntando al aviso. */
.tip::after {
  content: '';
  position: absolute;
  left: calc(var(--arrow-x) - 7px);
  width: 12px;
  height: 12px;
  background: inherit;
  border: inherit;
  transform: rotate(45deg);
}

.tip--top::after {
  bottom: -7px;
  border-top: none;
  border-left: none;
}

.tip--bottom::after {
  top: -7px;
  border-bottom: none;
  border-right: none;
  background: var(--portal-accent);
  border-color: var(--portal-accent);
}

.tip-head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: var(--portal-accent);
  color: #fff;
}

.is-free .tip-head {
  background: var(--portal-accent-soft);
  color: var(--portal-accent-ink);
}

.is-free.tip--bottom::after {
  background: var(--portal-accent-soft);
  border-color: var(--portal-accent-soft);
}

.is-shared .tip-head {
  background: var(--color-shared, #15803d);
  color: #fff;
}

.is-shared.tip--bottom::after {
  background: var(--color-shared, #15803d);
  border-color: var(--color-shared, #15803d);
}

.tip-shared-client:not(:first-child) {
  margin-top: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px dashed var(--line);
}

.tip-shared-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
}

.tip-pct-badge {
  flex-shrink: 0;
  font-size: 11px;
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--color-shared, #15803d);
  background: var(--color-shared-soft, #dcfce7);
  padding: 1px 6px;
  border-radius: 2px;
}

.tip-swatch {
  flex-shrink: 0;
  border: 1.5px solid currentColor;
  opacity: 0.9;
}

.tip-title {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.tip-title strong {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 17px;
  line-height: 1.1;
}

.tip-title span {
  font-size: 11px;
  opacity: 0.85;
}

.tip-status {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 2px 6px;
  border: 1px solid currentColor;
}

.tip-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
}

.tip-company {
  font-weight: 600;
  font-size: 15px;
  line-height: 1.25;
}

.tip-free {
  font-weight: 600;
  padding-left: var(--space-2);
  border-left: 3px solid var(--portal-accent);
}

.tip-muted {
  color: var(--ink-soft);
  font-size: 12px;
}

.tip-facts {
  display: grid;
  gap: 4px;
  margin: 0;
  padding: var(--space-2) 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.tip-facts div {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: var(--space-2);
}

.tip-facts dt {
  color: var(--ink-faint);
  font-size: 12px;
}

.tip-facts dd {
  margin: 0;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.tip-history {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
}

.tip-next {
  font-weight: 600;
}

.tip-note {
  font-size: 12px;
  color: var(--ink-soft);
  font-style: italic;
}
</style>
