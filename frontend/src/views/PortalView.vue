<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPortal, portalStyle } from '@/config/portals'
import { SECTIONS, sectionMeta } from '@/config/formats'
import { useCatalog, usePortalInventory } from '@/composables/useCatalog'
import InventoryStats from '@/components/InventoryStats.vue'
import FilterBar from '@/components/FilterBar.vue'
import SectionTabs from '@/components/SectionTabs.vue'
import SlotCard from '@/components/SlotCard.vue'
import AdTooltip from '@/components/AdTooltip.vue'
import NewsletterSkeleton from '@/components/NewsletterSkeleton.vue'
import DesktopHome from '@/components/site/DesktopHome.vue'
import DesktopInterior from '@/components/site/DesktopInterior.vue'
import MobileHome from '@/components/site/MobileHome.vue'
import MobileInterior from '@/components/site/MobileInterior.vue'

const props = defineProps({
  portalId: { type: String, required: true },
})

const { status, error, load } = useCatalog()

// App.vue remonta esta vista al cambiar de portal (:key en RouterView),
// así que portalId es estable durante el ciclo de vida del componente.
const portal = getPortal(props.portalId)

// La edición a mostrar vive en la URL (?edicion=1095) para poder compartir
// el link; sin parámetro se usa la más reciente.
const route = useRoute()
const router = useRouter()
const edicionEnUrl = computed(() => route.query.edicion ?? null)
const { edicion, ediciones, slots, pages, placedIds, summary } = usePortalInventory(portal, edicionEnUrl)

const edicionModel = computed({
  get: () => edicion.value,
  set: (numero) => {
    const query = { ...route.query }
    if (numero === ediciones.value[0]?.numero) delete query.edicion
    else query.edicion = String(numero)
    router.replace({ query })
  },
})

const edicionIndex = computed(() => ediciones.value.findIndex((e) => e.numero === edicion.value))

// Lista de más nueva a más antigua: "anterior" es el índice siguiente.
function moverEdicion(delta) {
  const destino = ediciones.value[edicionIndex.value + delta]
  if (destino) edicionModel.value = destino.numero
}

const query = ref('')
const statusFilter = ref('todos')
const activeSection = ref('todas')

// Secciones que corresponden a una página del sitio: se dibujan como la
// página publicada, con cada aviso en su posición real.
const PAGE_VIEWS = {
  'desktop-home': DesktopHome,
  'desktop-interior': DesktopInterior,
  'movil-home': MobileHome,
  'movil-interior': MobileInterior,
}
const MOBILE_PAGES = new Set(['movil-home', 'movil-interior'])
const SPATIAL_SECTIONS = new Set([...Object.keys(PAGE_VIEWS), 'newsletter'])

const sectionsWithCount = computed(() =>
  SECTIONS.map((s) => ({ ...s, count: slots.value.filter((slot) => slot.section === s.id).length })).filter(
    (s) => s.count > 0,
  ),
)

const hasActiveFilter = computed(() => statusFilter.value !== 'todos' || query.value.trim() !== '')

function matchesFilter(slot) {
  if (statusFilter.value !== 'todos' && slot.status !== statusFilter.value) return false
  const q = query.value.trim().toLowerCase()
  if (q) {
    const haystack = `${slot.empresa ?? ''} ${slot.ejecutivo ?? ''} ${slot.formato} ${slot.label ?? ''}`.toLowerCase()
    if (!haystack.includes(q)) return false
  }
  return true
}

// ids que pasan el filtro actual (para atenuar, no ocultar, en las vistas
// espaciales) — null cuando no hay ningún filtro activo.
const matchIds = computed(() => {
  if (!hasActiveFilter.value) return null
  return new Set(slots.value.filter(matchesFilter).map((s) => s.id))
})

const visibleSections = computed(() =>
  sectionsWithCount.value.filter((s) => activeSection.value === 'todas' || activeSection.value === s.id),
)

// Avisos de una página que no calzan con ninguna posición publicada (p. ej.
// un formato nuevo en el ERP): se listan bajo la maqueta para no perderlos.
function unplaced(sectionId) {
  return slots.value.filter((s) => s.section === sectionId && !placedIds.value.has(s.id))
}

const desktopPages = computed(() =>
  visibleSections.value
    .filter((s) => PAGE_VIEWS[s.id] && !MOBILE_PAGES.has(s.id))
    .map((s) => ({ section: s, extra: unplaced(s.id) })),
)

const mobilePages = computed(() =>
  visibleSections.value
    .filter((s) => MOBILE_PAGES.has(s.id))
    .map((s) => ({ section: s, extra: unplaced(s.id) })),
)

