<script setup>
import { ref, onMounted } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import api from '@/services/http.js'

const confirm = useConfirm()
const toast = useToast()

const users = ref([])
const loading = ref(true)
const totalRecords = ref(0)
const filters = ref()
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
  initFilters()
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

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nama: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nip: { value: null, matchMode: FilterMatchMode.CONTAINS },
    username: { value: null, matchMode: FilterMatchMode.CONTAINS },
    email: { value: null, matchMode: FilterMatchMode.CONTAINS },
    telp: { value: null, matchMode: FilterMatchMode.CONTAINS },
    jabatan: { value: null, matchMode: FilterMatchMode.CONTAINS },
    role: { value: null, matchMode: FilterMatchMode.CONTAINS },
  }
}

const clearFilter = () => {
  initFilters()
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
      :filters="filters"
      filterDisplay="menu"
      :globalFilterFields="['nama', 'nip', 'username', 'email', 'telp', 'jabatan', 'role']"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <h5 class="m-0">User Management</h5>
          <div class="flex gap-2">
            <Button
              type="button"
              icon="pi pi-filter-slash"
              label="Clear"
              outlined
              @click="clearFilter()"
            />
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
            </IconField>
            <Button
              label="Add User"
              icon="pi pi-plus"
              class="p-button-success"
              @click="$emit('add')"
            />
          </div>
        </div>
      </template>
      <Column field="nama" header="Nama" :sortable="true" :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by Nama" />
        </template>
      </Column>
      <Column field="nip" header="NIP" :sortable="true" :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by NIP" />
        </template>
      </Column>
      <Column field="username" header="Username" :sortable="true" :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by Username" />
        </template>
      </Column>
      <Column field="email" header="Email" :sortable="true" :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by Email" />
        </template>
      </Column>
      <Column field="telp" header="No Telp" :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by No Telp" />
        </template>
      </Column>
      <Column field="jabatan" header="Jabatan" :sortable="true" :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by Jabatan" />
        </template>
      </Column>
      <Column field="role" header="Role" :sortable="true" :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by Role" />
        </template>
      </Column>
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
