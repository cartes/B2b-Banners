<script setup>
defineProps({
  domain: { type: String, required: true },
})
</script>

<template>
  <div class="phone">
    <div class="phone-bar">
      <span class="phone-notch" />
      <span class="phone-url">{{ domain }}</span>
    </div>
    <div class="phone-screen">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* 375px de pantalla: los avisos móviles (350×50, 300×250, 300×100) van a
   tamaño real, sin escalar. */
.phone {
  width: 399px;
  max-width: 100%;
  padding: 0 12px 14px;
  border: 1px solid var(--line-strong);
  border-radius: 28px;
  background: var(--paper-raised);
}

.phone-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 0 8px;
}

.phone-notch {
  width: 64px;
  height: 6px;
  border-radius: 3px;
  background: var(--line-strong);
}

.phone-url {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-faint);
}

.phone-screen {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--line);
}
</style>
