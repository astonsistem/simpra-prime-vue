<script setup>
import { ref, onMounted } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import api from '@/services/http.js'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Button from 'primevue/button'

const data = ref([])
const loading = ref(false)
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)
const filters = ref()

const fetchData = async (page = 1, size = 10) => {
  const response = await api.get(`/carabayar?page=${page}&size=${size}`)

  totalRecords.value = response.data.total ?? 1000
  return response.data.items.map((item, index) => ({
    no: (page - 1) * size + index + 1,
    id: item.carabayar_id,
    nama: item.carabayar_nama.trim(),
  }))
}

const loadData = async () => {
  try {
    loading.value = true
    const currentPage = first.value / rows.value + 1
    data.value = await fetchData(currentPage, rows.value)
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

const onPageChange = (event) => {
  first.value = event.first
  rows.value = event.rows
  loadData()
}

onMounted(() => {
  loadData()
  initFilters()
})

const handleEdit = (item) => {
  console.log('Edit item:', item)
}

const handleDelete = (item) => {
  console.log('Delete item:', item)
}

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nama: { value: null, matchMode: FilterMatchMode.CONTAINS },
  }
}

const clearFilter = () => {
  initFilters()
}
</script>

<template>
  <div class="card">
    <div class="flex justify-end mb-3">
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
      </div>
    </div>
    <DataTable
      :value="data"
      :loading="loading"
      :totalRecords="totalRecords"
      :rows="rows"
      :first="first"
      lazy
      paginator
      :rowsPerPageOptions="[5, 10, 20]"
      @page="onPageChange"
      responsiveLayout="scroll"
      class="p-datatable-sm"
      :filters="filters"
      filterDisplay="menu"
      :globalFilterFields="['id', 'nama']"
    >
      <Column field="no" header="No" style="width: 10%" />
      <Column field="id" header="ID" style="width: 40%" :showFilterMatchModes="false">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by ID" />
        </template>
      </Column>
      <Column
        field="nama"
        header="Nama Cara Bayar"
        style="width: 50%"
        :showFilterMatchModes="false"
      >
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by Nama" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
::v-deep(.p-datatable thead th) {
  background-color: #f8fafc;
  color: #000000;
}
</style>
