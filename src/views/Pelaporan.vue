<script setup>
import Pelaporan from '@/components/Pelaporan.vue'
import { useRoute } from 'vue-router'
import { ref, watch } from 'vue'

const route = useRoute()
const breadcrumb = ref(route.meta.breadcrumb || [])

function metaBreadcrumb(route) {
  const bc = route.meta?.breadcrumb
  if (typeof bc === 'function') return bc(route)
  if (Array.isArray(bc)) return bc
  return []
}

watch(route, (newRoute) => {
  breadcrumb.value = metaBreadcrumb(newRoute)
}, { immediate: true })
</script>

<template>
  <div class="mb-3 p-4">
    <h2 class="text-2xl font-bold text-[#17316E]">{{ breadcrumb.join(' - ') }}</h2>
    <p class="text-s">Kelola Data {{ breadcrumb.join(' - ') }}</p>
  </div>
  <Pelaporan />
</template>
