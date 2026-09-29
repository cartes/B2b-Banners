<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

// La maqueta de escritorio se arma a medidas reales (los avisos van en
// px del sitio) y se escala para caber en el contenedor, igual que ver
// el sitio con zoom. Bajo MIN_SCALE deja de achicar y se desplaza en X.
const props = defineProps({
  domain: { type: String, required: true },
  width: { type: Number, default: 1344 },
})

const MIN_SCALE = 0.5

const outer = ref(null)
const inner = ref(null)
const scale = ref(1)
const innerHeight = ref(0)

let observer
function measure() {
  if (!outer.value || !inner.value) return
  scale.value = Math.max(MIN_SCALE, Math.min(1, outer.value.clientWidth / props.width))
  innerHeight.value = inner.value.offsetHeight
}

onMounted(() => {
  observer = new ResizeObserver(measure)
  observer.observe(outer.value)
  observer.observe(inner.value)
  measure()
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div class="browser">
    <div class="browser-chrome">
      <span class="chrome-dot" /><span class="chrome-dot" /><span class="chrome-dot" />
      <span class="chrome-url">https://www.{{ domain }}</span>
      <span v-if="scale < 1" class="chrome-zoom">{{ Math.round(scale * 100) }}%</span>
    </div>
    <div ref="outer" class="browser-viewport">
      <div class="browser-sizer" :style="{ width: `${width * scale}px`, height: `${innerHeight * scale}px` }">
        <div ref="inner" class="browser-page" :style="{ width: `${width}px`, transform: `scale(${scale})` }">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.browser {
  border: 1px solid var(--line-strong);
  background: var(--paper-raised);
}

.browser-chrome {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--line);
}

.chrome-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--line-strong);
}

.chrome-url {
  margin-left: var(--space-2);
  flex: 1;
  min-width: 0;
  padding: 2px var(--space-3);
  background: var(--paper);
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-soft);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chrome-zoom {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-faint);
}

.browser-viewport {
  overflow-x: auto;
}

/* Ocupa exactamente el tamaño escalado; clip (no hidden) para que el alto
   sin escalar de la página no genere un área de scroll propia. */
.browser-sizer {
  overflow: clip;
}

.browser-page {
  transform-origin: 0 0;
}
</style>
