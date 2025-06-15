<script setup>
import { ref, onMounted, defineExpose, watch } from 'vue'
import api from '@/services/http.js'

const data = ref([])
const loading = ref(false)
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)
const search = ref('')

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
})

defineExpose({ loadData, setLoading: (val) => (loading.value = val) })
</script>

<template>
  <div class="card">
    <div class="mb-4 flex items-center gap-2">
      <input
        v-model="search"
        @keyup.enter="handleSearch"
        type="text"
        placeholder="Cari nama penjamin..."
        class="border px-3 py-2 rounded w-full text-sm"
      />
      <Button
        icon="pi pi-search"
        class="bg-primary text-white px-3 py-2 text-sm"
        @click="handleSearch"
        label="Cari"
      />
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
    >
      <Column field="no" header="No" style="width: 10%" />
      <Column field="id_cara_bayar" header="ID Cara Bayar" style="width: 25%" />
      <Column field="id_penjamin" header="ID Penjamin" style="width: 25%" />
      <Column field="nama_penjamin" header="Nama Penjamin" style="width: 40%" />
    </DataTable>
  </div>
</template>

<style scoped>
::v-deep(.p-datatable thead th) {
  background-color: #f8fafc;
  color: #000000;
}
</style>
