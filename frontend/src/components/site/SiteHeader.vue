<script setup>
// Cabecera común de los tres portales: franja blanca con el leaderboard,
// banda gris con botones / logo / redes y barra de menú en el color del
// portal. En móvil el leaderboard va sobre la cabecera y el menú se
// reduce a hamburguesa.
defineProps({
  portal: { type: Object, required: true },
  mobile: { type: Boolean, default: false },
})

const SOCIALS = ['in', 'f', 'ig', 'x', 'yt']
</script>

<template>
  <header class="sh" :class="{ 'sh--mobile': mobile }">
    <div class="sh-top">
      <slot name="leaderboard" />
    </div>

    <div class="sh-band">
      <div v-if="!mobile" class="sh-pills">
        <span class="sh-pill is-filled">Tendencias</span>
        <span class="sh-pill">Suscríbase</span>
      </div>
      <span class="sh-logo">{{ portal.logoText }}</span>
      <div v-if="!mobile" class="sh-socials">
        <span v-for="s in SOCIALS" :key="s" class="sh-social">{{ s }}</span>
      </div>
      <span v-else class="sh-burger" aria-hidden="true"><i /><i /><i /></span>
    </div>

    <nav v-if="!mobile" class="sh-nav">
      <span v-for="(item, i) in portal.nav" :key="item" class="sh-nav-item">
        {{ item }}<span v-if="i < 3 || i === portal.nav.length - 1" class="sh-plus">+</span>
      </span>
      <span class="sh-search" aria-hidden="true" />
    </nav>
    <div v-else class="sh-nav sh-nav--thin" />
  </header>
</template>

<style scoped>
.sh-top {
  display: flex;
  justify-content: center;
  padding: 15px 0;
  background: var(--site-bg);
  border-top: 4px solid var(--portal-accent);
}

.sh-band {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 10px 180px;
  background: var(--site-band);
}

.sh-pills {
  display: flex;
  gap: 10px;
}

.sh-pill {
  font-size: 11px;
  font-weight: 500;
  padding: 4px 14px;
  border-radius: 999px;
  border: 2px solid var(--portal-accent-dark);
  color: var(--portal-accent-dark);
  background: #fff;
}

.sh-pill.is-filled {
  background: var(--portal-accent-dark);
  color: #fff;
}

.sh-logo {
  display: grid;
  place-items: center;
  min-width: 66px;
  height: 70px;
  padding: 0 12px;
  background: var(--portal-accent);
  color: #fff;
  font-weight: 800;
  font-size: 22px;
  letter-spacing: -0.01em;
}

.sh-socials {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.sh-social {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: var(--portal-accent-dark);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
}

.sh-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 38px;
  padding: 8px 0;
  background: var(--portal-accent);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
}

.sh-nav-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.sh-plus {
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border: 1.5px solid #fff;
  border-radius: 50%;
  font-size: 12px;
  line-height: 1;
}

.sh-search {
  width: 12px;
  height: 12px;
  border: 2px solid #fff;
  border-radius: 50%;
}

/* Móvil */
.sh--mobile .sh-top {
  padding: 8px 0;
}

.sh--mobile .sh-band {
  grid-template-columns: 1fr auto;
  padding: 8px 12px;
}

.sh--mobile .sh-logo {
  justify-self: start;
  height: 44px;
  min-width: 48px;
  font-size: 16px;
}

.sh-burger {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sh-burger i {
  display: block;
  width: 22px;
  height: 3px;
  background: var(--portal-accent-dark);
}

.sh-nav--thin {
  padding: 0;
  height: 6px;
}
</style>
