<script setup>
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { PORTALS } from '@/config/portals'
import { useCatalog } from '@/composables/useCatalog'

const route = useRoute()
const { status, isRefreshing, lastUpdated, formattedLastUpdated, lastUpdatedTitle, refresh, error } = useCatalog({
  autoLoad: false,
})
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

      <div class="topbar-sync">
        <div v-if="lastUpdated" class="sync-info" :title="lastUpdatedTitle">
          <span
            class="sync-dot"
            :class="{
              'is-refreshing': isRefreshing,
              'is-error': !!error && status === 'ready',
              'is-ready': !error && !isRefreshing && status === 'ready',
            }"
          />
          <span class="sync-text">
            <template v-if="isRefreshing">Actualizando…</template>
            <template v-else>Consultado {{ formattedLastUpdated }}</template>
          </span>
        </div>

        <button
          type="button"
          class="sync-btn"
          :disabled="isRefreshing || status === 'loading'"
          :title="isRefreshing ? 'Actualizando catálogo…' : 'Actualizar datos de ventas ahora'"
          aria-label="Actualizar catálogo de ventas"
          @click="refresh"
        >
          <svg
            class="sync-icon"
            :class="{ 'is-spinning': isRefreshing || status === 'loading' }"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span class="sync-btn-label">{{ isRefreshing ? 'Actualizando…' : 'Actualizar' }}</span>
        </button>
      </div>
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

.topbar-sync {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-4);
  margin-left: auto;
}

.sync-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-soft);
  user-select: none;
  cursor: default;
}

.sync-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ink-faint);
  flex-shrink: 0;
  transition: background-color 150ms ease, transform 150ms ease;
}

.sync-dot.is-ready {
  background: #16a34a;
  box-shadow: 0 0 6px rgba(22, 163, 74, 0.4);
}

.sync-dot.is-refreshing {
  background: #2563eb;
  animation: pulse-sync 1s infinite alternate ease-in-out;
}

.sync-dot.is-error {
  background: #dc2626;
}

@keyframes pulse-sync {
  from {
    transform: scale(0.85);
    opacity: 0.6;
  }
  to {
    transform: scale(1.25);
    opacity: 1;
  }
}

.sync-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--line-strong);
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--radius);
  transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
}

.sync-btn:hover:not(:disabled) {
  background: var(--paper-raised);
  border-color: var(--ink-soft);
}

.sync-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sync-icon.is-spinning {
  animation: spin 800ms linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.content {
  flex: 1;
  min-width: 0;
}

@media (max-width: 768px) {
  .sync-text {
    display: none;
  }
  .sync-btn-label {
    display: none;
  }
  .sync-btn {
    padding: var(--space-2);
  }
  .topbar-sync {
    padding: 0 var(--space-2);
  }
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
