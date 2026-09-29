<script setup>
import BrowserFrame from './BrowserFrame.vue'
import SiteHeader from './SiteHeader.vue'
import SiteNote from './SiteNote.vue'
import AdSlot from './AdSlot.vue'

// Nota interior: artículo (520px) con los Medium Rectangle intercalados en
// el texto, columna media con listados, columna derecha con Top Medium
// Rectangle y Big Rectangle, y Super Billboard al cierre.
const props = defineProps({
  portal: { type: Object, required: true },
  positions: { type: Object, required: true },
  matchIds: { type: Object, default: null },
})

function isDimmed(slot) {
  return props.matchIds ? !props.matchIds.has(slot.id) : false
}
</script>

<template>
  <BrowserFrame :domain="`${portal.domain}/nota`">
    <div class="site di">
      <SiteHeader :portal="portal">
        <template #leaderboard>
          <AdSlot :slot="positions.lb" :dimmed="isDimmed(positions.lb)" />
        </template>
      </SiteHeader>

      <div class="di-body">
        <aside class="di-rail">
          <AdSlot :slot="positions.skyIS" :dimmed="isDimmed(positions.skyIS)" note="mismo que Home" />
          <AdSlot class="di-rail-lower" :slot="positions.skyII" :dimmed="isDimmed(positions.skyII)" note="mismo que Home" />
        </aside>

        <main class="di-main">
          <div class="di-columns">
            <article class="di-article">
              <span class="di-category">{{ portal.nav[0] }}</span>
              <div class="site-date" />
              <div class="di-h1">
                <div class="site-line" />
                <div class="site-line" />
                <div class="site-line is-short" />
              </div>
              <div class="di-share">
                <span v-for="n in 4" :key="n" />
              </div>
              <div class="site-img" />
              <div class="di-text">
                <div v-for="n in 6" :key="n" class="site-line" :class="{ 'is-mid': n % 3 === 0 }" />
              </div>
              <div class="di-inline-ad">
                <AdSlot :slot="positions.mr1" :dimmed="isDimmed(positions.mr1)" />
              </div>
              <div class="di-text">
                <div v-for="n in 7" :key="n" class="site-line" :class="{ 'is-mid': n % 4 === 0 }" />
              </div>
              <div class="di-inline-ad">
                <AdSlot :slot="positions.mr2" :dimmed="isDimmed(positions.mr2)" />
              </div>
              <div class="di-text">
                <div v-for="n in 4" :key="n" class="site-line" :class="{ 'is-short': n === 4 }" />
              </div>
            </article>

            <div class="site-stack">
              <div class="site-cover">
                <div class="site-bar">Revista digital</div>
                <div class="site-cover-img" />
              </div>
              <div class="site-bar">Lo último del mes</div>
              <SiteNote v-for="n in 4" :key="`u${n}`" :image="false" :lines="2" />
              <div class="site-bar">Lo más leído</div>
              <SiteNote v-for="n in 3" :key="`l${n}`" :image="false" :lines="2" />
              <div class="site-bar">Temas relacionados</div>
              <div class="di-tags">
                <span v-for="n in 5" :key="n" />
              </div>
            </div>

            <div class="site-stack">
              <AdSlot :slot="positions.tmr" :dimmed="isDimmed(positions.tmr)" />
              <div class="site-cover">
                <div class="site-bar">Revista digital</div>
                <div class="site-cover-img" />
              </div>
              <AdSlot :slot="positions.br" :dimmed="isDimmed(positions.br)" />
            </div>
          </div>

          <div class="site-divider">
            <AdSlot :slot="positions.sb1" :dimmed="isDimmed(positions.sb1)" />
          </div>

          <section class="site-stack">
            <div class="site-bar">Te puede interesar</div>
            <div class="site-grid cols-4">
              <SiteNote v-for="n in 4" :key="n" :lines="2" />
            </div>
          </section>
        </main>

        <aside class="di-rail">
          <AdSlot :slot="positions.skyDS" :dimmed="isDimmed(positions.skyDS)" note="mismo que Home" />
          <AdSlot class="di-rail-lower" :slot="positions.skyDI" :dimmed="isDimmed(positions.skyDI)" note="mismo que Home" />
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
.di-body {
  display: grid;
  grid-template-columns: 120px 1080px 120px;
  justify-content: center;
  gap: 12px;
  padding: 28px 0 32px;
}

.di-rail {
  display: flex;
  flex-direction: column;
}

.di-rail-lower {
  margin-top: 700px;
}

.di-main {
  display: flex;
  flex-direction: column;
  gap: 26px;
  min-width: 0;
}

/* Columnas medidas en el sitio: 520 / 255 / 266. */
.di-columns {
  display: grid;
  grid-template-columns: 520px 255px 266px;
  justify-content: space-between;
  align-items: start;
}

.di-article {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.di-category {
  align-self: flex-start;
  background: var(--portal-accent);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
}

.di-h1 {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.di-h1 .site-line {
  height: 20px;
  background: #b5b5b5;
}

.di-share {
  display: flex;
  gap: 8px;
}

.di-share span {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--portal-accent-dark);
}

.di-text {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.di-inline-ad {
  display: flex;
  justify-content: center;
  padding: 6px 0;
}

.di-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.di-tags span {
  width: 70px;
  height: 20px;
  border-radius: 999px;
  border: 1px solid var(--site-ph-strong);
}
</style>
