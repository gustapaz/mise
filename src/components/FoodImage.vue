<script setup lang="ts">
withDefaults(defineProps<{ name: string; alt: string; hero?: boolean }>(), { hero: false });
const base = import.meta.env.BASE_URL;
</script>
<template>
  <img
    :src="`${base}images/${name}-600.webp`"
    :srcset="`${base}images/${name}-400.webp 400w, ${base}images/${name}-600.webp 600w, ${base}images/${name}-1200.webp 1200w`"
    sizes="(max-width: 650px) 90vw, (max-width: 1100px) 45vw, 30vw"
    :alt="alt"
    width="1200"
    height="900"
    :loading="hero ? 'eager' : 'lazy'"
    :fetchpriority="hero ? 'high' : 'auto'"
    decoding="async"
  />
</template>
