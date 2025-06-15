<script setup>
import { ref } from 'vue'
import api from '@/services/http.js'
import Instalasi from '@/components/master/instalasi/TableInstalasi.vue'

const instalasiRef = ref(null)
const syncing = ref(false)

const handleSync = async () => {
  syncing.value = true

  instalasiRef.value?.setLoading(true)

  try {
    await api.get('/instalasi/sync')

    await instalasiRef.value?.loadData()
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
    <h2 class="text-xl font-bold mb-4">Tabel Master Instalasi</h2>
    <div class="flex flex-wrap gap-2 mb-4">
      <Button
        icon="pi pi-refresh"
        label="Sinkronisasi"
        class="bg-primary text-white px-4 py-2 text-sm"
        :loading="syncing"
        :disabled="syncing"
        @click="handleSync"
      />
    </div>
    <Instalasi ref="instalasiRef" />
  </div>
</template>
