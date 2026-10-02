<script setup>
import { computed } from 'vue'
import { classifyNewsletterFamily } from '@/config/zones'
import { ordenarUbicacion } from '@/composables/useCatalog'
import SlotCard from './SlotCard.vue'

const props = defineProps({
  slots: { type: Array, required: true },
  portal: { type: Object, required: true },
  edition: { type: [String, Number], default: null },
  matchIds: { type: Object, default: null },
})

const isDimmed = (slot) => props.matchIds ? !props.matchIds.has(slot.id) : false
const groups = computed(() => {
  const families = { sponsor: [], f: [], k: [], l: [], other: [] }
  for (const slot of props.slots) families[classifyNewsletterFamily(slot.formato)].push(slot)
  for (const slots of Object.values(families)) {
    slots.sort((a, b) => ordenarUbicacion(a.ubicacion, b.ubicacion) || a.formato.localeCompare(b.formato, 'es', { numeric: true }))
  }
  // Dos rectángulos laterales por bloque, como en el newsletter publicado.
  // No redistribuir las posiciones según la cantidad de banners vendidos.
  const blocks = Array.from({ length: Math.max(1, Math.ceil(families.l.length / 2), families.k.length) }, (_, i) => ({
    side: families.l.slice(i * 2, i * 2 + 2),
    banner: families.k[i],
  }))
  return { ...families, blocks }
})
</script>

<template>
  <div class="newsletter-preview">
    <div class="nl-guide">
      <div>
        <h3>Ubicación de los avisos</h3>
        <p>Recorre el newsletter de arriba hacia abajo. Cada aviso muestra su cliente, posición y estado.</p>
      </div>
      <span class="nl-count">{{ slots.length }} {{ slots.length === 1 ? 'espacio' : 'espacios' }} publicitarios</span>
    </div>
    <p class="nl-caption">Vista esquemática · Los bloques grises representan noticias de ejemplo.</p>

    <div class="newsletter-frame">
      <header class="nl-masthead">
        <p class="nl-eyebrow">NEWSLETTER</p>
        <h3>{{ portal.name }} <span>al día</span></h3>
        <div class="nl-meta"><span>{{ portal.domain }}</span><span v-if="edition">Edición {{ edition }}</span></div>
      </header>

      <div class="nl-body">
        <section v-if="groups.f[0]" class="nl-placement">
          <h4>Banner superior <span>F · {{ groups.f[0].ubicacion }}</span></h4>
          <SlotCard :slot="groups.f[0]" compact :dimmed="isDimmed(groups.f[0])" />
        </section>

        <div class="nl-columns nl-lead">
          <div class="nl-editorial">
            <span class="nl-editorial-label">NOTICIA PRINCIPAL</span>
            <div class="nl-photo nl-photo--lead" aria-hidden="true"><svg viewBox="0 0 80 50" fill="none"><path d="m4 44 24-28 16 18 12-12 20 22H4Z" fill="currentColor"/><circle cx="57" cy="10" r="6" fill="currentColor"/></svg></div>
            <h4>La noticia destacada de {{ portal.name }}</h4>
            <div class="nl-lines" aria-hidden="true"><i /><i /><i /></div>
          </div>
          <aside v-if="groups.sponsor.length" class="nl-side" aria-label="Sponsors junto a la noticia principal">
            <section v-for="slot in groups.sponsor" :key="slot.id" class="nl-placement nl-sponsor">
              <h4>Sponsor <span>{{ slot.ubicacion }}</span></h4>
              <SlotCard :slot="slot" compact :dimmed="isDimmed(slot)" />
            </section>
          </aside>
        </div>

        <section v-for="slot in groups.f.slice(1)" :key="slot.id" class="nl-placement">
          <h4>Banner bajo la noticia principal <span>F · {{ slot.ubicacion }}</span></h4>
          <SlotCard :slot="slot" compact :dimmed="isDimmed(slot)" />
        </section>

        <template v-for="(block, index) in groups.blocks" :key="index">
          <div class="nl-columns nl-news-block">
            <div class="nl-editorial">
              <h4 class="nl-news-heading">{{ index === 0 ? 'Actualidad' : 'Más noticias' }}</h4>
              <div v-for="n in 3" :key="n" class="nl-story" aria-hidden="true">
                <div class="nl-photo" />
                <div class="nl-lines"><span>Contenido editorial</span><i /><i /><i /></div>
              </div>
            </div>
            <aside v-if="block.side.length" class="nl-side" aria-label="Avisos a la derecha de las noticias">
              <section v-for="slot in block.side" :key="slot.id" class="nl-placement nl-rectangle">
                <h4>Aviso lateral <span>L · {{ slot.ubicacion }}</span></h4>
                <SlotCard :slot="slot" compact :dimmed="isDimmed(slot)" />
              </section>
            </aside>
          </div>
          <section v-if="block.banner" class="nl-placement nl-section-banner">
            <h4>Banner entre noticias <span>K · {{ block.banner.ubicacion }}</span></h4>
            <SlotCard :slot="block.banner" compact :dimmed="isDimmed(block.banner)" />
          </section>
        </template>
        <footer class="nl-footer">{{ portal.name }} <span>{{ portal.tagline }}</span></footer>
      </div>
    </div>

    <section v-if="groups.other.length" class="nl-extra">
      <h3>Otros formatos del newsletter</h3>
      <p>Estos avisos no tienen una ubicación identificada en la maqueta.</p>
      <div class="nl-extra-grid"><SlotCard v-for="slot in groups.other" :key="slot.id" :slot="slot" :dimmed="isDimmed(slot)" /></div>
    </section>
  </div>
