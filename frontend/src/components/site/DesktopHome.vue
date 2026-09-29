<script setup>
import { computed, ref } from 'vue'
import BrowserFrame from './BrowserFrame.vue'
import SiteHeader from './SiteHeader.vue'
import SiteNote from './SiteNote.vue'
import AdSlot from './AdSlot.vue'

// Home de escritorio en el orden publicado: destacadas, bloque de
// pestañas por categoría (3 notas + Medium Rectangle por pestaña) y luego
// los bloques editoriales separados por Super Billboards / Billboards,
// cuyo orden varía por portal (portal.homeDividers).
const props = defineProps({
  portal: { type: Object, required: true },
  positions: { type: Object, required: true },
  matchIds: { type: Object, default: null },
})

function isDimmed(slot) {
  return props.matchIds ? !props.matchIds.has(slot.id) : false
}

const dividers = computed(() => {
  const d = props.portal.homeDividers
  return Object.fromEntries(Object.entries(d).map(([block, posId]) => [block, props.positions[posId]]))
})

// En el sitio el Medium Rectangle cambia con la pestaña activa.
const tabs = computed(() =>
  props.portal.nav.slice(0, 5).map((name, i) => ({ name, slot: props.positions[`mr${i + 1}`] })),
)
const activeTab = ref(0)
</script>

<template>
  <BrowserFrame :domain="portal.domain">
    <div class="site dh">
      <SiteHeader :portal="portal">
        <template #leaderboard>
          <AdSlot :slot="positions.lb" :dimmed="isDimmed(positions.lb)" />
        </template>
      </SiteHeader>

      <div class="dh-body">
        <aside class="dh-rail">
          <AdSlot :slot="positions.skyIS" :dimmed="isDimmed(positions.skyIS)" />
          <AdSlot class="dh-rail-lower" :slot="positions.skyII" :dimmed="isDimmed(positions.skyII)" />
        </aside>

        <main class="dh-main">
          <!-- Informaciones destacadas + columna lateral -->
          <section class="dh-split">
            <div class="site-stack">
              <div class="site-bar">Informaciones destacadas</div>
              <div class="dh-hero">
                <div class="site-img" />
                <SiteNote :image="false" :lines="3" />
              </div>
              <div class="site-grid cols-3">
                <SiteNote v-for="n in 3" :key="n" />
              </div>
            </div>
            <div class="site-stack">
              <div class="site-cover">
                <div class="site-bar">Revista digital</div>
                <div class="site-cover-img" />
                <span class="site-button">Ver ediciones anteriores</span>
              </div>
              <div class="site-bar">Designaciones</div>
              <SiteNote :image="false" :lines="2" />
              <div class="site-bar">Columnas de opinión</div>
              <SiteNote :image="false" :lines="2" />
            </div>
          </section>

          <div v-if="dividers.destacadas" class="site-divider">
            <AdSlot :slot="dividers.destacadas" :dimmed="isDimmed(dividers.destacadas)" />
          </div>

          <!-- Pestañas por categoría: 3 notas + Medium Rectangle -->
          <section class="dh-tabs">
            <div class="dh-tabstrip" role="tablist">
              <button
                v-for="(tab, i) in tabs"
                :key="tab.name"
                type="button"
                role="tab"
                class="dh-tab"
                :class="{ 'is-active': i === activeTab, 'is-dimmed': isDimmed(tab.slot) }"
                :aria-selected="i === activeTab"
                @click="activeTab = i"
              >
                <span class="dh-tab-dot" :class="tab.slot.status === 'vendido' ? 'is-sold' : 'is-free'" />
                {{ tab.name }}
              </button>
            </div>
            <div class="dh-split">
              <div class="site-grid cols-3">
                <SiteNote v-for="n in 3" :key="n" :lines="3" />
              </div>
              <div class="dh-tabad">
                <AdSlot :slot="tabs[activeTab].slot" :dimmed="isDimmed(tabs[activeTab].slot)" />
              </div>
            </div>
          </section>

          <section class="site-stack">
            <div class="site-bar">Lo último del mes</div>
            <div class="site-grid cols-6">
              <SiteNote v-for="n in 6" :key="n" :lines="2" />
            </div>
          </section>

          <div v-if="dividers.ultimo" class="site-divider">
            <AdSlot :slot="dividers.ultimo" :dimmed="isDimmed(dividers.ultimo)" />
          </div>

          <section class="site-grid cols-3">
            <div class="site-cover">
              <div class="site-bar">Revista digital</div>
              <div class="site-cover-img dh-cover-sm" />
            </div>
            <div class="site-cover">
              <div class="site-bar">Catálogo</div>
              <div class="site-cover-img dh-cover-sm" />
            </div>
            <div class="site-stack">
              <div class="site-tabtitle"><span>Contenido auspiciado</span><span>+ Leer más</span></div>
              <SiteNote :lines="2" />
            </div>
          </section>

          <div v-if="dividers.revista" class="site-divider">
            <AdSlot :slot="dividers.revista" :dimmed="isDimmed(dividers.revista)" />
          </div>

          <section class="site-stack">
            <div class="site-tabtitle"><span>Calendario de Eventos</span><span>+ Leer más Eventos</span></div>
            <div class="site-grid cols-3">
              <div v-for="n in 3" :key="n" class="dh-event">
                <div class="dh-event-year" />
                <div class="site-line is-title is-mid" />
                <div class="site-line is-short" />
              </div>
            </div>
          </section>

          <div v-if="dividers.eventos" class="site-divider">
            <AdSlot :slot="dividers.eventos" :dimmed="isDimmed(dividers.eventos)" />
          </div>

          <section class="site-stack">
            <div class="site-tabtitle"><span>Designaciones</span><span>+ Leer más</span></div>
            <div class="site-grid cols-6">
              <div v-for="n in 6" :key="n" class="dh-person">
                <div class="dh-avatar" />
                <div class="site-line" />
                <div class="site-line is-short" />
              </div>
            </div>
          </section>

          <div v-if="dividers.designaciones" class="site-divider">
            <AdSlot :slot="dividers.designaciones" :dimmed="isDimmed(dividers.designaciones)" />
          </div>

          <section class="site-grid cols-3">
            <div v-for="title in ['Lo último del mes', 'Lo más leído', 'Columnas de opinión']" :key="title" class="site-stack">
              <div class="site-bar">{{ title }}</div>
              <SiteNote v-for="n in 3" :key="n" :image="false" :lines="2" />
            </div>
          </section>

          <div v-if="dividers.columnas" class="site-divider">
            <AdSlot :slot="dividers.columnas" :dimmed="isDimmed(dividers.columnas)" />
          </div>

          <section class="site-grid cols-3">
            <div v-for="title in ['Proveedores', 'Tendencias animadas', 'Multimedia']" :key="title" class="site-stack">
              <div class="site-tabtitle"><span>{{ title }}</span><span>+ Ver más</span></div>
              <SiteNote :lines="2" />
            </div>
          </section>
        </main>

        <aside class="dh-rail">
          <AdSlot :slot="positions.skyDS" :dimmed="isDimmed(positions.skyDS)" />
          <AdSlot class="dh-rail-lower" :slot="positions.skyDI" :dimmed="isDimmed(positions.skyDI)" />
        </aside>
      </div>

      <div class="site-float" :style="{ '--float-w': `${positions.footer.dims.w}px` }">
        <span class="site-float-close">Cerrar Aviso [X]</span>
        <AdSlot :slot="positions.footer" :dimmed="isDimmed(positions.footer)" />
      </div>

      <footer class="site-footer">
        <div v-for="n in 4" :key="n" class="site-stack">
          <div class="site-line is-short" />
          <div class="site-line" />
          <div class="site-line is-mid" />
        </div>
      </footer>
    </div>
  </BrowserFrame>
