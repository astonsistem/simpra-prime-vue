<script setup>
import { ref } from 'vue'
import TableSinkronisasi from '@/components/admin/sinkronisasi/TableSinkronisasi.vue'
import ModalSinkronisasi from '@/components/admin/sinkronisasi/ModalSinkronisasi.vue'

const showModal = ref(false)
const selectedSync = ref(null)
const isEdit = ref(false)

function openEdit(sync) {
  selectedSync.value = sync
  isEdit.value = true
  showModal.value = true
}
function openAdd() {
  selectedSync.value = null
  isEdit.value = false
  showModal.value = true
}
function closeModal() {
  showModal.value = false
}
function refreshTable() {
  // emit event or use store to refresh table if needed
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <h2 class="text-xl font-bold">Sinkronisasi</h2>
    <TableSinkronisasi @edit="openEdit" @add="openAdd" />
    <ModalSinkronisasi
      v-if="showModal"
      :sync="selectedSync"
      :is-edit="isEdit"
      @close="closeModal"
      @saved="refreshTable"
    />
  </div>
</template>
