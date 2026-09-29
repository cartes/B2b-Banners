import { shallowRef } from 'vue'

// Un único globo para toda la vista: cada aviso (AdSlot, SlotCard) avisa
// al entrar/salir y AdTooltip se posiciona sobre el elemento. Se guarda el
// elemento y no su rect porque los avisos de escritorio viven dentro de
// un contenedor escalado; el rect se lee al momento de posicionar.
const active = shallowRef(null) // { slot, el, note } | null

export function useAdTooltip() {
  function show(slot, el, note = '') {
    active.value = { slot, el, note }
  }

  function hide(slot) {
    if (!slot || active.value?.slot === slot) active.value = null
  }

  return { active, show, hide }
}
