<script setup>
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import ModalManajemenUser from '@/components/admin/manajemenUser/ModalManajemenUser.vue'
import api from '@/services/http.js'

import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import SplitButton from 'primevue/splitbutton'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'

const roleOptions = ref([
  { label: 'ADMIN', value: 'admin' },
  { label: 'BENDAHARA', value: 'bendahara' },
  { label: 'BIASA', value: 'biasa' },
])
const toast = useToast()
const filters = ref()
const data = ref([])
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)
const loading = ref(false)
const selectedItem = ref(null)
const showModal = ref(false)
const sortField = ref(null)
const sortOrder = ref(null)

const buildQuery = (page = 1, pageSize = rows.value) => {
  const q = {
    page,
    size: pageSize,
  }

  if (filters.value) {
    Object.keys(filters.value).forEach((key) => {
      if (filters.value[key].value !== null && filters.value[key].value !== undefined) {
        q[key] = filters.value[key].value
      }
    })
  }

  if (sortField.value) {
    q.sortField = sortField.value
    q.sortOrder = sortOrder.value === 1 ? 'asc' : 'desc'
  }

  return q
}
const loadData = async (page = 1, pageSize = rows.value) => {
  loading.value = true
  try {
    const query = buildQuery(page, pageSize)
    if (!query) {
      loading.value = false
      return
    }
    const response = await api.get('/auth/users', { params: query })
    if (response.data && response.data.items) {
      data.value = response.data.items.map((item, index) => ({
        ...item,
        no: (page - 1) * pageSize + index + 1,
      }))
      totalRecords.value = response.data.total ?? 0
      if (pageSize === totalRecords.value && pageSize > 100) {
        rows.value = 1000
      }
    }
  } catch (error) {
    console.error('Gagal memuat data:', error)
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat data', life: 3000 })
  } finally {
    loading.value = false
  }
}
const onPageChange = (event) => {
  first.value = event.first
  rows.value = event.rows
  if (event.rows === 1000) {
    loadData(1, totalRecords.value)
  } else {
    const page = event.page + 1
    loadData(page, event.rows)
  }
}

const searchData = async () => {
  first.value = 0
  loadData(1, rows.value)
}

const handleAdd = () => {
  selectedItem.value = null
  showModal.value = true
}
const handleEdit = async (item) => {
  try {
    loading.value = true
    const response = await api.get(`/auth/users/${item.id}`)
    if (response.data) {
      selectedItem.value = { ...response.data }
      showModal.value = true
    } else {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal memuat detail data',
        life: 3000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal memuat detail data',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}
const handleDelete = (item) => {
  toast.add({
      severity: 'warn',
      summary: 'Konfirmasi',
      detail: 'Apakah Anda yakin ingin menghapus data ini?',
      group: 'confirm',
      data: {
          url: `/auth/user/${item.id}`,
          title: 'hapus'
      }
  })
}
const onConfirmAction = async (event) => {
    toast.removeGroup('confirm')
    const { url, title } = event.data
    try {
        if (title === 'hapus') {
            await api.delete(url)
        } else {
            await api.get(url)
        }
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: `Aksi ${title} berhasil dijalankan`,
            life: 3000,
        })
        first.value = 0
        loadData(1, rows.value)
    } catch (error) {
        console.error(`Gagal ${title}:`, error)
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: `Aksi ${title} gagal. Silakan coba lagi.`,
            life: 3000,
        })
    }
}
const onReject = () => {
    toast.removeGroup('confirm')
}
const handleSaved = () => {
  showModal.value = false
  first.value = 0
  loadData(1, rows.value)
}

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  }
}
initFilters()

const onSort = (event) => {
  sortField.value = event.sortField
  sortOrder.value = event.sortOrder
  first.value = 0
  loadData(1, rows.value)
}

let debounceTimer
const debounce = (callback, delay = 400) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(callback, delay)
}

onMounted(() => {
  loadData()
  initFilters()
})

watch(
  () => filters.value.global.value,
  () => {
    debounce(searchData, 300)
  }
)
</script>

<template>
  <div class="p-4">
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full"
    >
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-xl font-semibold text-[#17316E]">Manajemen User</h3>
        <div class="flex gap-2">
          <Button label="Tambah Data" icon="pi pi-plus" class="p-button-success" @click="handleAdd" />
          <InputText v-model="filters['global'].value" placeholder="Search User..." />
        </div>
      </div>
      <DataTable
        :filters="filters"
        :value="data"
        :loading="loading"
        responsiveLayout="scroll"
        paginator
        lazy
        :totalRecords="totalRecords"
        :rows="rows"
        :first="first"
        :rowsPerPageOptions="[5, 10, 20, 50, 100, 1000]"
        @page="onPageChange"
        @sort="onSort"
        sortMode="single"
        dataKey="id"
        filterDisplay="menu"
        class="p-datatable-sm"
        :rowStyle="rowStyle"
      >
        <template #header>
        </template>
        <Column field="no" header="No" style="width: 5%" />
        <Column header="Action" style="width: 10%">
          <template #body="slotProps">
            <SplitButton
              label="Action" 
              icon="pi pi-ellipsis-v"
              size="small"
              severity="secondary"
              :model="[
                { label: 'Ubah', icon: 'pi pi-pencil', command: () => handleEdit(slotProps.data) },
                { label: 'Hapus', icon: 'pi pi-trash', command: () => handleDelete(slotProps.data) },
              ]"
            />
          </template>
        </Column>
        <Column 
          field="nama" 
          header="Nama" 
          sortable
        >
            <template #body="{ data }">
                {{ data.nama }}
            </template>
        </Column>
        <Column 
          field="nip" 
          header="NIP" 
          sortable
        >
            <template #body="{ data }">
                {{ data.nip }}
            </template>
        </Column>
        <Column 
          field="username" 
          header="Username" 
          sortable
        >
            <template #body="{ data }">
                {{ data.username }}
            </template>
        </Column>
        <Column 
          field="email" 
          header="Email" 
          sortable
        >
            <template #body="{ data }">
                {{ data.email }}
            </template>
        </Column>
        <Column 
          field="no_telp" 
          header="No Telp" 
          sortable
        >
            <template #body="{ data }">
                {{ data.no_telp }}
            </template>
        </Column>
        <Column 
          field="jabatan" 
          header="Jabatan" 
          sortable
        >
            <template #body="{ data }">
                {{ data.jabatan }}
            </template>
        </Column>
        <Column 
          field="role" 
          header="Role" 
          sortable
        >
            <template #body="{ data }">
                {{ data.role }}
            </template>
        </Column>
      </DataTable>
    </div>
    <ModalManajemenUser 
      v-model="showModal" 
      :item="selectedItem" 
      :options="{
        role: roleOptions,
      }"
      @saved="handleSaved" 
    />
    <Toast />
    <Toast position="center" group="confirm">
      <template #message="slotProps">
        <div class="flex flex-col items-center" style="flex: 1">
          <div class="text-center">
            <i class="pi pi-exclamation-triangle" style="font-size: 3rem"></i>
            <h4>{{ slotProps.message.summary }}</h4>
            <p>{{ slotProps.message.detail }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-4">
            <Button label="Tidak" @click="onReject()" />
            <Button label="Ya" @click="onConfirmAction(slotProps.message)" />
          </div>
        </div>
      </template>
    </Toast>
  </div>
</template>

<style scoped>
.p-datatable .p-datatable-thead > tr > th {
  white-space: nowrap;
  text-align: center;
  padding: 0.5rem 0.75rem;
}
</style>
