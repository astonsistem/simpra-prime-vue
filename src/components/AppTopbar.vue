<script setup>
import { useLayout } from '../composables/useLayout'
import AppConfig from './AppConfig.vue'
import { useRoute } from 'vue-router'
import { ref, watch } from 'vue'

const route = useRoute()
const breadcrumb = ref(route.meta.breadcrumb || [])

watch(route, (newRoute) => {
  breadcrumb.value = newRoute.meta.breadcrumb || []
})

const { isDarkMode, toggleDarkMode } = useLayout()
defineEmits(['toggle-mobile'])
</script>

<template>
  <div
    class="bg-white dark:bg-surface-900 px-6 py-4 border-b border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30"
  >
    <div class="flex justify-between items-center">
      <div class="flex flex-col">
        <h1 class="text-2xl font-bold text-[#17316E]">SIMPRA – RSUD Soetomo</h1>
        <nav class="text-sm text-[#17316E]">
          {{ breadcrumb.join(' › ') }}
        </nav>
      </div>

      <div class="flex items-center">
        <Button
          v-styleclass="{
            selector: '@next',
            enterFromClass: 'hidden',
            enterActiveClass: 'animate-scalein',
            leaveToClass: 'hidden',
            leaveActiveClass: 'animate-fadeout',
            hideOnOutsideClick: true,
          }"
          icon="pi pi-user"
          class="bg-blue-100 text-blue-500 rounded-full w-10 h-10 flex items-center justify-center"
          aria-label="User"
        />
        <AppConfig />
      </div>
    </div>
  </div>
</template>
