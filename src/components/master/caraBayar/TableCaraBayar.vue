<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/http.js'

const data = ref([])
const loading = ref(false)
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)

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
})

const handleEdit = (item) => {
  console.log('Edit item:', item)
}

const handleDelete = (item) => {
  console.log('Delete item:', item)
}
</script>

<template>
  <div class="card">
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
    >
      <Column field="no" header="No" style="width: 10%" />
      <Column field="id" header="ID" style="width: 40%" />
      <Column field="nama" header="Nama Cara Bayar" style="width: 50%" />
    </DataTable>
  </div>
</template>

<style scoped>
::v-deep(.p-datatable thead th) {
  background-color: #f8fafc;
  color: #000000;
}
</style>
