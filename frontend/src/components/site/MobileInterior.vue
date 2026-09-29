<script setup>
import PhoneFrame from './PhoneFrame.vue'
import SiteHeader from './SiteHeader.vue'
import SiteNote from './SiteNote.vue'
import AdSlot from './AdSlot.vue'

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
  <PhoneFrame :domain="`${portal.domain}/nota`">
    <div class="site mi">
      <SiteHeader :portal="portal" mobile>
        <template #leaderboard>
          <AdSlot :slot="positions.lb" :dimmed="isDimmed(positions.lb)" />
        </template>
      </SiteHeader>

      <article class="mi-body">
        <span class="mi-category">{{ portal.nav[0] }}</span>
        <div class="mi-h1">
          <div class="site-line" />
          <div class="site-line" />
          <div class="site-line is-short" />
        </div>
        <div class="site-img" />
        <div v-for="n in 5" :key="`a${n}`" class="site-line" :class="{ 'is-mid': n % 3 === 0 }" />

        <div class="mi-ad"><AdSlot :slot="positions.mr1" :dimmed="isDimmed(positions.mr1)" /></div>

        <div v-for="n in 5" :key="`b${n}`" class="site-line" :class="{ 'is-short': n === 5 }" />

        <div class="mi-ad"><AdSlot :slot="positions.mr2" :dimmed="isDimmed(positions.mr2)" /></div>

        <div class="site-bar">Lo último del mes</div>
        <SiteNote v-for="n in 2" :key="`u${n}`" :image="false" :lines="2" />

        <div class="mi-ad"><AdSlot :slot="positions.mr3" :dimmed="isDimmed(positions.mr3)" /></div>

        <div class="site-bar">Lo más leído</div>
        <SiteNote v-for="n in 2" :key="`l${n}`" :image="false" :lines="2" />
      </article>

      <div class="site-float" :style="{ '--float-w': `${positions.footer.dims.w}px` }">
        <span class="site-float-close">Cerrar Aviso [X]</span>
        <AdSlot :slot="positions.footer" :dimmed="isDimmed(positions.footer)" />
      </div>
    </div>
  </PhoneFrame>
</template>

<style scoped>
.mi-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 12px 20px;
}

.mi-category {
  align-self: flex-start;
  background: var(--portal-accent);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
}

.mi-h1 {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mi-h1 .site-line {
  height: 16px;
  background: #b5b5b5;
}

.mi-ad {
  display: flex;
  justify-content: center;
  padding: 8px 0;
  border-top: 1px solid var(--site-rule);
  border-bottom: 1px solid var(--site-rule);
}
</style>
