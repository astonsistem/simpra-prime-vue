<script setup>
import TableAkunPendapatan from '../../components/master/akunPendapatan/TableAkunPendapatan.vue'

const handleAdd = () => {
  console.log('Tambah data baru')
}
</script>

<template>
  <div
    class="bg-surface-0 dark:bg-surface-900 rounded-2xl px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full sticky top-0 z-30"
  >
    <h2 class="text-xl font-bold mb-4">Tabel Master Akun Pendapatan</h2>
    <Button
      icon="pi pi-plus"
      label="Baru"
      class="bg-primary text-white px-4 py-2 text-sm mb-4"
      @click="handleAdd"
    />
    <TableAkunPendapatan />
  </div>
</template>
