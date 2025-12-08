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
    <!-- Header line: Breadcrumb + Back button -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-[#17316E]">
        {{ breadcrumb.join(' - ') }}
      </h2>
      <RouterLink
        to="/pelaporan"
        class="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium"
      >
        ← Kembali
      </RouterLink>
    </div>
    <p class="text-s">Kelola Data {{ breadcrumb.join(' - ') }}</p>
  </div>
  <Pelaporan />
</template>
