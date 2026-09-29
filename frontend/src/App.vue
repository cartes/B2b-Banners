<script setup>
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { PORTALS } from '@/config/portals'

const route = useRoute()
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark">B2B</span>
        <span class="brand-name">Avisos&nbsp;Web</span>
      </div>

      <nav class="portal-nav" aria-label="Portales">
        <RouterLink
          v-for="portal in PORTALS"
          :key="portal.id"
          :to="`/${portal.id}`"
          class="portal-tab"
          :class="{ 'is-active': route.params.portalId === portal.id }"
          :style="{ '--tab-accent': portal.accent }"
        >
          <span class="portal-tab-name">{{ portal.name }}</span>
          <span class="portal-tab-domain">{{ portal.domain }}</span>
        </RouterLink>
      </nav>
    </header>

    <main class="content">
      <RouterView :key="route.params.portalId" />
    </main>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--line);
  background: var(--paper-raised);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-5);
  border-right: 1px solid var(--line);
}

.brand-mark {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 0.02em;
  background: var(--ink);
  color: var(--paper);
  padding: 2px 6px;
}

.brand-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 19px;
  letter-spacing: 0.01em;
}

.portal-nav {
  display: flex;
  flex: 1;
  min-width: 0;
}

.portal-tab {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: var(--space-3) var(--space-5);
  text-decoration: none;
  color: var(--ink-soft);
  border-right: 1px solid var(--line);
  border-bottom: 3px solid transparent;
  transition: border-color 120ms ease, color 120ms ease;
}

.portal-tab:hover {
  color: var(--ink);
}

.portal-tab.is-active {
  color: var(--ink);
  border-bottom-color: var(--tab-accent);
}

.portal-tab-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 18px;
  line-height: 1.1;
}

.portal-tab-domain {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-faint);
}

.content {
  flex: 1;
  min-width: 0;
}

@media (max-width: 640px) {
  .brand {
    padding: 0 var(--space-3);
  }
  .portal-tab {
    padding: var(--space-2) var(--space-3);
    flex: 1;
  }
}
</style>