const newsletter = computed(() => {
  if (!visibleSections.value.some((s) => s.id === 'newsletter')) return null
  return slots.value.filter((s) => s.section === 'newsletter')
})

// Intersticial, especiales y formatos anteriores no son posiciones de
// página: se filtran de verdad como una lista.
const listGroups = computed(() =>
  visibleSections.value
    .filter((s) => !SPATIAL_SECTIONS.has(s.id))
    .map((s) => ({
      section: s,
      slots: slots.value.filter((slot) => slot.section === s.id && matchesFilter(slot)),
    }))
    .filter((g) => g.slots.length),
)

const noResults = computed(() => {
  if (!hasActiveFilter.value) return false
  return !matchIds.value.size
})
</script>

<template>
  <div class="portal" :style="portalStyle(portal)">
    <header class="portal-header">
      <div class="portal-identity">
        <span class="portal-logo">{{ portal.logoText }}</span>
        <div>
          <h1>{{ portal.name }}</h1>
          <p class="portal-tagline">{{ portal.tagline }} &middot; {{ portal.domain }}</p>
          <div v-if="ediciones.length" class="edition-picker">
            <button
              type="button"
              class="edition-step"
              :disabled="edicionIndex >= ediciones.length - 1"
              aria-label="Edición anterior"
              @click="moverEdicion(1)"
            >
              &lsaquo;
            </button>
            <label class="edition-select">
              <span>Edición</span>
              <select v-model.number="edicionModel">
                <option v-for="(e, i) in ediciones" :key="e.numero" :value="e.numero">
                  {{ e.numero }} · {{ e.avisos }} {{ e.avisos === 1 ? 'aviso' : 'avisos' }}{{ i === 0 ? ' · más reciente' : '' }}
                </option>
              </select>
            </label>
            <button
              type="button"
              class="edition-step"
              :disabled="edicionIndex <= 0"
              aria-label="Edición siguiente"
              @click="moverEdicion(-1)"
            >
              &rsaquo;
            </button>
          </div>
        </div>
      </div>

      <InventoryStats v-if="status === 'ready' && summary.total" :summary="summary" />
    </header>

    <p v-if="status === 'loading'" class="state-msg">Cargando avisos…</p>

    <div v-else-if="status === 'error'" class="state-msg state-error">
      <p>No se pudo cargar el catálogo: {{ error }}</p>
      <button type="button" @click="load">Reintentar</button>
    </div>

    <p v-else-if="status === 'ready' && !summary.total" class="state-msg">
      No hay avisos registrados para {{ portal.name }} en el histórico consultado.
    </p>

    <template v-else-if="status === 'ready'">
      <div class="controls">
        <FilterBar v-model:query="query" v-model:status-filter="statusFilter" />
        <SectionTabs v-model:active="activeSection" :sections="sectionsWithCount" />
        <div class="legend">
          <span class="legend-item"><span class="legend-swatch is-sold" /> Vendido en la edición {{ edicion }}</span>
          <span class="legend-item"><span class="legend-swatch is-free" /> Disponible</span>
          <span class="legend-hint">Pasa el cursor sobre un aviso para ver su estado, formato e historial de ventas.</span>
        </div>
      </div>

      <p v-if="noResults" class="state-msg">Ningún aviso coincide con el filtro actual.</p>

      <section v-for="page in desktopPages" :key="page.section.id" class="section-block">
        <h2 class="section-title">{{ sectionMeta(page.section.id).label }}</h2>
        <component
          :is="PAGE_VIEWS[page.section.id]"
          :portal="portal"
          :positions="pages[page.section.id]"
          :match-ids="matchIds"
        />
        <div v-if="page.extra.length" class="extra">
          <h3 class="extra-title">Otras posiciones de esta página</h3>
          <div class="slot-grid">
            <SlotCard v-for="slot in page.extra" :key="slot.id" :slot="slot" :dimmed="matchIds ? !matchIds.has(slot.id) : false" />
          </div>
        </div>
      </section>

      <div v-if="mobilePages.length" class="phones">
        <section v-for="page in mobilePages" :key="page.section.id" class="section-block phone-block">
          <h2 class="section-title">{{ sectionMeta(page.section.id).label }}</h2>
          <component
            :is="PAGE_VIEWS[page.section.id]"
            :portal="portal"
            :positions="pages[page.section.id]"
            :match-ids="matchIds"
          />
          <div v-if="page.extra.length" class="extra">
            <h3 class="extra-title">Otras posiciones de esta página</h3>
            <div class="slot-grid">
              <SlotCard v-for="slot in page.extra" :key="slot.id" :slot="slot" :dimmed="matchIds ? !matchIds.has(slot.id) : false" />
            </div>
          </div>
        </section>
      </div>

      <section v-if="newsletter" class="section-block">
        <h2 class="section-title">{{ sectionMeta('newsletter').label }}</h2>
        <NewsletterSkeleton :slots="newsletter" :match-ids="matchIds" />
      </section>

      <section v-for="group in listGroups" :key="group.section.id" class="section-block">
        <h2 class="section-title">{{ sectionMeta(group.section.id).label }}</h2>
        <p v-if="group.section.id === 'anteriores'" class="section-note">
          Posiciones del diseño previo del sitio (A–E, Big y Full Skyscraper). Ya no existen en las páginas
          publicadas y no se cuentan en el total de avisos.
        </p>
        <div class="slot-grid">
          <SlotCard v-for="slot in group.slots" :key="slot.id" :slot="slot" />
        </div>
      </section>
    </template>

    <AdTooltip />
  </div>
