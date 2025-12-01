<script setup>
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import api from '@/services/http.js'

import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const filters = ref()
const data = ref([])
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)
const loading = ref(false)

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
    const response = await api.get('/instalasi', { params: query })
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

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    instalasi_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    instalasi_nama: { value: null, matchMode: FilterMatchMode.CONTAINS },
  }
}
initFilters()

const onFilter = (event) => {
  filters.value = event.filters
  first.value = 0
  loadData(1, rows.value)
}
const clearTableFilters = () => {
  initFilters()
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

const syncData = async () => {
  loading.value = true
  try {

    const res = await api.get('/instalasi/sync')

    if (res.data.count == 0) {
      toast.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: 'Tidak ada data yang disinkronisasi',
        life: 3000,
      })
    }else {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: `${res.data.count} Data Instalasi berhasil disinkronisasi`,
        life: 3000,
      })
    }

  } catch (error) {
    console.error('Gagal sinkronisasi data:', error)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal sinkronisasi Data Instalasi. Silakan coba lagi.',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-4">
    <div
      class="bg-surface-0 dark:bg-surface-900 rounded-2xl my-6 px-6 py-4 md:px-6 md:py-3 border-b md:border border-surface-200 dark:border-surface-700 w-full"
    >
      <div class="flex justify-between items-center mb-2">
        <Button label="Clear Column Filters" icon="pi pi-filter-slash" outlined @click="clearTableFilters" />
        <div class="flex gap-2">
          <Button label="Sinkronisasi Data" icon="pi pi-sync" class="p-button-success"  @click="syncData" />
          <InputText v-model="filters['global'].value" placeholder="Search Instalasi..." />
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
        @filter="onFilter"
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
        <Column 
          field="instalasi_id" 
          header="ID" 
          :showFilterMatchModes="false" 
        >
            <template #body="{ data }">
                {{ data.instalasi_id }}
            </template>
            <template #filter="{ filterModel }">
              <InputText v-model="filterModel.value" type="text" placeholder="Search Instalasi ID" />
            </template>
        </Column>
        <Column 
          field="instalasi_nama" 
          header="Nama" 
          :showFilterMatchModes="false" 
          style="min-width: 12rem"
        >
            <template #body="{ data }">
                {{ data.instalasi_nama }}
            </template>
            <template #filter="{ filterModel }">
              <InputText v-model="filterModel.value" type="text" placeholder="Search Instalasi Nama" />
            </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<style scoped>
.p-datatable .p-datatable-thead > tr > th {
  white-space: nowrap;
  text-align: center;
  padding: 0.5rem 0.75rem;
}
</style>
