<script setup>
import { ref, onMounted, defineExpose, watch } from 'vue'
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
const search = ref('')
const filters = ref()

const fetchData = async (page = 1, size = 10, keyword = '') => {
  const response = await api.get(
    `/penjamin?page=${page}&size=${size}&penjamin_nama=${encodeURIComponent(keyword)}`
  )

  totalRecords.value = response.data.total ?? 1000
  return response.data.items.map((item, index) => ({
    no: (page - 1) * size + index + 1,
    id_cara_bayar: item.carabayar_id,
    id_penjamin: item.penjamin_id,
    nama_penjamin: item.penjamin_nama.trim(),
  }))
}

const loadData = async () => {
  try {
    loading.value = true
    const currentPage = first.value / rows.value + 1
    data.value = await fetchData(currentPage, rows.value, search.value)
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

const handleSearch = () => {
  first.value = 0
  loadData()
}

onMounted(() => {
  loadData()
  initFilters()
})

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id_cara_bayar: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id_penjamin: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nama_penjamin: { value: null, matchMode: FilterMatchMode.CONTAINS },
  }
}

const clearFilter = () => {
  initFilters()
}

defineExpose({ loadData, setLoading: (val) => (loading.value = val) })
</script>

<template>
  <div class="card">
    <div class="mb-4 flex items-center gap-2 justify-end">
      <input
        v-model="search"
        @keyup.enter="handleSearch"
        type="text"
        placeholder="Cari nama penjamin..."
        class="border px-3 py-2 rounded text-sm w-64"
      />
      <Button
        icon="pi pi-search"
        class="bg-primary text-white px-3 py-2 text-sm"
        @click="handleSearch"
        label="Cari"
      />
    </div>

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
      paginator
      lazy
      :rowsPerPageOptions="[5, 10, 20]"
      @page="onPageChange"
      responsiveLayout="scroll"
      class="p-datatable-sm"
      :filters="filters"
      filterDisplay="menu"
      :globalFilterFields="['id_cara_bayar', 'id_penjamin', 'nama_penjamin']"
    >
      <Column field="no" header="No" style="width: 10%" />
      <Column
        field="id_cara_bayar"
        header="ID Cara Bayar"
        style="width: 25%"
        :showFilterMatchModes="false"
      >
        <template #filter="{ filterModel }">
          <InputText
            v-model="filterModel.value"
            type="text"
            placeholder="Search by ID Cara Bayar"
          />
        </template>
      </Column>
      <Column
        field="id_penjamin"
        header="ID Penjamin"
        style="width: 25%"
        :showFilterMatchModes="false"
      >
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by ID Penjamin" />
        </template>
      </Column>
      <Column
        field="nama_penjamin"
        header="Nama Penjamin"
        style="width: 40%"
        :showFilterMatchModes="false"
      >
        <template #filter="{ filterModel }">
          <InputText
            v-model="filterModel.value"
            type="text"
            placeholder="Search by Nama Penjamin"
          />
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
