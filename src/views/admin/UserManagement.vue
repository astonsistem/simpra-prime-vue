<script setup>
import { ref } from 'vue'
import TableUserManagement from '@/components/admin/userManagement/TableUserManagement.vue'
import ModalUserManagement from '@/components/admin/userManagement/ModalUserManagement.vue'

const showModal = ref(false)
const selectedUser = ref(null)
const isEdit = ref(false)

function openEdit(user) {
  selectedUser.value = user
  isEdit.value = true
  showModal.value = true
}
function openAdd() {
  selectedUser.value = null
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
    <h2 class="text-xl font-bold">User Management</h2>
    <TableUserManagement @edit="openEdit" @add="openAdd" />
    <ModalUserManagement
      v-if="showModal"
      :user="selectedUser"
      :is-edit="isEdit"
      @close="closeModal"
      @saved="refreshTable"
    />
  </div>
</template>
