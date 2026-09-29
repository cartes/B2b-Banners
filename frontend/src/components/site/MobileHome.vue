<script setup>
import PhoneFrame from './PhoneFrame.vue'
import SiteHeader from './SiteHeader.vue'
import SiteNote from './SiteNote.vue'
import AdSlot from './AdSlot.vue'

// Home móvil: los bloques del home de escritorio en una columna, con los
// Medium Rectangle 300×250 donde el escritorio tiene los billboards.
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
  <PhoneFrame :domain="portal.domain">
    <div class="site mh">
      <SiteHeader :portal="portal" mobile>
        <template #leaderboard>
          <AdSlot :slot="positions.lb" :dimmed="isDimmed(positions.lb)" />
        </template>
      </SiteHeader>

      <div class="mh-body">
        <div class="site-bar">Informaciones destacadas</div>
        <SiteNote :lines="3" />
        <div class="site-grid cols-2">
          <SiteNote v-for="n in 2" :key="n" />
        </div>

        <div class="mh-ad"><AdSlot :slot="positions.mr1" :dimmed="isDimmed(positions.mr1)" /></div>

        <div class="site-bar">{{ portal.nav[0] }}</div>
        <SiteNote v-for="n in 2" :key="`c${n}`" :image="n === 1" :lines="2" />

        <div class="site-bar">Lo último del mes</div>
        <SiteNote v-for="n in 2" :key="`u${n}`" :image="false" :lines="2" />

        <div class="mh-ad"><AdSlot :slot="positions.mr2" :dimmed="isDimmed(positions.mr2)" /></div>

        <div class="site-cover">
          <div class="site-bar">Revista digital</div>
          <div class="site-cover-img mh-cover" />
        </div>
        <div class="site-tabtitle"><span>Calendario de Eventos</span><span>+ Leer más</span></div>
        <div class="site-line is-title is-mid" />

        <div class="mh-ad"><AdSlot :slot="positions.mr3" :dimmed="isDimmed(positions.mr3)" /></div>

        <div class="site-tabtitle"><span>Designaciones</span><span>+ Leer más</span></div>
        <SiteNote :image="false" :lines="2" />
        <div class="site-bar">Columnas de opinión</div>
        <SiteNote :image="false" :lines="2" />

        <div class="mh-ad"><AdSlot :slot="positions.mr4" :dimmed="isDimmed(positions.mr4)" /></div>

        <div class="site-tabtitle"><span>Proveedores</span><span>+ Leer más</span></div>
        <SiteNote :lines="2" />

        <div class="mh-ad"><AdSlot :slot="positions.mr5" :dimmed="isDimmed(positions.mr5)" /></div>

        <div class="site-tabtitle"><span>Multimedia</span><span>+ Ver más</span></div>
        <div class="site-img" />
      </div>

      <div class="site-float" :style="{ '--float-w': `${positions.footer.dims.w}px` }">
        <span class="site-float-close">Cerrar Aviso [X]</span>
        <AdSlot :slot="positions.footer" :dimmed="isDimmed(positions.footer)" />
      </div>
    </div>
  </PhoneFrame>
</template>

<style scoped>
.mh-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 12px 20px;
}

.mh-ad {
  display: flex;
  justify-content: center;
  padding: 8px 0;
  border-top: 1px solid var(--site-rule);
  border-bottom: 1px solid var(--site-rule);
}

.mh-cover {
  width: 45%;
}
</style>
