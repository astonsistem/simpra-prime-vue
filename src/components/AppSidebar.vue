<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '../services/authService.js'
import api from '@/services/http.js'

const props = defineProps({
  collapsed: Boolean,
  mobileOpen: Boolean,
})

const emit = defineEmits(['toggle-collapse', 'close-mobile'])

const route = useRoute()

const pelaporanMenus = ref([])

// Menu Items Definition
const menuItems = ref([
  {
    label: 'Dashboard',
    icon: 'pi pi-home',
    to: '/dashboard',
    exact: true,
  },
  {
    label: 'Kas',
    icon: 'pi pi-dollar',
    isOpen: false,
    children: [
      { label: 'Billing Kasir', to: '/Kas/billing-kasir' },
      { label: 'Billing 118', to: '/Kas/billing-swa' },
      { label: 'Penerimaan Lainnya', to: '/Kas/penerimaan-lainnya' },
      { label: 'Selisih Kurang Bayar/Setor', to: '/kas/kurang-bayar' },
      { label: 'Rekening Koran', to: '/Kas/rekening-koran' },
      // { label: 'Pelaporan', to: '/pendapatan/pelaporan' },
    ],
  },
  {
    label: 'Acrual',
    icon: 'pi pi-sync',
    isOpen: false,
    children: [
      { label: 'Pendapatan Pelayanan', to: '/acrual/pelayanan' },
      { label: 'Potensi Pelayanan', to: '/acrual/potensi-pelayanan' },
      { label: 'Potensi Lainnya', to: '/acrual/potensi-lainnya' },
    ],
  },
  {
    label: 'Pertanggung Jawaban',
    icon: 'pi pi-upload',
    isOpen: false,
    children: [
      { label: 'Bukti Setor', to: '/pertanggung-jawaban/bukti-setor' },
      { label: 'BKU', to: '/pertanggung-jawaban/bku' },
    ],
  },

  {
    label: 'Master',
    icon: 'pi pi-database',
    isOpen: false,
    children: [
      { label: 'Akun Pendapatan', to: '/master/akun-pendapatan' },
      { label: 'Kasir', to: '/master/kasir' },
      { label: 'Loket / Lokasi', to: '/master/loket-lokasi' },
      { label: 'Instalasi', to: '/master/instalasi' },
      { label: 'Cara Bayar', to: '/master/cara-bayar' },
      { label: 'Penjamin', to: '/master/penjamin' },
    ],
  },
  {
    label: 'Admin',
    icon: 'pi pi-cog',
    isOpen: false,
    children: [
      { label: 'Anggaran', to: '/admin/anggaran' },
      { label: 'Manajemen User', to: '/admin/user-management' },
      { label: 'Sinkronisasi', to: '/admin/sinkronisasi' },
    ],
  },
  {
    label: 'Pelaporan',
    icon: 'pi pi-file',

  },
])

const isActive = (item) => {
  if (item.exact) return route.path === item.to
  return route.path === item.to || route.path.startsWith(item.to + '/')
}

const router = useRouter()
const logout = async () => {
  try {
    await authService.logout()
    await router.push('/admin/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

onMounted(async () => {
  try {
    // GET PELAPORAN MENUS LIST
    // get pelaporan list
    const res = await api.get('/pelaporan-list')
    pelaporanMenus.value = res.data.data
    // Inject into menu

    const laporanItem = menuItems.value.find((item) => item.label === 'Laporan')
    if (laporanItem) {
      laporanItem.children = laporanMenus.value
=======
    const pelaporanItem = menuItems.value.find(item => item.label === 'Pelaporan')
    if (pelaporanItem) {
      pelaporanItem.children = pelaporanMenus.value

    }
  } catch (error) {
    console.error('Failed to load menus:', error)
  }
})
</script>

<template>
  <aside
    :class="[
      'bg-[#1B5684] dark:bg-[#123A5B] border-r border-surface-200 dark:border-surface-700',
      'transition-all duration-300 ease-in-out',
      'fixed md:relative h-screen z-20',
      'sticky top-0',
      collapsed ? 'md:w-20' : 'md:w-64',
      mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 w-0',
    ]"
  >
    <div class="h-full flex flex-col">
      <div class="p-4">
        <div class="flex justify-center items-center">
          <button @click="$emit('toggle-collapse')" class="w-full">
            <div class="flex justify-center items-center gap-3 text-[#E5E7EB] dark:text-[#E5E7EB]">
              <img src="../assets/image/logos.png" alt="Logo" class="w-24 h-24 object-contain" />
            </div>
          </button>
        </div>
      </div>

      <nav class="flex-1 p-2 space-y-1 overflow-y-auto hide-scrollbar">
        <template v-for="item in menuItems">
          <div v-if="item.children" class="space-y-1" :key="item.label">
            <button
              class="flex items-center gap-3 p-3 w-full rounded-lg transition-colors group text-white"
              :class="[
                item.children.some((child) => isActive(child)) ? 'bg-white/10' : 'hover:bg-white/5',
                collapsed ? 'justify-center' : 'justify-between',
              ]"
              @click="item.isOpen = !item.isOpen"
            >
              <div class="flex items-center gap-3 text-left">
                <i :class="item.icon" class="text-xl" />
                <span v-if="!collapsed" class="text-base font-medium">{{ item.label }}</span>
              </div>
              <i
                v-if="!collapsed"
                class="pi pi-chevron-down text-base transition-transform"
                :class="{ 'rotate-180': item.isOpen }"
              />
            </button>

            <div v-if="!collapsed && item.isOpen" class="ml-8 space-y-1">
              <router-link
                v-for="child in item.children"
                :key="child.label"
                :to="child.to"
                class="flex items-center gap-2 p-2 rounded-lg transition-colors text-white/80 hover:text-white"
                :class="[isActive(child) ? 'bg-white/10' : 'hover:bg-white/5']"
              >
                <span class="text-base">{{ child.label }}</span>
              </router-link>
            </div>
          </div>

          <router-link
            v-else
            :key="item.label + '-link'"
            :to="item.to"
            class="flex items-center gap-3 p-3 rounded-lg transition-colors group text-white"
            :class="[
              isActive(item) ? 'bg-white/10' : 'hover:bg-white/5',
              collapsed ? 'justify-center' : 'justify-center md:justify-start',
            ]"
          >
            <i :class="item.icon" class="text-xl" />
            <span v-if="!collapsed" class="text-base font-medium">{{ item.label }}</span>
          </router-link>
        </template>
      </nav>
    </div>

    <div v-if="mobileOpen" class="fixed inset-0 md:hidden z-10" @click="$emit('close-mobile')" />
  </aside>
</template>
<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
hr {
  border-color: #ffffff22;
}
</style>