</template>

<style scoped>
/* Medidas del sitio a 1440px: rieles de 120px pegados a un contenido de
   1080px (x 180–1260). */
.dh-body {
  display: grid;
  grid-template-columns: 120px 1080px 120px;
  justify-content: center;
  gap: 12px;
  padding: 28px 0 32px;
}

.dh-rail {
  display: flex;
  flex-direction: column;
}

/* El skyscraper inferior aparece recién al bajar por la página. */
.dh-rail-lower {
  margin-top: 900px;
}

.dh-main {
  display: flex;
  flex-direction: column;
  gap: 26px;
  min-width: 0;
}

.dh-split {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 20px;
  align-items: start;
}

.dh-hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  align-items: center;
}

.dh-tabs {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dh-tabstrip {
  display: flex;
  border-bottom: 2px solid var(--portal-accent);
}

.dh-tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border: none;
  background: none;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  color: var(--site-muted);
  cursor: pointer;
}

.dh-tab:hover {
  color: var(--site-text);
}

.dh-tab.is-active {
  background: var(--portal-accent);
  color: #fff;
}

.dh-tab.is-dimmed {
  opacity: 0.4;
}

.dh-tab-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 2px solid currentColor;
}

.dh-tab-dot.is-sold {
  background: currentColor;
}

.dh-tabad {
  display: flex;
  justify-content: center;
}

.dh-cover-sm {
  width: 40%;
}

.dh-event {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border: 1px solid var(--site-rule);
}

.dh-event-year {
  height: 46px;
  background: linear-gradient(90deg, var(--site-ph) 0 70%, var(--portal-accent-dark) 70%);
}

.dh-person {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.dh-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--site-ph-strong);
}
</style>
