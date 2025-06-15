<script setup>
import { ref } from 'vue'
import api from '@/services/http.js'
import Kasir from '@/components/master/kasir/TableKasir.vue'

const kasirRef = ref(null)
const syncing = ref(false)
const loading = ref(false)

const handleSync = async () => {
  syncing.value = true

  // 👉 Mulai loading table sebelum sync
  kasirRef.value?.setLoading(true)

  try {
    await api.get('/kasir/sync')

    // Kemudian load ulang data
    await kasirRef.value?.loadData()
  } catch (error) {
    console.error('Gagal sinkronisasi:', error)
  } finally {
    syncing.value = false
  }
}
</script>

<template>
  <div
    class="bg-surface-0 dark:bg-surface-900 rounded-2xl px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30"
  >
    <h2 class="text-xl font-bold mb-4">Tabel Master Kasir</h2>
    <Button
      icon="pi pi-refresh"
      label="Sinkronisasi"
      class="bg-primary text-white px-4 py-2 text-sm mb-4"
      :loading="syncing"
      :disabled="syncing"
      @click="handleSync"
    />
    <Kasir ref="kasirRef" />
  </div>
</template>