</template>

<style scoped>
.portal {
  padding: var(--space-5) var(--space-6) var(--space-7);
  max-width: 1440px;
  margin: 0 auto;
}

.portal-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--space-5);
  padding-bottom: var(--space-4);
  margin-bottom: var(--space-5);
  border-bottom: 4px solid var(--portal-accent);
}

.portal-identity {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.portal-logo {
  display: grid;
  place-items: center;
  min-width: 64px;
  height: 64px;
  padding: 0 var(--space-3);
  background: var(--portal-accent);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  font-size: 20px;
}

.portal-identity h1 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 40px;
  line-height: 1;
}

.portal-tagline {
  margin-top: var(--space-2);
  color: var(--ink-soft);
  font-size: 14px;
}

.edition-picker {
  display: inline-flex;
  align-items: stretch;
  margin-top: var(--space-3);
  border: 1px solid var(--line-strong);
  background: var(--paper-raised);
}

.edition-select {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-2);
  border-left: 1px solid var(--line-strong);
  border-right: 1px solid var(--line-strong);
  box-shadow: inset 0 -3px 0 var(--portal-accent);
}

.edition-select span {
  font-size: 12px;
  color: var(--ink-faint);
}

.edition-select select {
  padding: var(--space-2) 0;
  border: none;
  background: transparent;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--ink);
  cursor: pointer;
}

.edition-select select option {
  background: var(--paper-raised);
}

.edition-step {
  width: 34px;
  border: none;
  background: transparent;
  font-size: 20px;
  line-height: 1;
  color: var(--ink-soft);
}

.edition-step:hover:not(:disabled) {
  color: var(--ink);
  background: var(--paper);
}

.edition-step:disabled {
  opacity: 0.35;
  cursor: default;
}

.state-msg {
  padding: var(--space-6) 0;
  color: var(--ink-soft);
}

.state-error button {
  margin-top: var(--space-3);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--line-strong);
  background: var(--paper-raised);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-5);
  font-size: 13px;
  color: var(--ink-soft);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.legend-swatch {
  width: 22px;
  height: 14px;
}

.legend-swatch.is-sold {
  background: var(--portal-accent);
}

.legend-swatch.is-free {
  background: repeating-linear-gradient(-45deg, var(--portal-accent-soft) 0 4px, #fff 4px 8px);
  outline: 2px dashed var(--portal-accent);
  outline-offset: -2px;
}

.legend-hint {
  color: var(--ink-faint);
  font-size: 12px;
}

.section-block {
  margin-bottom: var(--space-7);
  min-width: 0;
}

.section-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 22px;
  padding-bottom: var(--space-2);
  margin-bottom: var(--space-3);
  border-bottom: 1px solid var(--line);
}

.section-note {
  margin-bottom: var(--space-3);
  font-size: 13px;
  color: var(--ink-soft);
  max-width: 70ch;
}

.phones {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-6);
}

.phone-block {
  flex: 0 1 auto;
}

.extra {
  margin-top: var(--space-4);
}

.extra-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-soft);
  margin-bottom: var(--space-2);
}

.slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-3);
}

@media (max-width: 640px) {
  .portal {
    padding: var(--space-4) var(--space-3) var(--space-6);
  }
  .portal-identity h1 {
    font-size: 30px;
  }
  .portal-logo {
    min-width: 48px;
    height: 48px;
    font-size: 15px;
  }
}
</style>
