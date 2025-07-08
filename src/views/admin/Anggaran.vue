<script setup>
import { ref } from 'vue'
import TableAnggaran from '@/components/admin/anggaran/TableAnggaran.vue'
import ModalAnggaran from '@/components/admin/anggaran/ModalAnggaran.vue'

const showModal = ref(false)
const selectedAnggaran = ref(null)
const isEdit = ref(false)

function openEdit(anggaran) {
  selectedAnggaran.value = anggaran
  isEdit.value = true
  showModal.value = true
}
function openAdd() {
  selectedAnggaran.value = null
  isEdit.value = false
  showModal.value = true
}
function closeModal() {
  showModal.value = false
}
function refreshTable() {}
</script>

<template>
  <div class="flex flex-col gap-4">
    <h2 class="text-xl font-bold">Anggaran</h2>
    <TableAnggaran @edit="openEdit" @add="openAdd" />
    <ModalAnggaran
      v-if="showModal"
      :anggaran="selectedAnggaran"
      :is-edit="isEdit"
      @close="closeModal"
      @saved="refreshTable"
    />
  </div>
</template>
