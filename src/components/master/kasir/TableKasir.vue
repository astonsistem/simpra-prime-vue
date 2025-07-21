<script setup>
import { ref, onMounted, defineExpose } from 'vue'
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
const filters = ref()

const fetchData = async () => {
  const response = await api.get('/kasir')

  return response.data.items.map((item, index) => ({
    no: index + 1,
    id: item.kasir_id,
    nama: item.kasir_nama.trim(),
  }))
}

const loadData = async () => {
  try {
    loading.value = true
    data.value = await fetchData()
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

// 👉 Tambahkan fungsi ini
const setLoading = (value) => {
  loading.value = value
}

onMounted(() => {
  loadData()
  initFilters()
})

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

// 👉 expose juga fungsi setLoading
defineExpose({ loadData, setLoading })
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
      responsiveLayout="scroll"
      class="p-datatable-sm"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20]"
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
      <Column field="nama" header="Nama" style="width: 50%" :showFilterMatchModes="false">
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
