<script setup>
import { useLayout } from '../composables/useLayout'
import AppConfig from './AppConfig.vue'
import { useRoute, useRouter } from 'vue-router'
import { ref, watch } from 'vue'
import Menu from 'primevue/menu'
import { authService } from '../services/authService'

const route = useRoute()
const router = useRouter()
const breadcrumb = ref(route.meta.breadcrumb || [])
const menu = ref()
const items = ref([
  {
    label: 'Options',
    items: [
     
      {
        label: 'Profil & Ganti Password',
        icon: 'pi pi-pencil',
        command: () => {
          router.push('/profile')
        }
      },
      // { label: 'Ganti Device', icon: 'pi pi-cog' },
      {
        label: 'Logout',
        icon: 'pi pi-power-off',
        command: () => {
          authService.logout()
        },
      },
    ],
  },
])

const toggle = (event) => {
  menu.value.toggle(event)
}

function metaBreadcrumb(route) {
  const bc = route.meta?.breadcrumb
  if (typeof bc === 'function') return bc(route)
  if (Array.isArray(bc)) return bc
  return []
}

watch(route, (newRoute) => {
  breadcrumb.value = metaBreadcrumb(newRoute)
}, { immediate: true })

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
          @click="toggle"
          aria-haspopup="true"
          aria-controls="overlay_menu"
          icon="pi pi-user"
          class="bg-blue-100 text-blue-500 rounded-full w-10 h-10 flex items-center justify-center"
        />
        <Menu ref="menu" id="overlay_menu" :model="items" :popup="true">
          <template #start>
            <div class="flex flex-col items-center p-4">
              <img
                alt="logo"
                src="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
                class="w-16 h-16 rounded-full"
              />
              <span class="font-bold mt-2">Admin</span>
            </div>
          </template>
        </Menu>
        <AppConfig />
      </div>
    </div>
  </div>
</template>
