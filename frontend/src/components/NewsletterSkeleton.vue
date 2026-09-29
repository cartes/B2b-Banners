<script setup>
import { computed } from 'vue'
import { classifyNewsletterFamily } from '@/config/zones'
import { ordenarUbicacion } from '@/composables/useCatalog'
import SlotCard from './SlotCard.vue'

const props = defineProps({
  slots: { type: Array, required: true },
  matchIds: { type: Object, default: null },
})

function isDimmed(slot) {
  return props.matchIds ? !props.matchIds.has(slot.id) : false
}

const groups = computed(() => {
  const byFamily = { sponsor: [], f: [], k: [], l: [], other: [] }
  for (const slot of props.slots) {
    byFamily[classifyNewsletterFamily(slot.formato)].push(slot)
  }
  for (const key of Object.keys(byFamily)) {
    byFamily[key].sort((a, b) => ordenarUbicacion(a.ubicacion, b.ubicacion))
  }

  const kGroups = byFamily.k.map((k) => ({ k, ls: [] }))
  if (kGroups.length) {
    const perGroup = Math.ceil(byFamily.l.length / kGroups.length) || 1
    byFamily.l.forEach((l, i) => {
      const groupIndex = Math.min(Math.floor(i / perGroup), kGroups.length - 1)
      kGroups[groupIndex].ls.push(l)
    })
  }

  return {
    fMain: byFamily.f[0] ?? null,
    fRest: byFamily.f.slice(1),
    sponsors: byFamily.sponsor,
    kGroups,
    lOrphans: kGroups.length ? [] : byFamily.l,
    other: byFamily.other,
  }
})
</script>

<template>
  <div class="newsletter-frame">
    <div v-if="groups.fMain || groups.sponsors.length" class="nl-header">
      <SlotCard v-if="groups.fMain" class="nl-f" :slot="groups.fMain" compact :dimmed="isDimmed(groups.fMain)" />
      <div v-if="groups.sponsors.length" class="nl-sponsors">
        <SlotCard v-for="s in groups.sponsors" :key="s.id" :slot="s" compact :dimmed="isDimmed(s)" />
      </div>
    </div>

    <SlotCard v-for="s in groups.fRest" :key="s.id" :slot="s" compact :dimmed="isDimmed(s)" />

    <div v-for="group in groups.kGroups" :key="group.k.id" class="nl-section">
      <SlotCard :slot="group.k" compact :dimmed="isDimmed(group.k)" />
      <div v-if="group.ls.length" class="nl-l-grid">
        <SlotCard v-for="l in group.ls" :key="l.id" :slot="l" compact :dimmed="isDimmed(l)" />
      </div>
    </div>

    <div v-if="groups.lOrphans.length" class="nl-l-grid">
      <SlotCard v-for="l in groups.lOrphans" :key="l.id" :slot="l" compact :dimmed="isDimmed(l)" />
    </div>

    <div v-if="groups.other.length" class="nl-l-grid">
      <SlotCard v-for="s in groups.other" :key="s.id" :slot="s" compact :dimmed="isDimmed(s)" />
    </div>
  </div>
</template>

<style scoped>
.newsletter-frame {
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  border: 1px solid var(--line-strong);
  background: var(--paper);
  padding: var(--space-4);
}

.nl-header {
  display: flex;
  gap: var(--space-2);
}

.nl-f {
  flex: 1;
  min-width: 0;
}

.nl-sponsors {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 84px;
  flex-shrink: 0;
}

.nl-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.nl-l-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);
}
</style>