</template>

<style scoped>
.newsletter-preview { padding: 24px; background: #eef0f2; border: 1px solid var(--line); }
.nl-guide { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.nl-guide h3, .nl-extra h3 { font-size: 18px; font-weight: 600; }
.nl-guide p, .nl-extra p { margin-top: 4px; font-size: 13px; color: var(--ink-soft); }
.nl-count { flex-shrink: 0; padding: 6px 10px; border: 1px solid var(--line); background: #fff; font-size: 12px; }
.nl-caption { margin: 20px 0 10px; text-align: center; color: var(--ink-soft); font-size: 12px; }
.newsletter-frame { max-width: 832px; margin: auto; background: #fff; border: 1px solid #dce0e4; box-shadow: 0 5px 20px #18223008; }
.nl-masthead { padding: 26px 32px 16px; border-top: 10px solid var(--portal-accent); border-bottom: 2px solid var(--portal-accent); text-align: center; }
.nl-eyebrow { font-size: 10px; letter-spacing: .2em; color: var(--ink-soft); }
.nl-masthead h3 { margin: 4px 0 18px; font-family: var(--font-display); font-size: clamp(28px, 4vw, 42px); line-height: 1.1; color: var(--portal-accent); }
.nl-masthead h3 span { font-weight: 400; color: #42484d; white-space: nowrap; }
.nl-meta { display: flex; justify-content: space-between; gap: 12px; color: var(--ink-soft); font-size: 11px; }
.nl-body { padding: 20px 32px 0; }
.nl-placement { min-width: 0; margin-bottom: 20px; }
.nl-placement > h4 { display: flex; justify-content: space-between; gap: 8px; margin: 0 0 7px; color: var(--ink-soft); font-size: 12px; font-weight: 500; }
.nl-placement > h4 span { font-family: var(--font-mono); font-size: 11px; }
.nl-columns { display: grid; grid-template-columns: minmax(0, 453fr) minmax(0, 300fr); gap: 24px; }
.nl-lead { padding: 6px 0 24px; margin-bottom: 20px; border-bottom: 2px solid var(--portal-accent); }
.nl-editorial { min-width: 0; color: #68717a; }
.nl-editorial-label { font-size: 10px; letter-spacing: .12em; }
.nl-photo { background: #e5e8eb; border: 1px solid #dde1e5; }
.nl-photo--lead { display: grid; place-items: center; aspect-ratio: 453 / 250; margin: 8px 0 14px; }
.nl-photo svg { width: 70px; color: #c4cbd1; }
.nl-editorial > h4:not(.nl-news-heading) { font-size: 22px; line-height: 1.25; margin-bottom: 14px; }
.nl-lines { display: flex; flex-direction: column; gap: 9px; }
.nl-lines i { display: block; height: 7px; background: #e5e8eb; }
.nl-lines i:last-child { width: 65%; }
.nl-side { min-width: 0; }
.nl-sponsor :deep(.slot) { min-height: 165px; }
.nl-rectangle :deep(.slot) { min-height: 230px; }
.nl-section-banner :deep(.slot) { min-height: 170px; }
.nl-placement :deep(.slot-formato) { overflow-wrap: anywhere; }
.nl-placement :deep(.slot-head) { flex-wrap: wrap; }
.nl-placement :deep(.slot-foot) { flex-wrap: wrap; }
.nl-placement :deep(.slot-empresa) { font-size: 14px; }
.nl-news-heading { padding-bottom: 10px; border-bottom: 2px solid #d9dfe4; font-size: 18px; }
.nl-story { display: grid; grid-template-columns: 30% 1fr; gap: 14px; padding: 24px 0; border-bottom: 1px solid #e5e8eb; }
.nl-story .nl-photo { aspect-ratio: 1.2; align-self: start; }
.nl-story .nl-lines span { font-size: 12px; margin-bottom: 4px; }
.nl-news-block { margin-bottom: 24px; }
.nl-footer { padding: 20px 0; border-top: 3px solid var(--portal-accent); text-align: center; font-weight: 600; }
.nl-footer span { display: block; margin-top: 4px; font-size: 11px; font-weight: 400; color: var(--ink-soft); }
.nl-extra { max-width: 832px; margin: 24px auto 0; }
.nl-extra-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 12px; }
@media (max-width: 640px) {
  .newsletter-preview { padding: 12px; }
  .nl-guide { align-items: flex-start; flex-direction: column; gap: 10px; }
  .nl-body { padding: 16px 12px 0; }
  .nl-masthead { padding: 20px 12px 12px; }
  .nl-columns { grid-template-columns: minmax(0, 1fr); gap: 20px; }
  .nl-rectangle :deep(.slot) { min-height: 190px; }
  .nl-sponsor :deep(.slot) { min-height: 140px; }
  .nl-editorial > h4:not(.nl-news-heading) { font-size: 20px; }
}
</style>
