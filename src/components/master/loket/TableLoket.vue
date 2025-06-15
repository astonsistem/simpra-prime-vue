<script setup>
import { ref, onMounted, defineExpose } from 'vue'
import api from '@/services/http.js'

const data = ref([])
const loading = ref(false)

const fetchData = async () => {
  const response = await api.get('/loket')

  return response.data.items.map((item, index) => ({
    no: index + 1,
    id: item.loket_id,
    nama: item.loket_nama.trim(),
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

const setLoading = (val) => {
  loading.value = val
}

onMounted(() => {
  loadData()
})

defineExpose({ loadData, setLoading })
</script>

<template>
  <div class="card">
    <DataTable
      :value="data"
      :loading="loading"
      responsiveLayout="scroll"
      class="p-datatable-sm"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20]"
    >
      <Column field="no" header="No" style="width: 10%" />
      <Column field="id" header="ID" style="width: 40%" />
      <Column field="nama" header="Nama" style="width: 50%" />
    </DataTable>
  </div>
</template>

<style scoped>
::v-deep(.p-datatable thead th) {
  background-color: #f8fafc;
  color: #000000;
}
</style>
