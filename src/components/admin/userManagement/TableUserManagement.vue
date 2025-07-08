<script setup>
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import api from '@/services/http.js'

const confirm = useConfirm()
const toast = useToast()

const users = ref([])
const loading = ref(true)
const totalRecords = ref(0)
const lazyParams = ref({
  page: 1,
  size: 10,
})

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await api.get('/auth/users', {
      params: {
        page: lazyParams.value.page,
        size: lazyParams.value.size,
      },
    })
    users.value = response.data.items
    totalRecords.value = response.data.total
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users', life: 3000 })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsers()
})

const onPage = (event) => {
  lazyParams.value.page = event.page + 1
  loadUsers()
}

const confirmDelete = (user) => {
  confirm.require({
    message: 'Are you sure you want to delete this user?',
    header: 'Delete Confirmation',
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await api.delete(`/auth/user/${user.id}`)
        toast.add({ severity: 'success', summary: 'Confirmed', detail: 'User deleted', life: 3000 })
        loadUsers()
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete user',
          life: 3000,
        })
      }
    },
  })
}
</script>

<template>
  <div class="card">
    <DataTable
      :value="users"
      :paginator="true"
      :rows="10"
      dataKey="id"
      :loading="loading"
      @page="onPage($event)"
      :totalRecords="totalRecords"
      lazy
    >
      <template #header>
        <div class="flex justify-between items-center">
          <h5 class="m-0">User Management</h5>
          <Button
            label="Add User"
            icon="pi pi-plus"
            class="p-button-success"
            @click="$emit('add')"
          />
        </div>
      </template>
      <Column field="nama" header="Nama" :sortable="true"></Column>
      <Column field="nip" header="NIP" :sortable="true"></Column>
      <Column field="username" header="Username" :sortable="true"></Column>
      <Column field="email" header="Email" :sortable="true"></Column>
      <Column field="telp" header="No Telp"></Column>
      <Column field="jabatan" header="Jabatan" :sortable="true"></Column>
      <Column field="role" header="Role" :sortable="true"></Column>
      <Column header="Actions">
        <template #body="slotProps">
          <Button
            icon="pi pi-pencil"
            class="p-button-rounded p-button-success mr-2"
            @click="$emit('edit', slotProps.data)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-warning"
            @click="confirmDelete(slotProps.data)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
